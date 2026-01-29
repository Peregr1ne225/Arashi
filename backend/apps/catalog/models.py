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

    ext = filename.split(".")[-1]
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
        unique_together = (("parent", "slug"),)

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
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            # Check for collisions among siblings (same parent)
            # Exclude self from check if updating
            qs = Category.objects.filter(parent=self.parent, slug=slug)
            if self.pk:
                qs = qs.exclude(pk=self.pk)

            while qs.exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
                qs = Category.objects.filter(parent=self.parent, slug=slug)
                if self.pk:
                    qs = qs.exclude(pk=self.pk)

            self.slug = slug

        super().save(*args, **kwargs)


@receiver(post_delete, sender=Category)
def cleanup_category_image(sender, instance, **kwargs):
    """
    Delete the image file from the filesystem when the Category object is deleted.
    """
    if instance.image:
        instance.image.delete(save=False)


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Color(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=20, help_text="Hex code, e.g. #FF0000")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class Size(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    ordering = models.IntegerField(
        default=0, help_text="Order for sorting (e.g. 0 for S, 10 for M)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["ordering", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
