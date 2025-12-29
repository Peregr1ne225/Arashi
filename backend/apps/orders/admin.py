from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "price"]
    fields = ["product", "quantity", "price"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "full_name",
        "status",
        "total_amount",
        "tracking_number",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = ["user__username", "full_name", "phone_number", "tracking_number"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [OrderItemInline]
    ordering = ["-created_at"]

    fieldsets = (
        (
            "Order Information",
            {"fields": ("user", "full_name", "status", "total_amount")},
        ),
        ("Shipping Information", {"fields": ("phone_number", "shipping_address", "tracking_number")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["id", "order", "product", "quantity", "price", "get_total_price"]
    list_filter = ["order__status"]
    search_fields = ["product__name", "order__id"]
    readonly_fields = ["get_total_price"]

    def get_total_price(self, obj):
        return obj.get_total_price()

    get_total_price.short_description = "Total Price"
