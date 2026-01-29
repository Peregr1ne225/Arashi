from decimal import Decimal
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.db.models import Avg


def product_image_path(instance, filename):
    """
    Generate a formatted filename for product images.
    Format: products/{product_id}_{image_id}.{ext}
    """
    import time

    ext = filename.split(".")[-1]

    product_id = instance.product.pk if instance.product.pk else "new"

    if instance.pk:
        filename = f"{product_id}_{instance.pk}.{ext}"
    else:
        # Fallback for new instances that don't have an ID yet
        timestamp = int(time.time())
        filename = f"{product_id}_{timestamp}.{ext}"
    return f"products/{filename}"


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Discount percentage (0-100)",
    )
    sold_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=0.00, help_text="Average rating (0-5)"
    )
    review_count = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(
        "catalog.Category", on_delete=models.CASCADE, related_name="products"
    )
    tags = models.ManyToManyField("catalog.Tag", related_name="products", blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

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

    @property
    def stock(self):
        # Sum stock of all active variants
        total_variant_stock = self.variants.filter(is_active=True).aggregate(
            models.Sum("stock")
        )["stock__sum"]
        return total_variant_stock or 0


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
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="reviews"
    )
    user = models.ForeignKey(
        "auth.User", on_delete=models.CASCADE, related_name="reviews"
    )
    # Use string reference to avoid circular import with orders app
    order = models.ForeignKey(
        "orders.Order", on_delete=models.CASCADE, related_name="product_reviews"
    )

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


def product_color_image_path(instance, filename):
    """
    Generate a formatted filename for product color images.
    Format: products/colors/{product_id}_{color_slug}.{ext}
    """
    from django.utils.text import slugify

    ext = filename.split(".")[-1]
    product_id = instance.product.pk if instance.product.pk else "new"
    color_slug = slugify(instance.color.name)

    filename = f"{product_id}_{color_slug}.{ext}"
    return f"products/colors/{filename}"


class ProductColor(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="product_colors"
    )
    color = models.ForeignKey(
        "catalog.Color", on_delete=models.PROTECT, related_name="product_colors"
    )
    image = models.ImageField(upload_to=product_color_image_path, blank=True, null=True)

    class Meta:
        ordering = ["color__name"]
        unique_together = ["product", "color"]

    def __str__(self):
        return f"{self.product.name} - {self.color.name}"


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="variants"
    )
    size = models.ForeignKey(
        "catalog.Size", on_delete=models.PROTECT, related_name="variants"
    )
    color = models.ForeignKey(
        "catalog.Color", on_delete=models.PROTECT, related_name="variants"
    )
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["size__ordering"]
        unique_together = ["product", "size", "color"]

    def __str__(self):
        return f"{self.product.name} - {self.color.name} - {self.size.name} ({self.stock}) - {'Active' if self.is_active else 'Inactive'}"
