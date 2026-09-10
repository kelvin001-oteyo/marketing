from django.urls import path

from .views import (
    InventoryDetailView,
    InventoryListView,
    InventoryTransactionListView,
    InventoryUpdateView,
)


urlpatterns = [
    path(
        "",
        InventoryListView.as_view(),
        name="inventory-list",
    ),

    path(
        "<int:pk>/",
        InventoryDetailView.as_view(),
        name="inventory-detail",
    ),

    path(
        "<int:pk>/update/",
        InventoryUpdateView.as_view(),
        name="inventory-update",
    ),

    path(
        "transactions/",
        InventoryTransactionListView.as_view(),
        name="inventory-transactions",
    ),
]