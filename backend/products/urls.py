from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ProductViewSet,
    ProductVariantViewSet,
    ProductImageViewSet,
)


router = DefaultRouter()

router.register(
    r"",
    ProductViewSet,
    basename="product",
)


variant_list = ProductVariantViewSet.as_view({
    "get": "list",
    "post": "create",
})

variant_detail = ProductVariantViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})


image_list = ProductImageViewSet.as_view({
    "get": "list",
    "post": "create",
})

image_detail = ProductImageViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})


urlpatterns = [
    # Products
    path(
        "",
        include(router.urls),
    ),

    # Product variants
    path(
        "<int:product_pk>/variants/",
        variant_list,
        name="product-variant-list",
    ),

    path(
        "<int:product_pk>/variants/<int:pk>/",
        variant_detail,
        name="product-variant-detail",
    ),

    # Product images
    path(
        "<int:product_pk>/images/",
        image_list,
        name="product-image-list",
    ),

    path(
        "<int:product_pk>/images/<int:pk>/",
        image_detail,
        name="product-image-detail",
    ),
]