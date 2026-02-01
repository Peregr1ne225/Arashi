from rest_framework import viewsets
from .models import Avatar, AvatarAsset
from .serializers import AvatarSerializer, AvatarAssetSerializer


class AvatarViewSet(viewsets.ModelViewSet):
    queryset = Avatar.objects.all()
    serializer_class = AvatarSerializer
    lookup_field = "slug"


class AvatarAssetViewSet(viewsets.ModelViewSet):
    queryset = AvatarAsset.objects.all()
    serializer_class = AvatarAssetSerializer
