from django.urls import path

from .views import (
    DashboardSummaryView,
    RecentOrdersView,
    TopProductsView,
)


urlpatterns = [
    path(
        "dashboard/",
        DashboardSummaryView.as_view(),
        name="dashboard-summary",
    ),

    path(
        "top-products/",
        TopProductsView.as_view(),
        name="top-products",
    ),

    path(
        "recent-orders/",
        RecentOrdersView.as_view(),
        name="recent-orders",
    ),
]