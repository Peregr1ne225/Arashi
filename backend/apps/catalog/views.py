from rest_framework import filters, viewsets
from rest_framework.decorators import action
from apps.products.permissions import IsAdminOrReadOnly
from rest_framework.response import Response

from .models import Category, Color, Size, Tag
from django.db.models import Count
from .serializers import (
    CategorySerializer,
    ColorSerializer,
    SizeSerializer,
    TagSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows categories to be viewed or edited.
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
    pagination_class = None

    def get_serializer_class(self):
        """
        Return different serializers for list and detail views.
        """
        if self.action == "retrieve":
            return CategorySerializer
        return CategorySerializer

    @action(detail=True, methods=["get"])
    def products(self, request, pk=None):
        """
        Get all products in a specific category.
        """
        category = self.get_object()
        # Import here to avoid circular imports
        from apps.products.models import Product
        from apps.products.serializers import ProductSerializer

        products = Product.objects.filter(category=category)

        # Filter by active_only if requested
        active_only = self.request.query_params.get("active_only")
        if active_only is not None and active_only.lower() in ("true", "1"):
            products = products.filter(is_active=True)

        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="by-slug/(?P<slug>.+)")
    def by_slug(self, request, slug=None):
        """
        Get a category by its slug path (e.g. parent/child).
        """
        try:
            # specialized logic to handle hierarchical slugs
            slug_parts = [p for p in slug.split("/") if p]
            parent = None
            category = None

            for part in slug_parts:
                category = Category.objects.get(slug=part, parent=parent)
                parent = category

            serializer = CategorySerializer(category)
            return Response(serializer.data)
        except Category.DoesNotExist:
            from rest_framework import status

            return Response(
                {"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND
            )


class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.annotate(product_count=Count("product_colors"))
    serializer_class = ColorSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "code"]
    ordering = ["name"]
    pagination_class = None


class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.annotate(
        product_count=Count("variants__product", distinct=True)
    )
    serializer_class = SizeSerializer
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = SizeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug"]
    ordering = ["ordering", "name"]
    pagination_class = None


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.annotate(product_count=Count("products"))
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "slug"]
    ordering = ["name"]
    pagination_class = None
