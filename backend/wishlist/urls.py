from django.urls import path

from .views import (
    AddToWishlistView,
    RemoveFromWishlistView,
    WishlistView,
)


urlpatterns = [
    path(
        "",
        WishlistView.as_view(),
        name="wishlist",
    ),

    path(
        "add/",
        AddToWishlistView.as_view(),
        name="wishlist-add",
    ),

    path(
        "items/<int:item_id>/remove/",
        RemoveFromWishlistView.as_view(),
        name="wishlist-remove",
    ),
]