from rest_framework import serializers

from apps.products.models import Product
from apps.products.serializers import ProductSerializer

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True, source="product"
    )

    is_rated = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_id", "quantity", "price", "is_rated"]
        read_only_fields = ["id", "is_rated"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be a positive integer.")
        return value

    def get_is_rated(self, obj):
        # Check if the user has reviewed this product for this order
        # We need to import inside method to avoid potential circular imports if any
        # though ProductReview is in products app.
        from apps.products.models import ProductReview
        
        # We can use the pre-fetched reviews if we optimize later, 
        # but for now a simple query is safest.
        # obj.order should be available.
        return ProductReview.objects.filter(
            order=obj.order, 
            product=obj.product
        ).exists()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "display_id",
            "user",
            "full_name",
            "status",
            "total_amount",
            "shipping_address",
            "phone_number",
            "tracking_number",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = ["id", "user", "status", "tracking_number", "created_at", "updated_at"]

    def validate_full_name(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Full name must be at least 3 characters long."
            )
        return value.strip()

    def validate_phone_number(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Phone number must be at least 10 characters long."
            )
        return value.strip()

    def validate_shipping_address(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Shipping address must be at least 10 characters long."
            )
        return value.strip()

    def validate_total_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Total amount must be a positive value.")
        return value


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer specifically for creating orders with items"""

    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "full_name",
            "total_amount",
            "shipping_address",
            "phone_number",
            "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user

        order = Order.objects.create(user=user, **validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order

    def validate(self, data):
        """Validate that order items match the total amount"""
        items = data.get("items", [])
        total_amount = data.get("total_amount", 0)

        calculated_total = sum(item["price"] * item["quantity"] for item in items)

        # Allow small differences due to floating point calculations
        if abs(float(calculated_total) - float(total_amount)) > 0.01:
            raise serializers.ValidationError(
                f"Total amount ({total_amount}) does not match the sum of item prices ({calculated_total})."
            )

        return data
