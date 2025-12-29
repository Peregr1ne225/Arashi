from django.contrib.auth import get_user_model
from django.db import models

from apps.products.models import Product

User = get_user_model()


class Order(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    full_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    display_id = models.CharField(max_length=20, editable=False, unique=True, null=True)
    shipping_address = models.TextField()
    phone_number = models.CharField(max_length=20)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    stripe_checkout_session_id = models.CharField(max_length=200, blank=True, null=True)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.display_id or self.id} - {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.display_id:
            import random
            import string
            # Generate random 8-char uppercase alphanumeric string
            while True:
                new_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
                if not Order.objects.filter(display_id=new_id).exists():
                    self.display_id = new_id
                    break
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # Price at time of order

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Order #{self.order.id})"

    def get_total_price(self):
        return self.price * self.quantity
