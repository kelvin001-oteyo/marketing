from rest_framework import serializers

from .models import InventoryRecord, InventoryTransaction


class InventoryRecordSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(
        source="variant.product.id",
        read_only=True,
    )

    product_name = serializers.CharField(
        source="variant.product.name",
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

    available_quantity = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()

    class Meta:
        model = InventoryRecord
        fields = [
            "id",
            "variant",
            "product_id",
            "product_name",
            "sku",
            "size",
            "color",
            "quantity",
            "reserved_quantity",
            "available_quantity",
            "low_stock_threshold",
            "is_low_stock",
            "is_out_of_stock",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "product_id",
            "product_name",
            "sku",
            "size",
            "color",
            "available_quantity",
            "is_low_stock",
            "is_out_of_stock",
            "updated_at",
        ]


class InventoryTransactionSerializer(
    serializers.ModelSerializer
):
    product_name = serializers.CharField(
        source="inventory.variant.product.name",
        read_only=True,
    )

    sku = serializers.CharField(
        source="inventory.variant.sku",
        read_only=True,
    )

    class Meta:
        model = InventoryTransaction
        fields = [
            "id",
            "inventory",
            "product_name",
            "sku",
            "type",
            "quantity",
            "reference",
            "notes",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "sku",
            "created_at",
        ]