from django.urls import path

from .views import (
    AdminApproveSellerView,
    AdminRejectSellerView,
    AdminSellerListView,
    MySellerProfileView,
    SellerApplicationView,
    SellerDetailView,
    SellerListView,
)


urlpatterns = [
    # Public seller stores
    path(
        "",
        SellerListView.as_view(),
        name="seller-list",
    ),

    # Seller
    path(
        "application/",
        SellerApplicationView.as_view(),
        name="seller-application",
    ),

    path(
        "me/",
        MySellerProfileView.as_view(),
        name="my-seller-profile",
    ),

    # Admin
    path(
        "admin/all/",
        AdminSellerListView.as_view(),
        name="admin-seller-list",
    ),

    path(
        "admin/<int:seller_id>/approve/",
        AdminApproveSellerView.as_view(),
        name="admin-approve-seller",
    ),

    path(
        "admin/<int:seller_id>/reject/",
        AdminRejectSellerView.as_view(),
        name="admin-reject-seller",
    ),

    # Public seller store by slug
    path(
        "<slug:store_slug>/",
        SellerDetailView.as_view(),
        name="seller-detail",
    ),
]