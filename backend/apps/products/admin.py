from django.contrib import admin

from .models import Product, ProductImage, ProductReview


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ["image", "display_order"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category",
        "price",
        "rating",
        "review_count",
        "discount_display",
        "stock",
        "is_active",
        "created_at",
    ]
    list_filter = [
        "category",
        "is_active",
        "created_at",
    ]
    search_fields = [
        "name",
        "description",
    ]
    list_editable = [
        "price",
        "stock",
        "is_active",
    ]
    readonly_fields = ["rating", "review_count"]
    prepopulated_fields = {}
    date_hierarchy = "created_at"
    inlines = [ProductImageInline]

    @admin.display(description="Discount (%)")
    def discount_display(self, obj):
        if obj.discount:
            return f"{obj.discount}%"
        return "-"


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ["product", "user", "rating", "created_at"]
    list_filter = ["rating", "created_at"]
    search_fields = ["product__name", "user__username", "comment"]
    autocomplete_fields = ["product", "user"]
