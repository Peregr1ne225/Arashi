from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CartViewSet

router = DefaultRouter()

# We use explicit URL mapping for precise control over the singleton Cart resource
# and its sub-resources (items), rather than relying on standard Router behavior
# which is optimized for list/detail collections.

# Explicit mapping is safer for "Singleton" resources.

cart_list = CartViewSet.as_view(
    {
        "get": "list",
    }
)

cart_items = CartViewSet.as_view(
    {
        "post": "items",
    }
)

cart_item_detail = CartViewSet.as_view({"patch": "item", "delete": "item"})

cart_clear = CartViewSet.as_view({"post": "clear"})

urlpatterns = [
    path("", cart_list, name="cart-detail"),
    path("items/", cart_items, name="cart-items"),
    path("items/<int:pk>/", cart_item_detail, name="cart-item-detail"),  # pk is Item ID
    path("clear/", cart_clear, name="cart-clear"),
]
