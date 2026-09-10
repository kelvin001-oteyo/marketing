from django.db import models
from django.utils.text import slugify


class Promotion(models.Model):

    class DiscountType(models.TextChoices):
        PERCENTAGE = "PERCENTAGE", "Percentage"
        FIXED = "FIXED", "Fixed Amount"

    name = models.CharField(max_length=150)

    code = models.CharField(
        max_length=50,
        unique=True,
    )

    slug = models.SlugField(
        max_length=180,
        unique=True,
        blank=True,
    )

    description = models.TextField(
        blank=True,
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE,
    )

    discount_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    start_date = models.DateTimeField()

    end_date = models.DateTimeField()

    is_active = models.BooleanField(
        default=True,
    )

    minimum_order_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    maximum_discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    usage_limit = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    usage_count = models.PositiveIntegerField(
        default=0,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        from django.utils import timezone

        return timezone.now() > self.end_date

    @property
    def has_started(self):
        from django.utils import timezone

        return timezone.now() >= self.start_date

    @property
    def is_available(self):
        if not self.is_active:
            return False

        if not self.has_started:
            return False

        if self.is_expired:
            return False

        if (
            self.usage_limit is not None
            and self.usage_count >= self.usage_limit
        ):
            return False

        return True

    def __str__(self):
        return self.name
