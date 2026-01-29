from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import HeroImage
from .serializers import HeroImageSerializer


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
