from rest_framework import serializers

from .models import Category, Tag, Color, Size


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model.
    """

    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    parent_name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "parent",
            "parent_name",
            "image",
            "created_at",
            "updated_at",
            "children",
            "product_count",
        ]

        read_only_fields = ["created_at", "updated_at", "slug", "product_count"]

    def to_internal_value(self, data):
        # 1. Extract data into a plain dictionary to avoid QueryDict quirks
        internal_data = {}
        if hasattr(data, "getlist"):
            for key in data.keys():
                # Fields that might be lists in FormData
                if key in ["image"]:
                    internal_data[key] = data.get(key)
                else:
                    internal_data[key] = data.get(key)
        else:
            internal_data = dict(data)

        # 2. Handle empty image strings
        if "image" in internal_data and isinstance(internal_data["image"], str):
            if internal_data["image"] == "":
                internal_data["image"] = None

        # 3. Handle 'null' or empty strings for 'parent' field from FormData
        if "parent" in internal_data:
            val = internal_data["parent"]
            if val == "" or val == "null" or val == "None":
                internal_data["parent"] = None

        return super().to_internal_value(internal_data)

    def get_parent_name(self, obj):
        return obj.parent.name if obj.parent else None

    def get_product_count(self, obj):
        return obj.products.count()

    def get_children(self, obj):
        """
        Get all children categories for this category.
        """
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []


class SimpleCategorySerializer(serializers.ModelSerializer):
    """
    Simple/Minimal serializer for Category to avoid recursion overhead.
    """

    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class CategoryDetailSerializer(CategorySerializer):
    """
    Detailed serializer for single category view with products
    """

    products = serializers.SerializerMethodField()

    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields + ["products"]

    def get_products(self, obj):
        """
        Get all products in this category.
        """
        # Import here to avoid circular imports
        from apps.products.models import Product
        from apps.products.serializers import ProductSerializer

        # Get active products in this category
        products = Product.objects.filter(category=obj, is_active=True)
        return ProductSerializer(products, many=True).data

    def get_children(self, obj):
        """
        Get all children categories for this category.
        """
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []


class SizeSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Size
        fields = ["id", "name", "slug", "ordering", "product_count"]


class ColorSerializer(serializers.ModelSerializer):
    # Rename fields to match frontend expectation (or update frontend)
    # Frontend expects: id, color_name, color_code
    # Model has: name, code
    color_name = serializers.CharField(source="name", read_only=True)
    color_code = serializers.CharField(source="code", read_only=True)
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Color
        fields = ["id", "name", "code", "color_name", "color_code", "product_count"]


class TagSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Tag
        fields = ["id", "name", "slug", "product_count"]
