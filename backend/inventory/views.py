from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import InventoryRecord, InventoryTransaction
from .permissions import IsInventoryManager
from .serializers import (
    InventoryRecordSerializer,
    InventoryTransactionSerializer,
)


class InventoryListView(generics.ListAPIView):
    serializer_class = InventoryRecordSerializer
    permission_classes = [
        IsInventoryManager
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = InventoryRecord.objects.select_related(
            "variant",
            "variant__product",
            "variant__product__seller",
        )

        if user.role == "ADMIN":
            return queryset.order_by("-updated_at")

        return queryset.filter(
            variant__product__seller__user=user
        ).order_by("-updated_at")


class InventoryDetailView(generics.RetrieveAPIView):
    serializer_class = InventoryRecordSerializer
    permission_classes = [
        IsInventoryManager
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = InventoryRecord.objects.select_related(
            "variant",
            "variant__product",
            "variant__product__seller",
        )

        if user.role == "ADMIN":
            return queryset

        return queryset.filter(
            variant__product__seller__user=user
        )


class InventoryUpdateView(APIView):
    permission_classes = [
        IsInventoryManager
    ]

    @transaction.atomic
    def patch(self, request, pk):
        inventory = get_object_or_404(
            InventoryRecord.objects.select_for_update().select_related(
                "variant",
                "variant__product",
                "variant__product__seller",
            ),
            pk=pk,
        )

        user = request.user

        # Sellers can only manage their own inventory.
        if user.role != "ADMIN":
            if inventory.variant.product.seller.user != user:
                return Response(
                    {
                        "detail": (
                            "You can only manage inventory "
                            "for your own products."
                        )
                    },
                    status=403,
                )

        quantity = request.data.get("quantity")

        if quantity is None:
            return Response(
                {
                    "detail": "Quantity is required."
                },
                status=400,
            )

        # Convert the submitted quantity to an integer.
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {
                    "detail": (
                        "Quantity must be a whole number."
                    )
                },
                status=400,
            )

        # Quantity cannot be negative.
        if quantity < 0:
            return Response(
                {
                    "detail": (
                        "Quantity cannot be negative."
                    )
                },
                status=400,
            )

        # Never allow total stock to become lower
        # than the quantity already reserved for orders.
        if quantity < inventory.reserved_quantity:
            return Response(
                {
                    "detail": (
                        "Quantity cannot be lower than "
                        "the currently reserved quantity."
                    ),
                    "reserved_quantity": (
                        inventory.reserved_quantity
                    ),
                    "requested_quantity": quantity,
                },
                status=400,
            )

        old_quantity = inventory.quantity

        inventory.quantity = quantity

        inventory.save(
            update_fields=[
                "quantity",
                "updated_at",
            ]
        )

        difference = quantity - old_quantity

        # Record every actual stock change.
        if difference != 0:

            if difference > 0:
                transaction_type = (
                    InventoryTransaction
                    .TransactionType
                    .RESTOCK
                )
            else:
                transaction_type = (
                    InventoryTransaction
                    .TransactionType
                    .ADJUSTMENT
                )

            InventoryTransaction.objects.create(
                inventory=inventory,
                transaction_type=transaction_type,
                quantity=abs(difference),
                reference="MANUAL_UPDATE",
                notes=(
                    f"Stock changed from "
                    f"{old_quantity} to {quantity}."
                ),
            )

        return Response(
            InventoryRecordSerializer(
                inventory
            ).data
        )


class InventoryTransactionListView(
    generics.ListAPIView
):
    serializer_class = InventoryTransactionSerializer
    permission_classes = [
        IsInventoryManager
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = InventoryTransaction.objects.select_related(
            "inventory",
            "inventory__variant",
            "inventory__variant__product",
            "inventory__variant__product__seller",
        )

        if user.role == "ADMIN":
            return queryset.order_by(
                "-created_at"
            )

        return queryset.filter(
            inventory__variant__product__seller__user=user
        ).order_by(
            "-created_at"
        )