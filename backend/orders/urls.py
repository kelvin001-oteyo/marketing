from django.urls import path

from .views import (
    CreateOrderView,
    MyOrdersView,
    OrderDetailView,
    AdminOrderListView,
    AdminOrderDetailView,
    SellerOrderListView,
    SellerOrderDetailView,
    UpdateOrderStatusView,
    CancelOrderView,
)


urlpatterns = [
    # Customer orders
    path(
        "create/",
        CreateOrderView.as_view(),
        name="order-create",
    ),

    path(
        "",
        MyOrdersView.as_view(),
        name="my-orders",
    ),

    path(
        "<str:order_number>/cancel/",
        CancelOrderView.as_view(),
        name="order-cancel",
    ),

    path(
        "<str:order_number>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),

    # Administrator order management
    path(
        "admin/all/",
        AdminOrderListView.as_view(),
        name="admin-order-list",
    ),

    path(
        "admin/<str:order_number>/",
        AdminOrderDetailView.as_view(),
        name="admin-order-detail",
    ),

    # Seller order management
    path(
        "seller/all/",
        SellerOrderListView.as_view(),
        name="seller-order-list",
    ),

    path(
        "seller/<str:order_number>/",
        SellerOrderDetailView.as_view(),
        name="seller-order-detail",
    ),

    # Seller/Admin order status management
    path(
        "manage/<str:order_number>/status/",
        UpdateOrderStatusView.as_view(),
        name="order-status-update",
    ),
]