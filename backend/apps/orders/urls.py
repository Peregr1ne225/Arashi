from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import OrderItemViewSet, OrderViewSet, stripe_webhook

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r"items", OrderItemViewSet, basename="order-item")
router.register(r"orders", OrderViewSet, basename="order")

# The API URLs are now determined automatically by the router
urlpatterns = [
    path("webhook/", stripe_webhook, name="stripe-webhook"),
    path("", include(router.urls)),
]
