from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

    fields = (
        "product",
        "variant",
        "seller",
        "quantity",
        "unit_price",
        "total_price",
        "created_at",
    )

    readonly_fields = (
        "total_price",
        "created_at",
    )

    autocomplete_fields = (
        "product",
        "variant",
        "seller",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "order_number",
        "customer_name",
        "customer_phone",
        "total_amount",
        "payment_status",
        "order_status",
        "created_at",
    )

    list_filter = (
        "payment_status",
        "order_status",
        "created_at",
    )

    search_fields = (
        "order_number",
        "user__username",
        "user__email",
        "shipping_full_name",
        "shipping_phone",
        "shipping_address",
        "shipping_city",
        "shipping_county",
    )

    readonly_fields = (
        "order_number",
        "user",
        "subtotal",
        "shipping_fee",
        "discount",
        "total_amount",
        "created_at",
        "updated_at",
    )

    autocomplete_fields = (
        "user",
    )

    fieldsets = (
        (
            "Order Information",
            {
                "fields": (
                    "order_number",
                    "user",
                    "order_status",
                    "payment_status",
                )
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "subtotal",
                    "shipping_fee",
                    "discount",
                    "total_amount",
                )
            },
        ),
        (
            "Shipping Information",
            {
                "fields": (
                    "shipping_full_name",
                    "shipping_phone",
                    "shipping_address",
                    "shipping_city",
                    "shipping_county",
                    "notes",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    inlines = [
        OrderItemInline,
    ]

    ordering = (
        "-created_at",
    )

    def customer_name(self, obj):
        return obj.shipping_full_name or obj.user.get_full_name() or obj.user.username

    customer_name.short_description = "Customer"

    def customer_phone(self, obj):
        return obj.shipping_phone or obj.user.phone_number

    customer_phone.short_description = "Phone"