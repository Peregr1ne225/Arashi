from django.contrib import admin

from .models import Product, ProductImage, ProductReview, ProductVariant, ProductColor


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ["image", "display_order"]


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ["color", "size", "stock"]


class ProductColorInline(admin.TabularInline):
    model = ProductColor
    extra = 1
    fields = ["color", "image"]


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
        "is_active",
    ]
    readonly_fields = ["rating", "review_count"]
    filter_horizontal = ["tags"]
    prepopulated_fields = {}
    date_hierarchy = "created_at"
    inlines = [ProductImageInline, ProductVariantInline, ProductColorInline]

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
