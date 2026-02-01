from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.products.views import ProductViewSet, ProductReviewViewSet
from apps.cms.views import HeroImageViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r"products", ProductViewSet)
router.register(r"reviews", ProductReviewViewSet, basename="review")
router.register(r"hero", HeroImageViewSet, basename="hero-image")

# API endpoint documentation
urlpatterns = [
    path("", include(router.urls)),
    path("", include("apps.catalog.urls")),
    path("auth/", include("apps.authentication.urls")),
    path("orders/", include("apps.orders.urls")),
    path("cart/", include("apps.cart.urls")),
]

# API Root view information
