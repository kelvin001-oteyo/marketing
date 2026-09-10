from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    product_slug = serializers.CharField(
        source="product.slug",
        read_only=True,
    )

    sku = serializers.CharField(
        source="variant.sku",
        read_only=True,
    )

    size = serializers.CharField(
        source="variant.size",
        read_only=True,
    )

    color = serializers.CharField(
        source="variant.color",
        read_only=True,
    )

    seller_name = serializers.CharField(
        source="seller.store_name",
        read_only=True,
    )

    class Meta:
        model = OrderItem

        fields = [
            "id",
            "product",
            "product_name",
            "product_slug",
            "variant",
            "sku",
            "size",
            "color",
            "seller",
            "seller_name",
            "quantity",
            "unit_price",
            "total_price",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "product_slug",
            "sku",
            "size",
            "color",
            "seller",
            "seller_name",
            "unit_price",
            "total_price",
            "created_at",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Order

        fields = [
            "id",
            "order_number",
            "subtotal",
            "shipping_fee",
            "discount",
            "total_amount",
            "payment_status",
            "order_status",
            "shipping_full_name",
            "shipping_phone",
            "shipping_address",
            "shipping_city",
            "shipping_county",
            "notes",
            "items",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "order_number",
            "subtotal",
            "shipping_fee",
            "discount",
            "total_amount",
            "payment_status",
            "order_status",
            "items",
            "created_at",
            "updated_at",
        ]


class CreateOrderSerializer(serializers.Serializer):
    full_name = serializers.CharField(
        max_length=150,
    )

    phone = serializers.CharField(
        max_length=20,
    )

    address = serializers.CharField(
        max_length=255,
    )

    city = serializers.CharField(
        max_length=100,
    )

    county = serializers.CharField(
        max_length=100,
    )

    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
    )

    def validate_full_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Please provide a valid full name."
            )

        return value

    def validate_phone(self, value):
        value = value.strip()

        if len(value) < 9:
            raise serializers.ValidationError(
                "Please provide a valid phone number."
            )

        return value

    def validate_address(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Delivery address is required."
            )

        return value

    def validate_city(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "City is required."
            )

        return value

    def validate_county(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "County is required."
            )

        return value