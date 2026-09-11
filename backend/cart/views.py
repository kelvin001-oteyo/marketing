from django.urls import path

from .views import (
    CartView,
    AddToCartView,
    UpdateCartItemView,
    RemoveCartItemView,
    ClearCartView,
    MergeGuestCartView,
)


urlpatterns = [
    path("", CartView.as_view(), name="cart"),
    path("add/", AddToCartView.as_view(), name="cart-add"),
    path(
        "items/<int:item_id>/update/",
        UpdateCartItemView.as_view(),
        name="cart-update",
    ),
    path(
        "items/<int:item_id>/remove/",
        RemoveCartItemView.as_view(),
        name="cart-remove",
    ),
    path(
        "clear/",
        ClearCartView.as_view(),
        name="cart-clear",
    ),
    path(
        "merge/",
        MergeGuestCartView.as_view(),
        name="cart-merge",
    ),
]
