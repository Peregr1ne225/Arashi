from django.db import models
from django.conf import settings
from apps.products.models import Product


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart {self.id} ({self.user.username if self.user else 'Anonymous'})"

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    color = models.ForeignKey(
        "catalog.Color", on_delete=models.SET_NULL, null=True, blank=True
    )
    size = models.ForeignKey(
        "catalog.Size", on_delete=models.SET_NULL, null=True, blank=True
    )
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("cart", "product", "color", "size")
        ordering = ["id"]

    def __str__(self):
        variant = ""
        if self.color:
            variant += f" {self.color.name}"
        if self.size:
            variant += f" {self.size.name}"
        return f"{self.quantity} x {self.product.name}{variant}"

    @property
    def total_price(self):
        return self.quantity * self.product.get_discounted_price()
