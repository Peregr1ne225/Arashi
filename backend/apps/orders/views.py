import logging
import time
import stripe
from django.db import transaction, DatabaseError
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Order, OrderItem
from .serializers import OrderCreateSerializer, OrderItemSerializer, OrderSerializer
from apps.products.models import Product

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for the Order model"""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'display_id'

    def get_object(self):
        """
        Override get_object to allow lookup by both pk (id) and display_id.
        """
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)

        obj = None
        
        # Try lookup by ID first if value is integer-like
        if lookup_value and lookup_value.isdigit():
            try:
                obj = queryset.get(id=lookup_value)
            except Order.DoesNotExist:
                pass
        
        # If not found or not integer, try display_id
        if not obj:
            filter_kwargs = {self.lookup_field: lookup_value}
            try:
                obj = queryset.get(**filter_kwargs)
            except Order.DoesNotExist:
                pass
        
        if not obj:
             from rest_framework.exceptions import NotFound
             raise NotFound(f"Order with identifier {lookup_value} not found.")

        # Check object permissions
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        user = self.request.user
        mode = self.request.query_params.get("mode")
        
        if user.is_staff or user.is_superuser:
            # For list action without admin mode, restrict to own orders (My Orders view)
            if self.action == 'list' and mode != 'admin':
                return Order.objects.filter(user=user)
            # For all other cases (admin list, retrieve, update, custom actions), allow all
            return Order.objects.all()
            
        return Order.objects.filter(user=user)

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        """
        Create Order with Stock Check Transaction.
        1. Validate Input
        2. ATOMIC TRANSACTION:
           a. Create Order (Pending)
           b. Iterate Items & Lock Rows (select_for_update)
           c. Check Stock & Decrement
        3. Create Stripe Session
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # 1. Create order object
                order = serializer.save()

                # 2. Reserve Stock & Prepare Stripe Line Items
                line_items = self._reserve_stock_and_get_line_items(order, request)

                # 3. Create Stripe Session
                checkout_session = self._create_stripe_session(order, line_items)
                
                # Save session ID to order
                order.stripe_checkout_session_id = checkout_session.id
                order.save()

            return Response({
                "checkout_url": checkout_session.url
            }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            # Stock error (transaction auto-rolled back)
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # General error
            print(f"Checkout Error: {e}")
            return Response({"detail": "An error occurred while processing the order."}, status=status.HTTP_400_BAD_REQUEST)

    def _reserve_stock_and_get_line_items(self, order, request):
        """
        Iterates through order items, locks product rows, checks stock,
        decrements stock, and returns formatted line items for Stripe.
        Raises ValueError if stock is insufficient.
        """
        line_items = []
        for item in order.items.all():
            # Lock row to prevent race conditions
            product = Product.objects.select_for_update().get(id=item.product.id)

            if product.stock < item.quantity:
                raise ValueError(f"Insufficient stock for {product.name}. Only {product.stock} left.")

            # Decrement stock
            product.stock -= item.quantity
            product.save()

            # Add to Stripe line items
            line_items.append({
                'price_data': {
                    'currency': 'thb',
                    'product_data': {
                        'name': product.name,
                        'images': [request.build_absolute_uri(product.main_image.url)] if product.main_image else [],
                    },
                    'unit_amount': int(item.price * 100),
                },
                'quantity': item.quantity,
            })
        return line_items

    def _create_stripe_session(self, order, line_items):
        """Helper to create Stripe Checkout Session"""
        base_url = settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else "http://localhost:3000"
        
        return stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f"{base_url}/checkout/success?order_id={order.display_id}",
            cancel_url=f"{base_url}/checkout/cancel?order_id={order.display_id}",
            client_reference_id=str(order.id),
            expires_at=int(time.time() + (30 * 60)),  # 30 mins
            metadata={
                "order_id": order.id,
                "display_id": order.display_id
            }
        )

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, *args, **kwargs):
        """Cancel an order and restore stock"""
        order = self.get_object()

        if order.status != "pending":
            return Response(
                {"error": "Only pending orders can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Restore Stock
        for item in order.items.all():
            product = item.product
            product.stock += item.quantity
            product.save()

        order.status = "cancelled"
        order.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="pay")
    def pay(self, request, *args, **kwargs):
        """Retrieve checkout URL for pending order"""
        order = self.get_object()

        if order.status != "pending":
            return Response(
                {"error": "Only pending orders can be paid for."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        if not order.stripe_checkout_session_id:
             return Response(
                {"error": "No checkout session found for this order."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            session = stripe.checkout.Session.retrieve(order.stripe_checkout_session_id)
            return Response({"checkout_url": session.url})
        except stripe.error.StripeError as e:
             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, *args, **kwargs):
        """Update order status (Admin only)"""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )
        
        order = self.get_object()
        new_status = request.data.get("status")
        
        if not new_status:
            return Response(
                {"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST
            )
            
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="tracking")
    def update_tracking(self, request, *args, **kwargs):
        """Update order tracking number (Admin only)"""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )
        
        order = self.get_object()
        tracking_number = request.data.get("tracking_number")
        
        if tracking_number is None:
             return Response(
                {"error": "Tracking number is required"}, status=status.HTTP_400_BAD_REQUEST
            )
            
        order.tracking_number = tracking_number
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)


from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

@csrf_exempt
def stripe_webhook(request):
    
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        order_id = session.get('client_reference_id')
        
        try:
            order = Order.objects.get(id=order_id)
            # Stock is ALREADY decremented at creation.
            # Just mark paid.
            if not order.is_paid:
                order.is_paid = True
                order.status = 'processing'
                order.save()

                # Increment sold_count for each product
                for item in order.items.all():
                    product = item.product
                    product.sold_count += item.quantity
                    product.save()
            
        except Order.DoesNotExist:
            return HttpResponse(status=404)
            
    elif event['type'] == 'checkout.session.expired':
         session = event['data']['object']
         order_id = session.get('client_reference_id')
         try:
            order = Order.objects.get(id=order_id)
            if order.status == 'pending':
                # Expired -> Cancel and Restore Stock
                for item in order.items.all():
                    product = item.product
                    product.stock += item.quantity
                    product.save()
                
                order.status = 'cancelled'
                order.save()
         except Order.DoesNotExist:
            pass

    return HttpResponse(status=200)


class OrderItemViewSet(viewsets.ReadOnlyModelViewSet):
    """ReadOnly ViewSet for the OrderItem model"""

    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter by user through the order relationship
        return OrderItem.objects.filter(order__user=self.request.user)
