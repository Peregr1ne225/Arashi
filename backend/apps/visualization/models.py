from django.core.validators import FileExtensionValidator
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils.text import slugify


def avatar_base_path(instance, filename):
    ext = filename.split(".")[-1]
    return f"avatars/{instance.slug}/base.{ext}"


def avatar_asset_path(instance, filename):
    ext = filename.split(".")[-1]
    return f"avatars/{instance.avatar.slug}/{instance.type}s/{instance.slug}.{ext}"


class Avatar(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    base_file = models.FileField(
        upload_to=avatar_base_path,
        help_text="Upload the base .glb file",
        validators=[FileExtensionValidator(allowed_extensions=["glb"])],
    )
    thumbnail = models.ImageField(
        upload_to="avatars/thumbnails/", blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class AvatarAsset(models.Model):
    ASSET_TYPES = (
        ("shirt", "Shirt"),
        ("pant", "Pant"),
    )

    avatar = models.ForeignKey(Avatar, on_delete=models.CASCADE, related_name="assets")
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, blank=True)
    type = models.CharField(max_length=10, choices=ASSET_TYPES)
    file = models.FileField(
        upload_to=avatar_asset_path,
        help_text="Upload the asset .glb file",
        validators=[FileExtensionValidator(allowed_extensions=["glb"])],
    )
    thumbnail = models.ImageField(
        upload_to="avatars/assets/thumbnails/", blank=True, null=True
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["avatar", "slug"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.avatar.name} - {self.name} ({self.get_type_display()})"


@receiver(post_delete, sender=Avatar)
def cleanup_avatar_files(sender, instance, **kwargs):
    if instance.base_file:
        instance.base_file.delete(save=False)
    if instance.thumbnail:
        instance.thumbnail.delete(save=False)


@receiver(post_delete, sender=AvatarAsset)
def cleanup_asset_files(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)
    if instance.thumbnail:
        instance.thumbnail.delete(save=False)
