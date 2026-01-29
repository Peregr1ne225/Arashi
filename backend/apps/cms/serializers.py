from rest_framework import serializers
from .models import HeroImage


class HeroImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroImage
        fields = ["id", "title", "image", "is_active", "order", "created_at"]
        read_only_fields = ["created_at"]
