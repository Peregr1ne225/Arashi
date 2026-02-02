from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.products.views import ProductViewSet, ProductReviewViewSet
from apps.cms.views import HeroImageViewSet, SiteContentViewSet
from apps.visualization.views import AvatarViewSet, AvatarAssetViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r"products", ProductViewSet)
router.register(r"reviews", ProductReviewViewSet, basename="review")
router.register(r"hero", HeroImageViewSet, basename="hero-image")
router.register(r"site-content", SiteContentViewSet, basename="site-content")

router.register(r"avatars", AvatarViewSet)
router.register(r"avatar-assets", AvatarAssetViewSet)

# API endpoint documentation
urlpatterns = [
    path("", include(router.urls)),
    path("", include("apps.catalog.urls")),
    path("auth/", include("apps.authentication.urls")),
    path("orders/", include("apps.orders.urls")),
    path("cart/", include("apps.cart.urls")),
    path("blogs/", include("apps.blogs.urls")),
]

# API Root view information
