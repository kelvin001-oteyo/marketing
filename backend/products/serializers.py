from rest_framework import serializers

from .models import Product, ProductVariant, ProductImage


class ProductVariantSerializer(serializers.ModelSerializer):
    current_price = serializers.ReadOnlyField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "product",
            "sku",
            "size",
            "color",
            "price",
            "current_price",
            "stock_quantity",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "product",
            "current_price",
            "created_at",
            "updated_at",
        ]

    def validate_sku(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "SKU cannot be empty."
            )

        queryset = ProductVariant.objects.filter(
            sku__iexact=value
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "A variant with this SKU already exists."
            )

        return value

    def validate_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Variant price cannot be negative."
            )

        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Stock quantity cannot be negative."
            )

        return value


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            "id",
            "product",
            "image",
            "alt_text",
            "position",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "product",
            "created_at",
        ]

    def validate_position(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Image position cannot be negative."
            )

        return value


class ProductSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(
        source="seller.store_name",
        read_only=True
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    current_price = serializers.ReadOnlyField()

    variants = ProductVariantSerializer(
        many=True,
        read_only=True
    )

    images = ProductImageSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "seller",
            "seller_name",
            "category",
            "category_name",
            "name",
            "slug",
            "description",
            "brand",
            "price",
            "discount_price",
            "current_price",
            "featured",
            "new_arrival",
            "status",
            "rating",
            "review_count",
            "variants",
            "images",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "slug",
            "seller_name",
            "category_name",
            "current_price",
            "rating",
            "review_count",
            "variants",
            "images",
            "created_at",
            "updated_at",
        ]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Price cannot be negative."
            )

        return value

    def validate_discount_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Discount price cannot be negative."
            )

        return value

    def validate(self, attrs):
        price = attrs.get(
            "price",
            getattr(self.instance, "price", None)
        )

        discount_price = attrs.get(
            "discount_price",
            getattr(self.instance, "discount_price", None)
        )

        if (
            discount_price is not None
            and price is not None
            and discount_price >= price
        ):
            raise serializers.ValidationError(
                {
                    "discount_price": (
                        "Discount price must be lower than "
                        "the original price."
                    )
                }
            )

        return attrs


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "seller",
            "category",
            "name",
            "description",
            "brand",
            "price",
            "discount_price",
            "featured",
            "new_arrival",
            "status",
        ]

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Product name must contain at least 2 characters."
            )

        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Price cannot be negative."
            )

        return value

    def validate_discount_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Discount price cannot be negative."
            )

        return value

    def validate(self, attrs):
        price = attrs.get("price")
        discount_price = attrs.get("discount_price")

        if (
            discount_price is not None
            and discount_price >= price
        ):
            raise serializers.ValidationError(
                {
                    "discount_price": (
                        "Discount price must be lower than "
                        "the original price."
                    )
                }
            )

        return attrs