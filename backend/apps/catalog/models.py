from django.db import models
from django.utils.text import slugify


from django.db.models.signals import post_delete
from django.dispatch import receiver


def category_image_path(instance, filename):
    """
    Generate a formatted filename for category images.
    Format: categories/category_{id}_{filename}
    If ID is not available (creation), use: categories/category_new_{timestamp}_{filename}
    """
    import time
    ext = filename.split('.')[-1]
    if instance.pk:
        filename = f"category_{instance.pk}.{ext}"
    else:
        # Fallback for new instances that don't have an ID yet
        timestamp = int(time.time())
        filename = f"category_new_{timestamp}.{ext}"
    return f"categories/{filename}"


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )
    image = models.ImageField(upload_to=category_image_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """
        Override save method to automatically generate slug from name.
        This ensures slug is always up-to-date with the name.
        """
        # Generate slug from name if slug is empty or name has changed
        if not self.slug or (
            self.pk and self.name != Category.objects.get(pk=self.pk).name
        ):
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)


@receiver(post_delete, sender=Category)
def cleanup_category_image(sender, instance, **kwargs):
    """
    Delete the image file from the filesystem when the Category object is deleted.
    """
    if instance.image:
        instance.image.delete(save=False)

