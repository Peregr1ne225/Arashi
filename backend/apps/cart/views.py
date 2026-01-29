from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.products.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


class CartViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_cart(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def list(self, request):
        cart = self.get_cart()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    def check_stock(
        self, product, quantity, color_id=None, size_id=None, current_quantity=0
    ):
        """
        Check if the requested quantity is available in stock.
        Returns (bool, str): (is_available, error_message)
        """
        stock = (
            product.stock
        )  # This is now the calculated sum property, helpful for non-variant products

        # If variant specified, check specific variant stock
        if color_id or size_id:
            # Try to find the specific variant
            # Note: We need to filter the product.variants relation
            variants = product.variants.all()
            if color_id:
                variants = variants.filter(color_id=color_id)
            if size_id:
                variants = variants.filter(size_id=size_id)

            variant = variants.first()
            if variant:
                stock = variant.stock
            else:
                # Variant not found?
                return False, "Selected variation is not available."

        if quantity > stock:
            return False, f"Sorry, only {stock} items available."

        return True, ""

    @action(detail=False, methods=["post"])
    def items(self, request):
        """Add item to cart"""
        cart = self.get_cart()
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))
        color_id = request.data.get("color_id")
        size_id = request.data.get("size_id")

        if not product_id:
            return Response(
                {"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(Product, id=product_id)

        # Build lookup
        criteria = {
            "cart": cart,
            "product": product,
            "color_id": color_id,
            "size_id": size_id,
        }

        # Check existing quantity to add validation correctly
        try:
            existing_item = CartItem.objects.get(**criteria)
            current_qty = existing_item.quantity
        except CartItem.DoesNotExist:
            current_qty = 0

        # Validate Stock
        is_available, error_msg = self.check_stock(
            product, current_qty + quantity, color_id, size_id
        )
        if not is_available:
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(
            **criteria, defaults={"quantity": 0}
        )

        if created:
            cart_item.quantity = quantity
        else:
            cart_item.quantity += quantity

        cart_item.save()

        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=True, methods=["patch", "delete"])
    def item(self, request, pk=None):
        """
        Update or remove item.
        """
        cart = self.get_cart()
        # Ensure item belongs to this cart
        cart_item = get_object_or_404(CartItem, pk=pk, cart=cart)

        if request.method == "DELETE":
            cart_item.delete()
            return Response(self.get_serializer(cart).data)

        if request.method == "PATCH":
            quantity = request.data.get("quantity")
            if quantity is not None:
                quantity = int(quantity)
                if quantity > 0:
                    # Validate Stock
                    is_available, error_msg = self.check_stock(
                        cart_item.product,
                        quantity,
                        cart_item.color_id,
                        cart_item.size_id,
                    )
                    if not is_available:
                        return Response(
                            {"error": error_msg}, status=status.HTTP_400_BAD_REQUEST
                        )

                    cart_item.quantity = quantity
                    cart_item.save()
                else:
                    cart_item.delete()

            return Response(self.get_serializer(cart).data)

    @action(detail=False, methods=["post"])
    def clear(self, request):
        cart = self.get_cart()
        cart.items.all().delete()
        return Response(self.get_serializer(cart).data)
