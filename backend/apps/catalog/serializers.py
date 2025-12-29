from django.utils.text import slugify
from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model.
    """

    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "parent",
            "image",
            "created_at",
            "updated_at",
            "children",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_children(self, obj):
        """
        Get all children categories for this category.
        """
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []

    def update(self, instance, validated_data):
        """
        Update category and automatically update slug if name changes.
        """
        # Check if name is being updated
        if "name" in validated_data and validated_data["name"] != instance.name:
            # Generate new slug from the new name
            validated_data["slug"] = slugify(validated_data["name"])

        # Call the parent update method
        return super().update(instance, validated_data)

    def create(self, validated_data):
        """
        Create category and automatically generate slug from name.
        """
        # Generate slug from name if not provided
        if "slug" not in validated_data or not validated_data["slug"]:
            validated_data["slug"] = slugify(validated_data["name"])

        # Call the parent create method
        return super().create(validated_data)



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
