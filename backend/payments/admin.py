from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "phone_number",
        "amount",
        "status",
        "receipt_number",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "order__order_number",
        "phone_number",
        "transaction_id",
        "receipt_number",
        "checkout_request_id",
    )

    readonly_fields = (
        "transaction_id",
        "merchant_request_id",
        "checkout_request_id",
        "receipt_number",
        "result_code",
        "result_description",
        "created_at",
        "updated_at",
    )