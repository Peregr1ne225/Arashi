from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.products.views import ProductViewSet, ProductReviewViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r"products", ProductViewSet)
router.register(r"reviews", ProductReviewViewSet, basename="review")

# API endpoint documentation
urlpatterns = [
    path("", include(router.urls)),
    path("", include("apps.catalog.urls")),
    path("auth/", include("apps.authentication.urls")),
    path("orders/", include("apps.orders.urls")),
    path("cart/", include("apps.cart.urls")),
]

# API Root view information
