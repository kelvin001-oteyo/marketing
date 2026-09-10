from rest_framework import serializers

from .models import Wishlist, WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    product_slug = serializers.CharField(
        source="product.slug",
        read_only=True,
    )

    product_price = serializers.ReadOnlyField(
        source="product.current_price",
    )

    product_image = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem

        fields = [
            "id",
            "product",
            "product_name",
            "product_slug",
            "product_price",
            "product_image",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "product_slug",
            "product_price",
            "product_image",
            "created_at",
        ]

    def get_product_image(self, obj):
        image = obj.product.images.first()

        if not image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(image.image.url)

        return image.image.url


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(
        many=True,
        read_only=True,
    )

    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist

        fields = [
            "id",
            "user",
            "items",
            "item_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "items",
            "item_count",
            "created_at",
            "updated_at",
        ]

    def get_item_count(self, obj):
        return obj.items.count()