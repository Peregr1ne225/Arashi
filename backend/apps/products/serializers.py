from rest_framework import serializers

from apps.catalog.models import Category, Tag, Color, Size
from apps.catalog.serializers import SimpleCategorySerializer
from apps.orders.models import Order
from .models import Product, ProductImage, ProductVariant, ProductColor, ProductReview


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "display_order"]


class ProductVariantSerializer(serializers.ModelSerializer):
    size_name = serializers.ReadOnlyField(source="size.name")
    size_slug = serializers.ReadOnlyField(source="size.slug")
    color_name = serializers.ReadOnlyField(source="color.name")
    color_code = serializers.ReadOnlyField(source="color.code")

    size_id = serializers.PrimaryKeyRelatedField(
        queryset=Size.objects.all(), source="size"
    )
    color_id = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), source="color"
    )

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "size_id",
            "size_name",
            "size_slug",
            "color_id",
            "color_name",
            "color_code",
            "stock",
            "is_active",
        ]


class ProductColorSerializer(serializers.ModelSerializer):
    color_name = serializers.ReadOnlyField(source="color.name")
    color_code = serializers.ReadOnlyField(source="color.code")
    color_id = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), source="color"
    )

    class Meta:
        model = ProductColor
        fields = ["id", "color_id", "color_name", "color_code", "image"]


class ProductSerializer(serializers.ModelSerializer):
    category = SimpleCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    discounted_price = serializers.SerializerMethodField()

    # Nested images for reading
    images = ProductImageSerializer(many=True, read_only=True)

    # Field for uploading multiple images (write-only)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(
            max_length=1000000, allow_empty_file=False, use_url=False
        ),
        write_only=True,
        required=False,
    )

    tag_names = serializers.ListField(
        child=serializers.CharField(), required=False, write_only=True
    )
    colors = ProductColorSerializer(many=True, required=False, source="product_colors")

    # Nested variants
    variants = ProductVariantSerializer(many=True, required=False)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["tags"] = [tag.name for tag in instance.tags.all()]
        ret["colors"] = ProductColorSerializer(
            instance.product_colors.all(), many=True
        ).data
        return ret

    deleted_image_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "discount",
            "discounted_price",
            "stock",
            "images",
            "uploaded_images",
            "deleted_image_ids",
            "category",
            "category_id",
            "is_active",
            "created_at",
            "updated_at",
            "sold_count",
            "rating",
            "review_count",
            "tag_names",
            "colors",
            "variants",
        ]
        read_only_fields = [
            "id",
            "stock",
            "created_at",
            "updated_at",
            "sold_count",
            "rating",
            "review_count",
        ]

    def validate_price(self, value):
        """Ensure price is a positive value"""
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive value.")
        return value

    def validate_discount(self, value):
        """Ensure discount is between 0 and 100"""
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Discount must be between 0 and 100.")
        return value

    def get_discounted_price(self, obj):
        """Get the discounted price for the product"""
        return obj.get_discounted_price()

    def to_internal_value(self, data):
        # 1. Extract data into a plain dictionary to avoid QueryDict immutability and pickling quirks
        # We use a clean dictionary and selectively pull values
        internal_data = {}

        # Fields that should stay as lists if the input is a QueryDict
        list_fields = [
            "uploaded_images",
            "tags",
            "tag_names",
            "colors",
            "colors_json",
            "variants",
            "variants_json",
            "deleted_image_ids",
        ]

        if hasattr(data, "getlist"):
            # Input is a QueryDict (typical for FormData)
            for key in data.keys():
                if key in list_fields:
                    internal_data[key] = data.getlist(key)
                else:
                    internal_data[key] = data.get(key)
        else:
            # Input is already a standard dictionary
            internal_data = dict(data)

        # 2. Map frontend field names to serializer field names
        field_mapping = {
            "tags": "tag_names",
            "colors_json": "colors",
            "variants_json": "variants",
        }
        for old_field, new_field in field_mapping.items():
            if old_field in internal_data and new_field not in internal_data:
                internal_data[new_field] = internal_data.pop(old_field)

        import json

        # 3. Pre-parse JSON fields from FormData
        for field in ["tag_names", "variants", "colors"]:
            if field in internal_data:
                val = internal_data[field]
                # If it's a list (common with QueryDict), try to parse the first item if it looks like JSON
                if isinstance(val, list) and len(val) > 0 and isinstance(val[0], str):
                    item = val[0].strip()
                    if (item.startswith("[") and item.endswith("]")) or (
                        item.startswith("{") and item.endswith("}")
                    ):
                        try:
                            parsed = json.loads(item)
                            internal_data[field] = (
                                parsed if isinstance(parsed, list) else [parsed]
                            )
                        except json.JSONDecodeError:
                            pass
                elif isinstance(val, str):
                    item = val.strip()
                    if (item.startswith("[") and item.endswith("]")) or (
                        item.startswith("{") and item.endswith("}")
                    ):
                        try:
                            parsed = json.loads(item)
                            internal_data[field] = (
                                parsed if isinstance(parsed, list) else [parsed]
                            )
                        except json.JSONDecodeError:
                            pass

        # 4. Filter empty entries from uploaded_images (common with FormData/Multiple inputs)
        if "uploaded_images" in internal_data:
            images = internal_data["uploaded_images"]
            if isinstance(images, list):
                # Filter out strings (like "") but keep file objects
                internal_data["uploaded_images"] = [
                    img for img in images if not isinstance(img, str)
                ]

        return super().to_internal_value(internal_data)

    def create(self, validated_data):
        # Safely extract nested data
        uploaded_images = validated_data.pop("uploaded_images", [])
        tags_data = validated_data.pop("tag_names", [])
        variants_data = validated_data.pop("variants", [])
        colors_data = validated_data.pop("product_colors", [])

        # Remove deleted_image_ids if present (not used in create)
        validated_data.pop("deleted_image_ids", None)

        # Create the core product
        product = super().create(validated_data)

        # 1. Handle uploaded images
        if uploaded_images:
            for index, image in enumerate(uploaded_images):
                ProductImage.objects.create(
                    product=product, image=image, display_order=index
                )

        # 2. Handle tags
        if tags_data:
            tags = []
            for tag_name in tags_data:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                tags.append(tag)
            product.tags.set(tags)

        # 3. Handle colors with optional images
        if colors_data:
            request = self.context.get("request")
            for color_item in colors_data:
                color_obj = color_item.get("color")
                if color_obj:
                    # Check for color image in request.FILES (color_image_{id})
                    image_to_use = None
                    if request and request.FILES:
                        image_key = f"color_image_{color_obj.id}"
                        if image_key in request.FILES:
                            image_to_use = request.FILES[image_key]

                    ProductColor.objects.create(
                        product=product, color=color_obj, image=image_to_use
                    )

        # 4. Handle variants
        if variants_data:
            for variant_item in variants_data:
                size_obj = variant_item.get("size")
                color_obj = variant_item.get("color")
                stock = variant_item.get("stock", 0)
                is_active = variant_item.get("is_active", True)

                if size_obj and color_obj:
                    ProductVariant.objects.create(
                        product=product,
                        size=size_obj,
                        color=color_obj,
                        stock=stock,
                        is_active=is_active,
                    )

        return product

    def update(self, instance, validated_data):
        # Safely extract nested data
        uploaded_images = validated_data.pop("uploaded_images", [])
        deleted_image_ids = validated_data.pop("deleted_image_ids", [])
        tags_data = validated_data.pop("tag_names", None)
        variants_data = validated_data.pop("variants", None)
        colors_data = validated_data.pop("product_colors", None)

        # Update base product fields
        product = super().update(instance, validated_data)

        # 1. Handle image deletions
        if deleted_image_ids:
            ProductImage.objects.filter(
                product=product, id__in=deleted_image_ids
            ).delete()

        # 2. Append new images
        if uploaded_images:
            current_count = instance.images.count()
            for index, image in enumerate(uploaded_images):
                ProductImage.objects.create(
                    product=product, image=image, display_order=current_count + index
                )

        # 3. Handle tags
        if tags_data is not None:
            tags = []
            for tag_name in tags_data:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                tags.append(tag)
            product.tags.set(tags)

        # 4. Handle colors update
        if colors_data is not None:
            # Stash existing images: map color_id -> image file
            existing_images = {
                pc.color_id: pc.image
                for pc in instance.product_colors.all()
                if pc.image
            }

            # Clear existing relations
            instance.product_colors.all().delete()

            # Recreate with new or stashed images
            request = self.context.get("request")
            for color_item in colors_data:
                color_obj = color_item.get("color")
                if color_obj:
                    # Check for new upload in request.FILES (color_image_{id})
                    image_to_use = None
                    if request and request.FILES:
                        image_key = f"color_image_{color_obj.id}"
                        if image_key in request.FILES:
                            image_to_use = request.FILES[image_key]

                    # If no new upload, try to restore from stash
                    if not image_to_use and color_obj.id in existing_images:
                        image_to_use = existing_images[color_obj.id]

                    ProductColor.objects.create(
                        product=product, color=color_obj, image=image_to_use
                    )

        # 5. Handle variants update
        if variants_data is not None:
            instance.variants.all().delete()
            for variant_item in variants_data:
                size_obj = variant_item.get("size")
                color_obj = variant_item.get("color")
                stock = variant_item.get("stock", 0)
                is_active = variant_item.get("is_active", True)

                if size_obj and color_obj:
                    ProductVariant.objects.create(
                        product=product,
                        size=size_obj,
                        color=color_obj,
                        stock=stock,
                        is_active=is_active,
                    )

        # Clear prefetch cache
        if hasattr(product, "_prefetched_objects_cache"):
            product._prefetched_objects_cache = {}

        return product


class ProductDetailSerializer(ProductSerializer):
    """Detailed serializer for single product view with additional fields if needed"""

    pass


class ProductReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source="user.username")
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())

    class Meta:
        model = ProductReview
        fields = [
            "id",
            "user",
            "user_username",
            "product",
            "order",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
