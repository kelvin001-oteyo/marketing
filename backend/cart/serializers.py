from rest_framework import serializers

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    variant_sku = serializers.CharField(
        source="variant.sku",
        read_only=True,
    )

    variant_size = serializers.CharField(
        source="variant.size",
        read_only=True,
    )

    variant_color = serializers.CharField(
        source="variant.color",
        read_only=True,
    )

    total_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem

        fields = [
            "id",
            "product",
            "product_name",
            "variant",
            "variant_sku",
            "variant_size",
            "variant_color",
            "quantity",
            "price",
            "total_price",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "variant_sku",
            "variant_size",
            "variant_color",
            "price",
            "total_price",
            "created_at",
            "updated_at",
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    subtotal = serializers.SerializerMethodField()

    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart

        fields = [
            "id",
            "user",
            "session_key",
            "items",
            "subtotal",
            "item_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "session_key",
            "items",
            "subtotal",
            "item_count",
            "created_at",
            "updated_at",
        ]

    def get_subtotal(self, obj):
        return sum(
            item.total_price
            for item in obj.items.all()
        )

    def get_item_count(self, obj):
        return sum(
            item.quantity
            for item in obj.items.all()
        )