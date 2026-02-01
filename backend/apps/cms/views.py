from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import HeroImage, SiteContent
from .serializers import HeroImageSerializer, SiteContentSerializer


class HeroImageViewSet(viewsets.ModelViewSet):
    queryset = HeroImage.objects.all()
    serializer_class = HeroImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ["is_active"]

    def get_queryset(self):
        queryset = super().get_queryset()
        # If public (not authenticated or not staff), show only active images
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset


class SiteContentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for generic site content.
    Lookup field is 'key' so we can do /api/v1/site-content/homepage_hero/
    """

    queryset = SiteContent.objects.all()
    serializer_class = SiteContentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "key"
