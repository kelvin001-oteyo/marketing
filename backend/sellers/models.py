from django.conf import settings
from django.db import models
from django.utils.text import slugify


class SellerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seller_profile",
    )

    store_name = models.CharField(max_length=150)
    store_slug = models.SlugField(max_length=180, unique=True, blank=True)

    description = models.TextField(blank=True)

    logo = models.ImageField(
        upload_to="sellers/logos/",
        blank=True,
        null=True,
    )

    banner = models.ImageField(
        upload_to="sellers/banners/",
        blank=True,
        null=True,
    )

    location = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
    )

    verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.store_slug:
            self.store_slug = slugify(self.store_name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.store_name