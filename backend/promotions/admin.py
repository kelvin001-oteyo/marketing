from django.contrib import admin

from .models import Promotion


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "discount_type",
        "discount_value",
        "start_date",
        "end_date",
        "is_active",
        "usage_count",
        "usage_limit",
        "created_at",
    )

    list_filter = (
        "discount_type",
        "is_active",
        "start_date",
        "end_date",
        "created_at",
    )

    search_fields = (
        "name",
        "slug",
        "description",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    readonly_fields = (
        "usage_count",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Promotion Information",
            {
                "fields": (
                    "name",
                    "slug",
                    "description",
                    "is_active",
                )
            },
        ),
        (
            "Discount",
            {
                "fields": (
                    "discount_type",
                    "discount_value",
                    "minimum_order_amount",
                    "maximum_discount_amount",
                )
            },
        ),
        (
            "Schedule",
            {
                "fields": (
                    "start_date",
                    "end_date",
                )
            },
        ),
        (
            "Usage",
            {
                "fields": (
                    "usage_limit",
                    "usage_count",
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

    ordering = (
        "-created_at",
    )