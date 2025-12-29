from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import UserProfile
from .serializers import UserProfileSerializer, UserSerializer


class TokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view that extends the default one
    """

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # Add user info to the response
        if response.status_code == 200:
            try:
                username = request.data.get("username")
                user = User.objects.get(username=username)
                serializer = UserProfileSerializer(user)
                response.data.update({"user": serializer.data})
            except User.DoesNotExist:
                pass

        return response


class TokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view
    """

    pass


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    """
    Register a new user
    """
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    """
    Get user profile information
    """
    try:
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        # Create a profile if it doesn't exist
        UserProfile.objects.create(user=request.user)
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


@api_view(["PUT", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """
    Update user profile
    """
    try:
        # Get or create the user profile
        try:
            user_profile = request.user.profile
        except UserProfile.DoesNotExist:
            user_profile = UserProfile.objects.create(user=request.user)

        # Update user fields
        if "first_name" in request.data:
            request.user.first_name = request.data["first_name"]
        if "last_name" in request.data:
            request.user.last_name = request.data["last_name"]
        if "email" in request.data:
            request.user.email = request.data["email"]
        request.user.save()

        # Update profile fields
        if "phone_number" in request.data:
            user_profile.phone_number = request.data["phone_number"]
        if "address" in request.data:
            user_profile.address = request.data["address"]
        user_profile.save()

        # Return updated user data
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    except UserProfile.DoesNotExist as e:
        return Response(
            {"error": f"User profile not found: {str(e)}"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        import traceback

        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc() if settings.DEBUG else None,
        }
        return Response(error_details, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    from .serializers import ChangePasswordSerializer

    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.data.get("old_password")):
            return Response(
                {"old_password": ["Wrong password."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.data.get("new_password"))
        user.save()
        return Response(
            {"message": "Password updated successfully"}, status=status.HTTP_200_OK
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
