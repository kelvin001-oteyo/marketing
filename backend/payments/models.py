from django.db import models


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    order = models.OneToOneField(
        "orders.Order",
        on_delete=models.PROTECT,
        related_name="payment",
    )

    phone_number = models.CharField(
        max_length=20,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    merchant_request_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    checkout_request_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    receipt_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    result_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    result_description = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.order.order_number} - "
            f"{self.status}"
        )