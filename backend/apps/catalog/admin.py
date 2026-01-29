from django.contrib import admin
from .models import Category, Tag, Color, Size


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Admin configuration for Category model.
    """

    list_display = ("name", "slug", "image", "parent", "created_at", "updated_at")
    list_filter = ("created_at", "updated_at", "parent")
    search_fields = ("name", "description", "slug")
    prepopulated_fields = {"slug": ("name",)}
    raw_id_fields = ("parent",)

    # Customizing the fieldsets for better organization
    fieldsets = (
        (None, {"fields": ("name", "slug", "image", "description", "parent")}),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    readonly_fields = ("created_at", "updated_at")


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "created_at"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "created_at"]
    search_fields = ["name", "code"]


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "ordering", "created_at"]
    list_editable = ["ordering"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}
