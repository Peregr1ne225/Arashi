from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Case, DecimalField, F, Q, When, Sum, Count, Avg, Max, Min
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models.functions import Coalesce

from .models import Product, ProductVariant, ProductReview
from .permissions import IsAdminOrReadOnly
from .serializers import (
    ProductDetailSerializer,
    ProductSerializer,
    ProductVariantSerializer,
    ProductReviewSerializer,
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
        queryset = (
            Product.objects.select_related("category")
            .annotate(
                final_price=Case(
                    When(discount__gt=0, then=F("price") * (1 - F("discount") / 100.0)),
                    default=F("price"),
                    output_field=DecimalField(max_digits=10, decimal_places=2),
                ),
                total_stock_level=Coalesce(
                    Sum("variants__stock", filter=Q(variants__is_active=True)), 0
                ),
            )
            .distinct()
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
        featured = (
            Product.objects.select_related("category")
            .filter(is_active=True)
            .order_by("-created_at")[:10]
        )
        serializer = ProductSerializer(featured, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def new_arrivals(self, request):
        """
        Get new arrivals (most recently created products).
        """
        limit = int(request.query_params.get("limit", 10))
        new_arrivals = (
            Product.objects.select_related("category")
            .filter(is_active=True)
            .order_by("-created_at")[:limit]
        )
        serializer = ProductSerializer(new_arrivals, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def bestsellers(self, request):
        """
        Get bestseller products.
        Shows products even if out of stock, but filters out inactive products.
        """
        limit = int(request.query_params.get("limit", 10))
        bestsellers = (
            Product.objects.select_related("category")
            .filter(is_active=True)
            .order_by("-sold_count")[:limit]
        )
        serializer = ProductSerializer(bestsellers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], pagination_class=None)
    def stats(self, request):
        """
        Get statistics for the current filtered queryset (min/max price).
        This ignores pagination and price filters to provide the full range for the slider.
        """
        # Reuse base queryset logic but skip price filtering to get the full range
        queryset = Product.objects.annotate(
            final_price=Case(
                When(discount__gt=0, then=F("price") * (1 - F("discount") / 100.0)),
                default=F("price"),
                output_field=DecimalField(max_digits=10, decimal_places=2),
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

        # Calculate totals from variants
        # total_stock = sum of variants' stock
        # total_value = sum of (product.final_price * variant.stock)
        # low_stock_count = count of products where sum(variants.stock) < 10

        # We need a separate aggregate or subquery for low_stock_count because it's an aggregate of an aggregate
        low_stock_count = (
            queryset.annotate(ts=Sum("variants__stock"))
            .filter(Q(ts__lt=10) | Q(ts__isnull=True))
            .count()
        )

        stats = queryset.aggregate(
            min_price=Coalesce(Min("final_price"), Decimal("0")),
            max_price=Coalesce(Max("final_price"), Decimal("1000")),
            total_count=Count("id"),
            total_stock=Coalesce(Sum("variants__stock"), 0),
            total_value=Coalesce(
                Sum(
                    F("final_price") * F("variants__stock"),
                    output_field=DecimalField(max_digits=20, decimal_places=2),
                ),
                Decimal("0"),
            ),
            avg_price=Coalesce(Avg("final_price"), Decimal("0")),
            active_count=Count("id", filter=Q(is_active=True)),
        )

        return Response(
            {
                "min_price": stats["min_price"],
                "max_price": stats["max_price"],
                "total_count": stats["total_count"] or 0,
                "total_stock": stats["total_stock"],
                "total_value": stats["total_value"],
                "avg_price": stats["avg_price"],
                "active_count": stats["active_count"] or 0,
                "low_stock_count": low_stock_count,
                "category_ids": list(
                    queryset.values_list("category_id", flat=True).distinct()
                ),
            }
        )

    @action(detail=False, methods=["get"], pagination_class=None)
    def low_stock(self, request):
        """
        Get products with low stock (total variant stock < 10).
        Returns a list of products for dashboard low stock alerts.
        """
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )

        # Annotate products with their total stock across all variants
        products = (
            Product.objects.annotate(total_stock=Coalesce(Sum("variants__stock"), 0))
            .filter(Q(total_stock__lt=10) | Q(total_stock__isnull=True))
            .filter(is_active=True)
            .order_by("total_stock")[:10]  # Top 10 low stock products
        )

        # Return minimal data for dashboard display
        result = []
        for product in products:
            result.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "stock": product.total_stock or 0,
                    "main_image": request.build_absolute_uri(
                        product.images.first().image.url
                    )
                    if product.images.exists()
                    else None,
                }
            )

        return Response(result)

    @action(detail=True, methods=["post"])
    def add_variant(self, request, pk=None):
        """
        Add or update a variant for a specific product.
        Payload: { "color_id": int, "size_id": int, "stock": int }
        If variant exists, stock is UPDATED (replaced).
        """
        product = self.get_object()

        color_id = request.data.get("color_id")
        size_id = request.data.get("size_id")
        stock = request.data.get("stock")
        is_active = request.data.get("is_active")

        if not color_id or not size_id:
            return Response(
                {"error": "Both color_id and size_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update or Create
        defaults = {}
        if stock is not None:
            defaults["stock"] = stock
        if is_active is not None:
            defaults["is_active"] = is_active

        variant, created = ProductVariant.objects.update_or_create(
            product=product, color_id=color_id, size_id=size_id, defaults=defaults
        )

        # If new variant, ensure ProductColor entry exists if likely needed for frontend consistency
        # (Optional but good practice if ProductColor tracks visible colors)
        if created:
            # Check if this color is already associated
            from .models import ProductColor

            if not ProductColor.objects.filter(
                product=product, color_id=color_id
            ).exists():
                ProductColor.objects.create(product=product, color_id=color_id)

        serializer = ProductVariantSerializer(variant)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def remove_variant(self, request, pk=None):
        """
        Remove a specific variant from a product.
        Payload: { "color_id": int, "size_id": int }
        """
        product = self.get_object()
        color_id = request.data.get("color_id")
        size_id = request.data.get("size_id")

        if not color_id or not size_id:
            return Response(
                {"error": "Both color_id and size_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            variant = ProductVariant.objects.get(
                product=product, color_id=color_id, size_id=size_id
            )
            variant.delete()
            return Response(
                {"message": "Variant removed successfully."}, status=status.HTTP_200_OK
            )
        except ProductVariant.DoesNotExist:
            return Response(
                {"error": "Variant not found."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def update_color_image(self, request, pk=None):
        """
        Update the image for a specific product color.
        Payload: { "color_id": int, "image": file }
        Deletes the old image file if it exists.
        """
        product = self.get_object()
        color_id = request.data.get("color_id")
        image_file = request.FILES.get("image")

        if not color_id or not image_file:
            return Response(
                {"error": "Both color_id and image are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from .models import ProductColor

        try:
            product_color = ProductColor.objects.get(product=product, color_id=color_id)

            # Delete old image if it exists
            if product_color.image:
                import os

                if os.path.isfile(product_color.image.path):
                    os.remove(product_color.image.path)

            product_color.image = image_file
            product_color.save()

            from .serializers import ProductColorSerializer

            return Response(
                ProductColorSerializer(product_color).data, status=status.HTTP_200_OK
            )
        except ProductColor.DoesNotExist:
            # Create if it doesn't exist? Typically created when variant is added.
            product_color = ProductColor.objects.create(
                product=product, color_id=color_id, image=image_file
            )
            from .serializers import ProductColorSerializer

            return Response(
                ProductColorSerializer(product_color).data,
                status=status.HTTP_201_CREATED,
            )


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
        product = serializer.validated_data["product"]
        order = serializer.validated_data["order"]

        # 1. Check if order belongs to user
        if order.user != user:
            raise serializers.ValidationError("This order does not belong to you.")

        # 2. Check status: Must be shipped or delivered
        if (
            order.status not in ["shipped", "delivered", "completed"]
        ):  # Assuming 'completed' might exist, but 'shipped'/'delivered' per user request
            # Also allow 'delivered' as shipped implies on the way, delivered is better.
            pass
            # Wait, user said "orders for product that have shipped status".
            # Does that mean EXACTLY 'shipped'? Usually 'delivered' is when you rate.
            # I will allow 'shipped' OR 'delivered'.

        if order.status not in ["shipped", "delivered"]:
            raise serializers.ValidationError(
                "You can only rate products from shipped or delivered orders."
            )

        # 3. Check if product is in order
        # We need to check OrderItems
        has_product = order.items.filter(product=product).exists()
        if not has_product:
            raise serializers.ValidationError(
                "This product is not part of the specified order."
            )

        # 4. Check if already rated (UniqueTogether handles it, but user-friendly error)
        if ProductReview.objects.filter(order=order, product=product).exists():
            raise serializers.ValidationError(
                "You have already rated this product for this order."
            )

        serializer.save(user=user)
