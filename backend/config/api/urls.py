from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.catalog.views import CategoryViewSet
from apps.products.views import ProductViewSet, ProductReviewViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r"products", ProductViewSet)
router.register(r"reviews", ProductReviewViewSet, basename="review")
router.register(r"categories", CategoryViewSet)

# API endpoint documentation
urlpatterns = [
    path("", include(router.urls)),
    path("auth/", include("apps.authentication.urls")),
    path("orders/", include("apps.orders.urls")),
    # path("blogs/", include("apps.blogs.urls")),
    # path("users/", include("apps.users.urls")),
    # path("users/", include("apps.users.urls")),
    path("cart/", include("apps.cart.urls")),
]

# API Root view information
