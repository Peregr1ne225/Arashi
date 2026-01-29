from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ColorViewSet, SizeViewSet, TagViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"colors", ColorViewSet)
router.register(r"sizes", SizeViewSet)
router.register(r"tags", TagViewSet)

# The API URLs are now determined automatically by the router
urlpatterns = [
    path("", include(router.urls)),
]
