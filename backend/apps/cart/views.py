from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from apps.products.models import Product

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

    @action(detail=False, methods=['post'])
    def items(self, request):
        """Add item to cart"""
        cart = self.get_cart()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 0}
        )
        
        if created:
             cart_item.quantity = quantity
        else:
             cart_item.quantity += quantity
             
        cart_item.save()

        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=True, methods=['patch', 'delete'])
    def item(self, request, pk=None):
        """
        Update or remove item. 
        """
        cart = self.get_cart()
        # Ensure item belongs to this cart
        cart_item = get_object_or_404(CartItem, pk=pk, cart=cart)

        if request.method == 'DELETE':
            cart_item.delete()
            return Response(self.get_serializer(cart).data)
        
        if request.method == 'PATCH':
            quantity = request.data.get('quantity')
            if quantity is not None:
                quantity = int(quantity)
                if quantity > 0:
                    cart_item.quantity = quantity
                    cart_item.save()
                else:
                    cart_item.delete()
            
            return Response(self.get_serializer(cart).data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart = self.get_cart()
        cart.items.all().delete()
        return Response(self.get_serializer(cart).data)
