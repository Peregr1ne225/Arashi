from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "password")

    # Check email is unique
    def validate_email(self, value):
        if self.instance and self.instance.email == value:
            return value
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return user


# User Profile
class UserProfileSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(
        source="profile.phone_number", required=False, allow_blank=True
    )
    address = serializers.CharField(
        source="profile.address", required=False, allow_blank=True
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "address",
            "is_staff",
            "is_superuser",
        )


# Admin Panel User
class UserProfileDetailSerializer(serializers.ModelSerializer):
    """Extended serializer for admin user management with full details"""

    phone_number = serializers.CharField(
        source="profile.phone_number", required=False, allow_blank=True
    )
    address = serializers.CharField(
        source="profile.address", required=False, allow_blank=True
    )
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "address",
            "is_staff",
            "is_superuser",
            "is_active",
            "date_joined",
            "last_login",
        )
        read_only_fields = ("id", "date_joined", "last_login")


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, data):
        if data["new_password"] != data["confirm_new_password"]:
            raise serializers.ValidationError(
                {"confirm_new_password": "New passwords must match"}
            )
        return data
