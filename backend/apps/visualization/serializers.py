from rest_framework import serializers
from .models import Avatar, AvatarAsset


class AvatarAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvatarAsset
        fields = [
            "id",
            "avatar",
            "name",
            "slug",
            "type",
            "file",
            "thumbnail",
            "description",
        ]
        read_only_fields = ["slug"]


class AvatarSerializer(serializers.ModelSerializer):
    assets = AvatarAssetSerializer(many=True, read_only=True)

    class Meta:
        model = Avatar
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "base_file",
            "thumbnail",
            "assets",
        ]
        read_only_fields = ["slug"]
