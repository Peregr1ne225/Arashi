from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import UserProfile
from .serializers import (
    UserProfileSerializer,
    UserSerializer,
    UserProfileDetailSerializer,
)


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


# Admin User Management Views


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited (admin only).
    Matches ProductViewSet style.
    """

    permission_classes = [permissions.IsAdminUser]

    def get_serializer_class(self):
        if self.action == "create":
            return UserSerializer
        return UserProfileDetailSerializer

    def get_queryset(self):
        queryset = User.objects.all().select_related("profile").order_by("-date_joined")

        # Search
        search = self.request.query_params.get("search")
        if search:
            queryset = (
                queryset.filter(username__icontains=search)
                | queryset.filter(email__icontains=search)
                | queryset.filter(first_name__icontains=search)
                | queryset.filter(last_name__icontains=search)
            )

        # Filters
        is_staff = self.request.query_params.get("is_staff")
        if is_staff is not None:
            queryset = queryset.filter(is_staff=is_staff.lower() == "true")

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        # Ordering
        ordering = self.request.query_params.get("ordering")
        if ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Create profile
        UserProfile.objects.create(user=user)
        # Return full details
        headers = self.get_success_headers(serializer.data)
        profile_serializer = UserProfileDetailSerializer(user)
        return Response(
            profile_serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # Prevent self-modification of admin status
        if request.user.id == instance.id and request.data.get("is_staff") is not None:
            return Response(
                {"error": "You cannot modify your own admin status"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Prevent self-deletion
        if request.user.id == instance.id:
            return Response(
                {"error": "You cannot delete your own account"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        self.perform_destroy(instance)
        return Response(
            {"message": "User deleted successfully"}, status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"], url_path="toggle-status")
    def toggle_status(self, request, pk=None):
        """
        Toggle user active status.
        """
        user = self.get_object()

        # Prevent self-deactivation
        if request.user.id == user.id:
            return Response(
                {"error": "You cannot deactivate your own account"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = not user.is_active
        user.save()
        serializer = UserProfileDetailSerializer(user)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="toggle-admin")
    def toggle_admin(self, request, pk=None):
        """
        Toggle user staff status.
        """
        user = self.get_object()

        # Prevent self-modification
        if request.user.id == user.id:
            return Response(
                {"error": "You cannot modify your own admin status"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_staff = not user.is_staff
        user.save()
        serializer = UserProfileDetailSerializer(user)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="toggle-superuser")
    def toggle_superuser(self, request, pk=None):
        """
        Toggle user superuser status.
        """
        if not request.user.is_superuser:
            return Response(
                {"error": "You must be a superuser to perform this action"},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = self.get_object()

        # Prevent self-modification
        if request.user.id == user.id:
            return Response(
                {"error": "You cannot modify your own superuser status"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_superuser = not user.is_superuser
        user.save()
        serializer = UserProfileDetailSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """
        Get global user statistics.
        """
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        admin_users = User.objects.filter(is_staff=True).count()
        superuser_users = User.objects.filter(is_superuser=True).count()

        return Response(
            {
                "total_users": total_users,
                "active_users": active_users,
                "admin_users": admin_users,
                "superuser_users": superuser_users,
            }
        )
