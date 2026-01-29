from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

router = DefaultRouter()
router.register(r"users", views.UserViewSet, basename="user")

urlpatterns = [
    path("token/", views.TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", views.register, name="register"),
    path("profile/", views.profile, name="profile"),
    path("profile/update/", views.update_profile, name="update_profile"),
    path("change-password/", views.change_password, name="change_password"),
    path(
        "users/stats/", views.UserViewSet.as_view({"get": "stats"}), name="user-stats"
    ),
    # Admin user management
    path("", include(router.urls)),
]
