from django.contrib import admin
from .models import Cart, CartItem

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    raw_id_fields = ('product',)

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'updated_at', 'total_items_display', 'total_price_display')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'id')
    inlines = [CartItemInline]
    readonly_fields = ('created_at', 'updated_at')

    def total_items_display(self, obj):
        return obj.total_items
    total_items_display.short_description = 'Total Items'

    def total_price_display(self, obj):
        return obj.total_price
    total_price_display.short_description = 'Total Price'

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'product', 'quantity')
    # list_filter = ('created_at', 'updated_at') # Fields do not exist on CartItem
    search_fields = ('cart__user__username', 'product__name')
    raw_id_fields = ('cart', 'product')
