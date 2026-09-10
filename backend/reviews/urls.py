from django.urls import path

from .views import (
    AdminReviewListView,
    AdminReviewUpdateView,
    CreateReviewView,
    DeleteMyReviewView,
    MyReviewsView,
    ProductRatingView,
    ProductReviewListView,
)


urlpatterns = [
    path(
        "product/<int:product_id>/",
        ProductReviewListView.as_view(),
        name="product-reviews",
    ),

    path(
        "product/<int:product_id>/rating/",
        ProductRatingView.as_view(),
        name="product-rating",
    ),

    path(
        "create/",
        CreateReviewView.as_view(),
        name="review-create",
    ),

    path(
        "mine/",
        MyReviewsView.as_view(),
        name="my-reviews",
    ),

    path(
        "mine/<int:pk>/delete/",
        DeleteMyReviewView.as_view(),
        name="review-delete",
    ),

    path(
        "admin/all/",
        AdminReviewListView.as_view(),
        name="admin-review-list",
    ),

    path(
        "admin/<int:pk>/",
        AdminReviewUpdateView.as_view(),
        name="admin-review-update",
    ),
]