from django.contrib import admin

from .models import (
    Product,
    ProductVariant,
    ProductImage,
)


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = (
        "sku",
        "size",
        "color",
        "price",
        "stock_quantity",
        "is_active",
    )


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = (
        "image",
        "alt_text",
        "position",
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "seller",
        "category",
        "price",
        "discount_price",
        "status",
        "featured",
        "new_arrival",
        "rating",
        "created_at",
    )

    list_filter = (
        "status",
        "featured",
        "new_arrival",
        "category",
        "created_at",
    )

    search_fields = (
        "name",
        "brand",
        "description",
        "seller__store_name",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    autocomplete_fields = (
        "seller",
        "category",
    )

    readonly_fields = (
        "rating",
        "review_count",
        "created_at",
        "updated_at",
    )

    inlines = [
        ProductVariantInline,
        ProductImageInline,
    ]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):

    list_display = (
        "product",
        "sku",
        "size",
        "color",
        "price",
        "stock_quantity",
        "is_active",
    )

    list_filter = (
        "is_active",
        "size",
        "color",
    )

    search_fields = (
        "product__name",
        "sku",
    )

    autocomplete_fields = (
        "product",
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):

    list_display = (
        "product",
        "alt_text",
        "position",
        "created_at",
    )

    list_filter = (
        "position",
        "created_at",
    )

    search_fields = (
        "product__name",
        "alt_text",
    )

    autocomplete_fields = (
        "product",
    )