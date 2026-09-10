from django.contrib import admin
from .models import SellerProfile


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "store_name",
        "user",
        "location",
        "rating",
        "verified",
        "created_at",
    )

    list_filter = (
        "verified",
        "created_at",
    )

    search_fields = (
        "store_name",
        "user__username",
        "user__email",
        "location",
    )

    prepopulated_fields = {
        "store_slug": ("store_name",)
    }