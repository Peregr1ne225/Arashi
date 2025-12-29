from rest_framework import filters, permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Case, F, When, DecimalField

from apps.catalog.models import Category

from .models import Product
from .permissions import IsAdminOrReadOnly
from .serializers import (
    ProductDetailSerializer,
    ProductSerializer,
)

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing products.
    """

    queryset = Product.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = ProductSerializer

    def get_serializer_class(self):
        """
        Return different serializers for list and detail views.
        """
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned products to active ones,
        by filtering against an `active_only` query parameter in the URL.
        Also allows filtering by category and price range.
        Handles search query.
        """
        # Annotate final_price for sorting
        queryset = Product.objects.select_related("category").annotate(
            final_price=Case(
                When(discount__gt=0, then=F('price') * (1 - F('discount') / 100.0)),
                default=F('price'),
                output_field=DecimalField(max_digits=10, decimal_places=2)
            )
        )

        # Handle active_only (default to True for non-staff)
        active_only = self.request.query_params.get("active_only")
        if not self.request.user.is_staff:
             queryset = queryset.filter(is_active=True)
        elif active_only is not None and active_only.lower() in ("true", "1"):
            queryset = queryset.filter(is_active=True)

        # Filter by "New Arrivals"
        is_new = self.request.query_params.get("is_new")
        if is_new is not None and is_new.lower() in ("true", "1"):
            from datetime import timedelta
            from django.utils import timezone
            thirty_days_ago = timezone.now() - timedelta(days=30)
            queryset = queryset.filter(created_at__gte=thirty_days_ago)

        # Filter by "Sale"
        is_sale = self.request.query_params.get("is_sale")
        if is_sale is not None and is_sale.lower() in ("true", "1"):
            queryset = queryset.filter(discount__gt=0)
        
        # Handle search query
        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(name__icontains=q) | queryset.filter(
                description__icontains=q
            )
            
        # Filter by category
        category_id = self.request.query_params.get("category")
        if category_id is not None:
            queryset = queryset.filter(category_id=category_id)

        # Filter by price range (using annotated final_price)
        min_price = self.request.query_params.get("min_price")
        if min_price is not None:
            queryset = queryset.filter(final_price__gte=min_price)

        max_price = self.request.query_params.get("max_price")
        if max_price is not None:
            queryset = queryset.filter(final_price__lte=max_price)
        
        # Handle ordering
        ordering = self.request.query_params.get("ordering")
        if ordering:
            queryset = queryset.order_by(ordering)

        if q:
            queryset = queryset.distinct()
        
        return queryset

    @action(detail=False, methods=["get"])
    def featured(self, request):
        """
        Get featured products (can be customized based on business logic).
        For now, this will return the 10 most recently created active products.
        """
        featured = Product.objects.select_related("category").filter(is_active=True).order_by("-created_at")[:10]
        serializer = ProductSerializer(featured, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def new_arrivals(self, request):
        """
        Get new arrivals (most recently created products).
        """
        limit = int(request.query_params.get("limit", 10))
        new_arrivals = Product.objects.select_related("category").filter(is_active=True).order_by("-created_at")[
            :limit
        ]
        serializer = ProductSerializer(new_arrivals, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def bestsellers(self, request):
        """
        Get bestseller products.
        """
        limit = int(request.query_params.get("limit", 10))
        bestsellers = Product.objects.select_related("category").filter(is_active=True).order_by("-sold_count")[
            :limit
        ]
        serializer = ProductSerializer(bestsellers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """
        Get statistics for the current filtered queryset (min/max price).
        This ignores pagination and price filters to provide the full range for the slider.
        """
        # Reuse base queryset logic but skip price filtering to get the full range
        queryset = Product.objects.annotate(
            final_price=Case(
                When(discount__gt=0, then=F('price') * (1 - F('discount') / 100.0)),
                default=F('price'),
                output_field=DecimalField(max_digits=10, decimal_places=2)
            )
        )

        # Apply standard filters (Active, Category, Search) - COPY of get_queryset logic
        # Handle active_only (default to True for non-staff)
        active_only = self.request.query_params.get("active_only")
        if not self.request.user.is_staff:
             queryset = queryset.filter(is_active=True)
        elif active_only is not None and active_only.lower() in ("true", "1"):
            queryset = queryset.filter(is_active=True)

        # Handle search query
        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(name__icontains=q) | queryset.filter(
                description__icontains=q
            )
            
        # Filter by category
        category_id = self.request.query_params.get("category")
        if category_id is not None:
            queryset = queryset.filter(category_id=category_id)
            
        category_slug = self.request.query_params.get("category_slug")
        if category_slug is not None:
            # We need to filter by category slug if provided (common in frontend)
            queryset = queryset.filter(category__slug=category_slug)

        # IMPORTANT: We purposefully DO NOT apply min_price/max_price filters here
        # because the slider needs the GLOBAL range, not the filtered range.

        from django.db.models import Max, Min
        stats = queryset.aggregate(
            min_price=Min('final_price'),
            max_price=Max('final_price')
        )
        
        return Response({
            "min_price": stats['min_price'] or 0,
            "max_price": stats['max_price'] or 1000, # Default if no products
            "category_ids": list(queryset.values_list('category_id', flat=True).distinct())
        })


from .models import ProductReview
from .serializers import ProductReviewSerializer

class ProductReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProductReviewSerializer

    def get_queryset(self):
        # Users can only see their own reviews? Or all? 
        # Typically everyone can see reviews so `all()`.
        # But for editing/deleting, permissions handle it.
        # For listing "my reviews", we can filter.
        return ProductReview.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        product = serializer.validated_data['product']
        order = serializer.validated_data['order']
        
        # 1. Check if order belongs to user
        if order.user != user:
            raise serializers.ValidationError("This order does not belong to you.")
            
        # 2. Check status: Must be shipped or delivered
        if order.status not in ['shipped', 'delivered', 'completed']: # Assuming 'completed' might exist, but 'shipped'/'delivered' per user request
             # Also allow 'delivered' as shipped implies on the way, delivered is better.
             pass 
             # Wait, user said "orders for product that have shipped status". 
             # Does that mean EXACTLY 'shipped'? Usually 'delivered' is when you rate.
             # I will allow 'shipped' OR 'delivered'.
        
        if order.status not in ['shipped', 'delivered']:
             raise serializers.ValidationError("You can only rate products from shipped or delivered orders.")
             
        # 3. Check if product is in order
        # We need to check OrderItems
        has_product = order.items.filter(product=product).exists()
        if not has_product:
             raise serializers.ValidationError("This product is not part of the specified order.")
             
        # 4. Check if already rated (UniqueTogether handles it, but user-friendly error)
        if ProductReview.objects.filter(order=order, product=product).exists():
            raise serializers.ValidationError("You have already rated this product for this order.")

        serializer.save(user=user)
