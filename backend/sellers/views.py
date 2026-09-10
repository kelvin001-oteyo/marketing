from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SellerProfile
from .permissions import IsAdmin, IsSeller
from .serializers import (
    SellerApplicationSerializer,
    SellerProfileSerializer,
)


User = get_user_model()


class SellerApplicationView(generics.CreateAPIView):
    serializer_class = SellerApplicationSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        seller = serializer.save()

        return Response(
            {
                "message": (
                    "Seller application created successfully. "
                    "Your store is awaiting admin approval."
                ),
                "seller": SellerProfileSerializer(
                    seller,
                    context={"request": request}
                ).data,
            },
            status=201,
        )


class MySellerProfileView(APIView):
    permission_classes = [
        IsSeller
    ]

    def get(self, request):
        seller = request.user.seller_profile

        serializer = SellerProfileSerializer(
            seller,
            context={"request": request}
        )

        return Response(serializer.data)


class SellerListView(generics.ListAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [
        permissions.AllowAny
    ]

    def get_queryset(self):
        return SellerProfile.objects.filter(
            verified=True
        ).order_by("-created_at")


class SellerDetailView(generics.RetrieveAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [
        permissions.AllowAny
    ]

    lookup_field = "store_slug"

    def get_queryset(self):
        return SellerProfile.objects.filter(
            verified=True
        )


class AdminSellerListView(generics.ListAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [
        IsAdmin
    ]

    def get_queryset(self):
        return SellerProfile.objects.all().order_by(
            "-created_at"
        )


class AdminApproveSellerView(APIView):
    permission_classes = [
        IsAdmin
    ]

    def post(self, request, seller_id):
        try:
            seller = SellerProfile.objects.get(
                id=seller_id
            )
        except SellerProfile.DoesNotExist:
            return Response(
                {
                    "detail": "Seller not found."
                },
                status=404,
            )

        seller.verified = True
        seller.save(
            update_fields=[
                "verified",
                "updated_at",
            ]
        )

        seller.user.role = User.Role.SELLER
        seller.user.save(
            update_fields=["role"]
        )

        return Response(
            {
                "message": "Seller approved successfully.",
                "seller": SellerProfileSerializer(
                    seller,
                    context={"request": request}
                ).data,
            }
        )


class AdminRejectSellerView(APIView):
    permission_classes = [
        IsAdmin
    ]

    def post(self, request, seller_id):
        try:
            seller = SellerProfile.objects.get(
                id=seller_id
            )
        except SellerProfile.DoesNotExist:
            return Response(
                {
                    "detail": "Seller not found."
                },
                status=404,
            )

        seller.delete()

        return Response(
            {
                "message": "Seller application rejected."
            }
        )