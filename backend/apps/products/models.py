from decimal import Decimal
from django.db import models
from django.db.models import DecimalField
from django.db.models.signals import post_delete
from django.dispatch import receiver



def product_image_path(instance, filename):
    """
    Generate a formatted filename for product images.
    Format: products/product_{id}_{filename}
    If ID is not available (creation), use: products/product_new_{timestamp}_{filename}
    """
    import time
    ext = filename.split('.')[-1]
    if instance.pk:
        filename = f"product_{instance.pk}.{ext}"
    else:
        # Fallback for new instances that don't have an ID yet
        timestamp = int(time.time())
        filename = f"product_new_{timestamp}.{ext}"
    return f"products/{filename}"

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Discount percentage (0-100)",
    )
    sold_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, help_text="Average rating (0-5)")
    review_count = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    # image and image_url are removed in favor of ProductImage model
    category = models.ForeignKey(
        "catalog.Category", on_delete=models.CASCADE, related_name="products"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def main_image(self):
        """Return the first image for backward compatibility"""
        first_image = self.images.first()
        if first_image:
            return first_image.image
        return None

    @property
    def discounted_price(self):
        """Calculate the discounted price if a discount is set"""
        if self.discount and self.discount > 0:
            return float(self.price) * (1 - self.discount / 100)
        return float(self.price)

    def get_discounted_price(self):
        """Get the discounted price as a Decimal for API responses"""
        if self.discount and self.discount > 0:
            return self.price * (Decimal("1") - self.discount / Decimal("100"))
        return self.price


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to=product_image_path)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order", "created_at"]

    def __str__(self):
        return f"Image for {self.product.name}"


@receiver(post_delete, sender=ProductImage)
def cleanup_product_image(sender, instance, **kwargs):
    """
    Delete the image file from the filesystem when the ProductImage object is deleted.
    """
    if instance.image:
        instance.image.delete(save=False)


class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE, related_name="reviews")
    # Use string reference to avoid circular import with orders app
    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE, related_name="product_reviews")
    
    rating = models.PositiveSmallIntegerField(default=5, help_text="Rating from 1 to 5")
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        # Ensure one review per product per order
        unique_together = ["order", "product"]

    def __str__(self):
        return f"{self.rating}★ - {self.product.name} ({self.user.username})"


# Signals to update Product rating automatically
from django.db.models import Avg

@receiver(models.signals.post_save, sender=ProductReview)
@receiver(models.signals.post_delete, sender=ProductReview)
def update_product_rating(sender, instance, **kwargs):
    product = instance.product
    reviews = product.reviews.all()
    
    # Calculate new aggregates
    if reviews.exists():
        product.review_count = reviews.count()
        product.rating = reviews.aggregate(Avg("rating"))["rating__avg"] or 0
    else:
        product.review_count = 0
        product.rating = 0
        
    product.save(update_fields=["rating", "review_count"])

