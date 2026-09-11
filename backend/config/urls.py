from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
TokenObtainPairView,
TokenRefreshView,
)

urlpatterns = [
path("django-admin/", admin.site.urls),


path(
    "api/v1/auth/",
    include("accounts.urls"),
),

path(
    "api/v1/auth/token/",
    TokenObtainPairView.as_view(),
    name="token_obtain_pair",
),

path(
    "api/v1/auth/token/refresh/",
    TokenRefreshView.as_view(),
    name="token_refresh",
),

path(
    "api/v1/categories/",
    include("categories.urls"),
),

path(
    "api/v1/products/",
    include("products.urls"),
),

path(
    "api/v1/sellers/",
    include("sellers.urls"),
),

path(
    "api/v1/cart/",
    include("cart.urls"),
),

path(
    "api/v1/wishlist/",
    include("wishlist.urls"),
),

path(
    "api/v1/orders/",
    include("orders.urls"),
),

path(
    "api/v1/payments/",
    include("payments.urls"),
),

path(
    "api/v1/promotions/",
    include("promotions.urls"),
),

path(
    "api/v1/inventory/",
    include("inventory.urls"),
),

path(
    "api/v1/reviews/",
    include("reviews.urls"),
),

path(
    "api/v1/reports/",
    include("reports.urls"),
),

path(
    "api/v1/notifications/",
    include("notifications.urls"),
),


]
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
