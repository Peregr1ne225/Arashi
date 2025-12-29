from rest_framework import serializers

from apps.catalog.models import Category
from apps.catalog.serializers import SimpleCategorySerializer

from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        use_url=True
    )  # Return full URL instead of relative path

    class Meta:
        model = ProductImage
        fields = ["id", "image", "display_order"]


class ProductSerializer(serializers.ModelSerializer):
    category = SimpleCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
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

    # Backward compatibility field (read-only)
    main_image = serializers.SerializerMethodField()

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
            "main_image",
            "category",
            "category_id",
            "is_active",
            "created_at",
            "updated_at",
            "sold_count",
            "rating",
            "review_count",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "sold_count",
            "rating",
            "review_count",
        ]

    def get_main_image(self, obj):
        if obj.main_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.main_image.url)
            return obj.main_image.url
        return None

    def validate_price(self, value):
        """Ensure price is a positive value"""
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive value.")
        return value

    def validate_stock(self, value):
        """Ensure stock is a non-negative value"""
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value

    def validate_discount(self, value):
        """Ensure discount is between 0 and 100"""
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Discount must be between 0 and 100.")
        return value

    def get_discounted_price(self, obj):
        """Get the discounted price for the product"""
        return obj.get_discounted_price()

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        product = super().create(validated_data)

        # Create ProductImage entries
        for index, image in enumerate(uploaded_images):
            ProductImage.objects.create(
                product=product, image=image, display_order=index
            )

        return product

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        product = super().update(instance, validated_data)

        # Append new images if any
        if uploaded_images:
            current_count = instance.images.count()
            for index, image in enumerate(uploaded_images):
                ProductImage.objects.create(
                    product=product, image=image, display_order=current_count + index
                )

        return product


class ProductDetailSerializer(ProductSerializer):
    """Detailed serializer for single product view with additional fields if needed"""

    pass


from apps.orders.models import Order

from .models import ProductReview


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
