from django.urls import path

from .views import (
    InitiateMpesaPaymentView,
    MpesaCallbackView,
    PaymentDetailView,
)


urlpatterns = [
    path(
        "mpesa/initiate/",
        InitiateMpesaPaymentView.as_view(),
        name="mpesa-initiate",
    ),

    path(
        "mpesa/callback/",
        MpesaCallbackView.as_view(),
        name="mpesa-callback",
    ),

    path(
        "<str:order_number>/",
        PaymentDetailView.as_view(),
        name="payment-detail",
    ),
]