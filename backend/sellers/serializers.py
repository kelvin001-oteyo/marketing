from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import SellerProfile


User = get_user_model()


class SellerProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(
        source="user.id",
        read_only=True
    )

    user_email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = SellerProfile
        fields = [
            "id",
            "user_id",
            "user_email",
            "store_name",
            "store_slug",
            "description",
            "logo",
            "banner",
            "location",
            "phone",
            "rating",
            "verified",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user_id",
            "user_email",
            "store_slug",
            "rating",
            "verified",
            "created_at",
            "updated_at",
        ]


class SellerApplicationSerializer(serializers.Serializer):
    store_name = serializers.CharField(
        max_length=150
    )

    description = serializers.CharField(
        required=False,
        allow_blank=True
    )

    location = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True
    )

    phone = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True
    )

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user

        if user.role == User.Role.ADMIN:
            raise serializers.ValidationError(
                "Administrators do not need to apply as sellers."
            )

        if SellerProfile.objects.filter(user=user).exists():
            raise serializers.ValidationError(
                "You already have a seller profile."
            )

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user

        seller = SellerProfile.objects.create(
            user=user,
            store_name=validated_data["store_name"],
            description=validated_data.get(
                "description",
                ""
            ),
            location=validated_data.get(
                "location",
                ""
            ),
            phone=validated_data.get(
                "phone",
                ""
            ),
            verified=False,
        )

        return seller