from rest_framework import serializers

from apps.catalog.models import Color, Size
from apps.products.serializers import ProductSerializer

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    color_id = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), source="color", required=False, allow_null=True
    )
    size_id = serializers.PrimaryKeyRelatedField(
        queryset=Size.objects.all(), source="size", required=False, allow_null=True
    )

    color_name = serializers.CharField(source="color.name", read_only=True)
    size_name = serializers.CharField(source="size.name", read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_id",
            "quantity",
            "total_price",
            "color_id",
            "size_id",
            "color_name",
            "size_name",
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "total_price", "total_items"]
