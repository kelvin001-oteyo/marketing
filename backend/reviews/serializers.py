from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    product_slug = serializers.CharField(
        source="product.slug",
        read_only=True,
    )

    user_name = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = Review

        fields = [
            "id",
            "product",
            "product_name",
            "product_slug",
            "user",
            "user_name",
            "rating",
            "title",
            "comment",
            "status",
            "is_verified_purchase",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "user_name",
            "product_name",
            "product_slug",
            "status",
            "is_verified_purchase",
            "created_at",
            "updated_at",
        ]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )

        return value