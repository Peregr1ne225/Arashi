from rest_framework import serializers
from .models import HeroImage, SiteContent


class HeroImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroImage
        fields = ["id", "title", "image", "is_active", "order", "created_at"]
        read_only_fields = ["created_at"]


class SiteContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContent
        fields = ["key", "content", "updated_at"]
        read_only_fields = ["updated_at"]
