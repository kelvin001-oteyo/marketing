from rest_framework import serializers


class DashboardSummarySerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
    )

    today_revenue = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
    )

    monthly_revenue = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
    )

    total_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    completed_orders = serializers.IntegerField()
    cancelled_orders = serializers.IntegerField()

    total_customers = serializers.IntegerField()
    total_sellers = serializers.IntegerField()
    total_products = serializers.IntegerField()

    low_stock_products = serializers.IntegerField()


class TopProductSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    quantity_sold = serializers.IntegerField()
    revenue = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
    )


class RecentOrderSerializer(serializers.Serializer):
    order_number = serializers.CharField()
    customer_name = serializers.CharField()
    total_amount = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
    )
    payment_status = serializers.CharField()
    order_status = serializers.CharField()
    created_at = serializers.DateTimeField()