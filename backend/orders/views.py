from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.models import InventoryRecord, InventoryTransaction
from notifications.services import (
    notify_order_cancelled,
    notify_order_created,
    notify_order_status_changed,
    notify_seller_new_order,
)

from .models import Order
from .serializers import (
    CreateOrderSerializer,
    OrderSerializer,
)
from .services import create_order_from_cart


class IsCustomer:
    @staticmethod
    def check(request):
        if not request.user.is_authenticated:
            return False

        return request.user.role == "CUSTOMER"


class IsAdmin:
    @staticmethod
    def check(request):
        if not request.user.is_authenticated:
            return False

        return request.user.role == "ADMIN"


class IsSellerOrAdmin:
    @staticmethod
    def check(request):
        if not request.user.is_authenticated:
            return False

        return request.user.role in [
            "SELLER",
            "ADMIN",
        ]


class CreateOrderView(generics.CreateAPIView):
    serializer_class = CreateOrderSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if not IsCustomer.check(request):
            return Response(
                {
                    "detail": (
                        "Only customers can create orders."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        order = create_order_from_cart(
            user=request.user,
            full_name=serializer.validated_data[
                "full_name"
            ],
            phone=serializer.validated_data[
                "phone"
            ],
            address=serializer.validated_data[
                "address"
            ],
            city=serializer.validated_data[
                "city"
            ],
            county=serializer.validated_data[
                "county"
            ],
            notes=serializer.validated_data.get(
                "notes",
                "",
            ),
        )

        notify_order_created(
            user=request.user,
            order_number=order.order_number,
            total_amount=order.total_amount,
        )

        seller_ids = (
            order.items
            .values_list(
                "seller__user_id",
                flat=True,
            )
            .distinct()
        )

        from accounts.models import User

        sellers = User.objects.filter(
            id__in=seller_ids
        )

        for seller in sellers:
            notify_seller_new_order(
                user=seller,
                order_number=order.order_number,
            )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .select_related("user")
            .prefetch_related(
                "items",
                "items__product",
                "items__variant",
                "items__seller",
            )
            .order_by("-created_at")
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "order_number"

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .select_related("user")
            .prefetch_related(
                "items",
                "items__product",
                "items__variant",
                "items__seller",
            )
        )


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not IsAdmin.check(self.request):
            return Order.objects.none()

        queryset = (
            Order.objects
            .select_related("user")
            .prefetch_related(
                "items",
                "items__product",
                "items__variant",
                "items__seller",
            )
            .order_by("-created_at")
        )

        order_status = self.request.query_params.get(
            "order_status"
        )

        payment_status = self.request.query_params.get(
            "payment_status"
        )

        if order_status:
            queryset = queryset.filter(
                order_status=order_status
            )

        if payment_status:
            queryset = queryset.filter(
                payment_status=payment_status
            )

        return queryset


class SellerOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not IsSellerOrAdmin.check(self.request):
            return Order.objects.none()

        user = self.request.user

        if user.role == "ADMIN":
            return (
                Order.objects
                .select_related("user")
                .prefetch_related(
                    "items",
                    "items__product",
                    "items__variant",
                    "items__seller",
                )
                .order_by("-created_at")
            )

        return (
            Order.objects
            .filter(
                items__seller__user=user
            )
            .distinct()
            .select_related("user")
            .prefetch_related(
                "items",
                "items__product",
                "items__variant",
                "items__seller",
            )
            .order_by("-created_at")
        )


class AdminOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "order_number"

    def get_queryset(self):
        if not IsAdmin.check(self.request):
            return Order.objects.none()

        return (
            Order.objects
            .select_related("user")
            .prefetch_related(
                "items",
                "items__product",
                "items__variant",
                "items__seller",
            )
        )


class SellerOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "order_number"

    def get_queryset(self):
        user = self.request.user

        if not IsSellerOrAdmin.check(self.request):
            return Order.objects.none()

        if user.role == "ADMIN":
            return (
                Order.objects
                .select_related("user")
                .prefetch_related(
                    "items",
                    "items__product",
                    "items__variant",
                    "items__seller",
                )
            )

        return (
            Order.objects
            .filter(
                order_number=self.kwargs[
                    "order_number"
                ],
                items__seller__user=user,
            )
            .distinct()
            .select_related("user")
            .prefetch_related(
                "items",
                "items__product",
                "items__variant",
                "items__seller",
            )
        )


class UpdateOrderStatusView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, order_number):
        user = request.user

        if not IsSellerOrAdmin.check(request):
            return Response(
                {
                    "detail": (
                        "Only sellers and administrators "
                        "can update order status."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        order = get_object_or_404(
            Order.objects
            .select_for_update()
            .prefetch_related(
                "items",
                "items__seller",
                "items__variant",
            ),
            order_number=order_number,
        )

        if user.role == "SELLER":
            seller_has_order_item = (
                order.items.filter(
                    seller__user=user
                ).exists()
            )

            if not seller_has_order_item:
                return Response(
                    {
                        "detail": (
                            "You can only manage orders "
                            "containing your products."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        new_status = request.data.get(
            "order_status"
        )

        allowed_statuses = {
            choice[0]
            for choice in Order.OrderStatus.choices
        }

        if new_status not in allowed_statuses:
            return Response(
                {
                    "detail": "Invalid order status.",
                    "allowed_statuses": sorted(
                        allowed_statuses
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        current_status = order.order_status

        if current_status == (
            Order.OrderStatus.CANCELLED
        ):
            return Response(
                {
                    "detail": (
                        "A cancelled order cannot "
                        "be changed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if current_status == (
            Order.OrderStatus.DELIVERED
        ):
            return Response(
                {
                    "detail": (
                        "A delivered order cannot "
                        "be changed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_status == current_status:
            return Response(
                OrderSerializer(order).data,
                status=status.HTTP_200_OK,
            )

        order.order_status = new_status

        order.save(
            update_fields=[
                "order_status",
                "updated_at",
            ]
        )

        notify_order_status_changed(
            user=order.user,
            order_number=order.order_number,
            new_status=new_status,
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, order_number):
        if not IsCustomer.check(request):
            return Response(
                {
                    "detail": (
                        "Only customers can cancel "
                        "their orders."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        order = get_object_or_404(
            Order.objects
            .select_for_update()
            .prefetch_related(
                "items",
                "items__variant",
            ),
            order_number=order_number,
            user=request.user,
        )

        if order.order_status == (
            Order.OrderStatus.CANCELLED
        ):
            return Response(
                {
                    "detail": (
                        "Order is already cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.order_status not in [
            Order.OrderStatus.PENDING,
            Order.OrderStatus.CONFIRMED,
        ]:
            return Response(
                {
                    "detail": (
                        "This order can no longer "
                        "be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        for item in order.items.all():
            try:
                inventory = (
                    InventoryRecord.objects
                    .select_for_update()
                    .get(
                        variant=item.variant
                    )
                )
            except InventoryRecord.DoesNotExist:
                continue

            inventory.reserved_quantity = max(
                inventory.reserved_quantity
                - item.quantity,
                0,
            )

            inventory.save(
                update_fields=[
                    "reserved_quantity",
                    "updated_at",
                ]
            )

            InventoryTransaction.objects.create(
                inventory=inventory,
                transaction_type=(
                    InventoryTransaction
                    .TransactionType.RELEASE
                ),
                quantity=item.quantity,
                reference=order.order_number,
                notes=(
                    f"Stock reservation released "
                    f"because order "
                    f"{order.order_number} was cancelled."
                ),
            )

        order.order_status = (
            Order.OrderStatus.CANCELLED
        )

        order.save(
            update_fields=[
                "order_status",
                "updated_at",
            ]
        )

        notify_order_cancelled(
            user=request.user,
            order_number=order.order_number,
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )