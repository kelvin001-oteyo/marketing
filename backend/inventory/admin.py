from django.contrib import admin

from .models import (
    InventoryRecord,
    InventoryTransaction,
)


@admin.register(InventoryRecord)
class InventoryRecordAdmin(admin.ModelAdmin):

    list_display = (
        "product_name",
        "sku",
        "size",
        "color",
        "quantity",
        "reserved_quantity",
        "available_quantity_display",
        "stock_status",
        "low_stock_threshold",
        "updated_at",
    )

    list_filter = (
        "updated_at",
    )

    search_fields = (
        "variant__product__name",
        "variant__sku",
        "variant__size",
        "variant__color",
    )

    readonly_fields = (
        "available_quantity_display",
        "stock_status",
        "updated_at",
    )

    autocomplete_fields = (
        "variant",
    )

    ordering = (
        "-updated_at",
    )

    def product_name(self, obj):
        return obj.variant.product.name

    product_name.short_description = "Product"

    def sku(self, obj):
        return obj.variant.sku

    sku.short_description = "SKU"

    def size(self, obj):
        return obj.variant.size or "-"

    size.short_description = "Size"

    def color(self, obj):
        return obj.variant.color or "-"

    color.short_description = "Color"

    def available_quantity_display(self, obj):
        return obj.available_quantity

    available_quantity_display.short_description = "Available"

    def stock_status(self, obj):
        if obj.is_out_of_stock:
            return "OUT OF STOCK"

        if obj.is_low_stock:
            return "LOW STOCK"

        return "IN STOCK"

    stock_status.short_description = "Status"


@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):

    list_display = (
        "product_name",
        "sku",
        "transaction_type",
        "quantity",
        "reference",
        "created_at",
    )

    list_filter = (
        "transaction_type",
        "created_at",
    )

    search_fields = (
        "inventory__variant__product__name",
        "inventory__variant__sku",
        "reference",
        "notes",
    )

    readonly_fields = (
        "inventory",
        "transaction_type",
        "quantity",
        "reference",
        "notes",
        "created_at",
    )

    autocomplete_fields = (
        "inventory",
    )

    ordering = (
        "-created_at",
    )

    def product_name(self, obj):
        return obj.inventory.variant.product.name

    product_name.short_description = "Product"

    def sku(self, obj):
        return obj.inventory.variant.sku

    sku.short_description = "SKU"