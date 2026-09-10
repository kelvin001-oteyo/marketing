from datetime import timedelta
from decimal import Decimal

from django.db.models import (
    Count,
    F,
    Sum,
    DecimalField,
    ExpressionWrapper,
)
from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from inventory.models import InventoryRecord
from orders.models import Order, OrderItem
from products.models import Product
from sellers.models import SellerProfile

from .serializers import (
    DashboardSummarySerializer,
    TopProductSerializer,
    RecentOrderSerializer,
)


class IsAdminUser:
    """
    Small helper used by the dashboard views.
    """

    @staticmethod
    def check(request):
        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not IsAdminUser.check(request):
            return Response(
                {
                    "detail": (
                        "Administrator access is required."
                    )
                },
                status=403,
            )

        now = timezone.now()
        today = now.date()

        month_start = now.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        paid_orders = Order.objects.filter(
            payment_status=Order.PaymentStatus.PAID,
        )

        total_revenue = (
            paid_orders.aggregate(
                total=Sum("total_amount"),
            )["total"]
            or Decimal("0.00")
        )

        today_revenue = (
            paid_orders.filter(
                created_at__date=today,
            ).aggregate(
                total=Sum("total_amount"),
            )["total"]
            or Decimal("0.00")
        )

        monthly_revenue = (
            paid_orders.filter(
                created_at__gte=month_start,
            ).aggregate(
                total=Sum("total_amount"),
            )["total"]
            or Decimal("0.00")
        )

        total_orders = Order.objects.count()

        pending_orders = Order.objects.filter(
            order_status=Order.OrderStatus.PENDING,
        ).count()

        completed_orders = Order.objects.filter(
            order_status=Order.OrderStatus.DELIVERED,
        ).count()

        cancelled_orders = Order.objects.filter(
            order_status=Order.OrderStatus.CANCELLED,
        ).count()

        total_customers = User.objects.filter(
            role=User.Role.CUSTOMER,
        ).count()

        total_sellers = SellerProfile.objects.count()

        total_products = Product.objects.count()

        low_stock_products = InventoryRecord.objects.filter(
            quantity__gt=0,
            quantity__lte=F("low_stock_threshold"),
        ).count()

        data = {
            "total_revenue": total_revenue,
            "today_revenue": today_revenue,
            "monthly_revenue": monthly_revenue,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "completed_orders": completed_orders,
            "cancelled_orders": cancelled_orders,
            "total_customers": total_customers,
            "total_sellers": total_sellers,
            "total_products": total_products,
            "low_stock_products": low_stock_products,
        }

        serializer = DashboardSummarySerializer(data)

        return Response(serializer.data)


class TopProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not IsAdminUser.check(request):
            return Response(
                {
                    "detail": (
                        "Administrator access is required."
                    )
                },
                status=403,
            )

        limit = request.query_params.get(
            "limit",
            "10",
        )

        try:
            limit = int(limit)
        except ValueError:
            limit = 10

        limit = max(1, min(limit, 50))

        item_revenue = ExpressionWrapper(
            F("quantity") * F("unit_price"),
            output_field=DecimalField(
                max_digits=15,
                decimal_places=2,
            ),
        )

        products = (
            OrderItem.objects
            .filter(
                order__payment_status=Order.PaymentStatus.PAID,
            )
            .values(
                "product_id",
                "product__name",
            )
            .annotate(
                quantity_sold=Sum("quantity"),
                revenue=Sum(item_revenue),
            )
            .order_by(
                "-quantity_sold",
            )[:limit]
        )

        data = [
            {
                "product_id": item["product_id"],
                "product_name": item["product__name"],
                "quantity_sold": item["quantity_sold"] or 0,
                "revenue": item["revenue"] or Decimal("0.00"),
            }
            for item in products
        ]

        serializer = TopProductSerializer(
            data,
            many=True,
        )

        return Response(serializer.data)


class RecentOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not IsAdminUser.check(request):
            return Response(
                {
                    "detail": (
                        "Administrator access is required."
                    )
                },
                status=403,
            )

        orders = (
            Order.objects
            .select_related("user")
            .order_by("-created_at")[:10]
        )

        data = []

        for order in orders:
            customer_name = (
                order.shipping_full_name
                or order.user.get_full_name()
                or order.user.username
            )

            data.append(
                {
                    "order_number": order.order_number,
                    "customer_name": customer_name,
                    "total_amount": order.total_amount,
                    "payment_status": order.payment_status,
                    "order_status": order.order_status,
                    "created_at": order.created_at,
                }
            )

        serializer = RecentOrderSerializer(
            data,
            many=True,
        )

        return Response(serializer.data)