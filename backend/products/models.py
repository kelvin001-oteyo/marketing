from django.db import models
from django.utils.text import slugify


class Product(models.Model):

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE = "ACTIVE", "Active"
        OUT_OF_STOCK = "OUT_OF_STOCK", "Out of Stock"
        ARCHIVED = "ARCHIVED", "Archived"

    seller = models.ForeignKey(
        "sellers.SellerProfile",
        on_delete=models.CASCADE,
        related_name="products",
    )

    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.PROTECT,
        related_name="products",
    )

    name = models.CharField(max_length=200)

    slug = models.SlugField(
        max_length=230,
        unique=True,
        blank=True,
    )

    description = models.TextField()

    brand = models.CharField(
        max_length=100,
        blank=True,
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    discount_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    featured = models.BooleanField(default=False)

    new_arrival = models.BooleanField(default=False)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
    )

    review_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    @property
    def current_price(self):
        if self.discount_price is not None:
            return self.discount_price

        return self.price

    def __str__(self):
        return self.name


class ProductVariant(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
    )

    sku = models.CharField(
        max_length=100,
        unique=True,
    )

    size = models.CharField(
        max_length=50,
        blank=True,
    )

    color = models.CharField(
        max_length=50,
        blank=True,
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    stock_quantity = models.PositiveIntegerField(default=0)

    image = models.ImageField(
        upload_to="products/variants/",
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["product", "size", "color"]

    def __str__(self):
        variant = []

        if self.size:
            variant.append(self.size)

        if self.color:
            variant.append(self.color)

        details = " / ".join(variant)

        if details:
            return f"{self.product.name} - {details}"

        return self.product.name

    @property
    def current_price(self):
        if self.price is not None:
            return self.price

        return self.product.current_price


class ProductImage(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )

    image = models.ImageField(
        upload_to="products/",
    )

    alt_text = models.CharField(
        max_length=255,
        blank=True,
    )

    position = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["position", "created_at"]

    def __str__(self):
        return f"{self.product.name} image"