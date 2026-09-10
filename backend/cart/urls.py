from django.urls import path

from .views import (
    CartView,
    AddToCartView,
    UpdateCartItemView,
    RemoveCartItemView,
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
        "merge/",
        MergeGuestCartView.as_view(),
        name="cart-merge",
    ),
]