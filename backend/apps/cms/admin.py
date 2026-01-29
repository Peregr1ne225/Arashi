from django.contrib import admin
from django.utils.html import format_html
from .models import HeroImage


@admin.register(HeroImage)
class HeroImageAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "title_display",
        "image_preview",
        "order",
        "is_active",
        "created_at",
    ]
    list_filter = ["is_active", "created_at"]
    search_fields = ["title"]
    list_editable = ["order", "is_active"]
    readonly_fields = ["created_at"]

    def title_display(self, obj):
        return obj.title or "(No Title)"

    title_display.short_description = "Title"

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; border-radius: 4px;" />',
                obj.image.url,
            )
        return "-"

    image_preview.short_description = "Preview"
