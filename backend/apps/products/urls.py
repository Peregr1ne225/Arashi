from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.products import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r"reviews", views.ProductReviewViewSet, basename="review")
router.register(r"", views.ProductViewSet, basename="product")

# API endpoints are automatically determined by the router
urlpatterns = [
    path("", include(router.urls)),
]
