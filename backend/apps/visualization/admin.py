from django.contrib import admin
from .models import Avatar, AvatarAsset


class AvatarAssetInline(admin.TabularInline):
    model = AvatarAsset
    extra = 1


@admin.register(Avatar)
class AvatarAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [AvatarAssetInline]


@admin.register(AvatarAsset)
class AvatarAssetAdmin(admin.ModelAdmin):
    list_display = ("name", "avatar", "type", "created_at")
    list_filter = ("avatar", "type")
    prepopulated_fields = {"slug": ("name",)}
