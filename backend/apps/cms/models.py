from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver


class HeroImage(models.Model):
    title = models.CharField(
        max_length=255, blank=True, help_text="Optional title for the image (alt text)"
    )
    image = models.ImageField(upload_to="hero/")
    is_active = models.BooleanField(
        default=True, help_text="Show this image in the carousel"
    )
    order = models.PositiveIntegerField(
        default=0, help_text="Order of display (ascending)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Hero Image"
        verbose_name_plural = "Hero Images"

    def __str__(self):
        return self.title or f"Hero Image {self.id}"


@receiver(post_delete, sender=HeroImage)
def cleanup_hero_image(sender, instance, **kwargs):
    """
    Delete the image file from the filesystem when the HeroImage object is deleted.
    """
    if instance.image:
        instance.image.delete(save=False)
