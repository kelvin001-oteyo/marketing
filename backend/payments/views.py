
from decimal import Decimal

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from .models import Payment
from .mpesa import MpesaService, normalize_phone_number


class InitiateMpesaPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_number = request.data.get("order_number")
        phone_number = request.data.get("phone_number")

        if not order_number:
            return Response(
                {
                    "error": "Order number is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not phone_number:
            return Response(
                {
                    "error": "M-Pesa phone number is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            phone_number = normalize_phone_number(phone_number)
        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            try:
                order = (
                    Order.objects
                    .select_for_update()
                    .get(
                        order_number=order_number,
                        user=request.user,
                    )
                )
            except Order.DoesNotExist:
                return Response(
                    {"error": "Order not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if order.payment_status == Order.PaymentStatus.PAID:
                return Response(
                    {
                        "error": "This order has already been paid."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            payment, _ = Payment.objects.get_or_create(
                order=order,
                defaults={
                    "phone_number": phone_number,
                    "amount": order.total_amount,
                    "status": Payment.Status.PENDING,
                },
            )

            payment.phone_number = phone_number
            payment.amount = order.total_amount
            payment.status = Payment.Status.PENDING
            payment.result_code = None
            payment.result_description = ""
            payment.save()

        try:
            mpesa = MpesaService()

            result = mpesa.stk_push(
                phone_number=phone_number,
                amount=Decimal(order.total_amount),
                account_reference=order.order_number,
                transaction_desc="Clothing Marketplace Order",
            )

        except Exception:
            payment.status = Payment.Status.FAILED
            payment.result_description = (
                "Unable to contact M-Pesa."
            )
            payment.save(
                update_fields=[
                    "status",
                    "result_description",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "error": "Unable to initiate M-Pesa payment."
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if str(result.get("ResponseCode")) != "0":
            payment.status = Payment.Status.FAILED
            payment.result_code = str(
                result.get("ResponseCode", "")
            )
            payment.result_description = result.get(
                "ResponseDescription",
                "M-Pesa rejected the request.",
            )

            payment.save()

            return Response(
                {
                    "error": payment.result_description
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payment.merchant_request_id = result.get(
            "MerchantRequestID"
        )

        payment.checkout_request_id = result.get(
            "CheckoutRequestID"
        )

        payment.result_code = result.get(
            "ResponseCode"
        )

        payment.result_description = result.get(
            "ResponseDescription",
            "",
        )

        payment.save()

        return Response(
            {
                "message": "M-Pesa payment request sent.",
                "checkout_request_id": (
                    payment.checkout_request_id
                ),
                "customer_message": result.get(
                    "CustomerMessage",
                    "Check your phone for the M-Pesa prompt.",
                ),
            },
            status=status.HTTP_200_OK,
        )


class MpesaCallbackView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        callback_data = request.data

        stk_callback = (
            callback_data
            .get("Body", {})
            .get("stkCallback", {})
        )

        checkout_request_id = stk_callback.get(
            "CheckoutRequestID"
        )

        result_code = stk_callback.get(
            "ResultCode"
        )

        result_description = stk_callback.get(
            "ResultDesc",
            "",
        )

        if not checkout_request_id:
            return Response(
                {
                    "ResultCode": 0,
                    "ResultDesc": "Accepted",
                }
            )

        with transaction.atomic():
            try:
                payment = (
                    Payment.objects
                    .select_for_update()
                    .select_related("order")
                    .get(
                        checkout_request_id=checkout_request_id
                    )
                )
            except Payment.DoesNotExist:
                return Response(
                    {
                        "ResultCode": 0,
                        "ResultDesc": "Accepted",
                    }
                )

            payment.result_code = str(result_code)
            payment.result_description = result_description

            if result_code == 0:
                callback_metadata = (
                    stk_callback.get(
                        "CallbackMetadata",
                        {},
                    )
                )

                items = callback_metadata.get(
                    "Item",
                    [],
                )

                metadata = {}

                for item in items:
                    name = item.get("Name")
                    value = item.get("Value")

                    if name:
                        metadata[name] = value

                receipt_number = metadata.get(
                    "MpesaReceiptNumber"
                )

                transaction_date = metadata.get(
                    "TransactionDate"
                )

                payment.receipt_number = (
                    str(receipt_number)
                    if receipt_number
                    else None
                )

                payment.transaction_id = (
                    payment.receipt_number
                )

                payment.status = Payment.Status.SUCCESS

                order = payment.order

                order.payment_status = (
                    Order.PaymentStatus.PAID
                )

                order.order_status = (
                    Order.OrderStatus.CONFIRMED
                )

                order.save(
                    update_fields=[
                        "payment_status",
                        "order_status",
                        "updated_at",
                    ]
                )

            else:
                payment.status = Payment.Status.FAILED

                payment.order.payment_status = (
                    Order.PaymentStatus.FAILED
                )

                payment.order.save(
                    update_fields=[
                        "payment_status",
                        "updated_at",
                    ]
                )

            payment.save()

        return Response(
            {
                "ResultCode": 0,
                "ResultDesc": "Accepted",
            }
        )


class PaymentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        try:
            payment = (
                Payment.objects
                .select_related("order")
                .get(
                    order__order_number=order_number,
                    order__user=request.user,
                )
            )
        except Payment.DoesNotExist:
            return Response(
                {
                    "error": "Payment not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "order_number": payment.order.order_number,
                "amount": payment.amount,
                "phone_number": payment.phone_number,
                "status": payment.status,
                "checkout_request_id": (
                    payment.checkout_request_id
                ),
                "receipt_number": payment.receipt_number,
                "result_description": (
                    payment.result_description
                ),
                "created_at": payment.created_at,
                "updated_at": payment.updated_at,
            }
        )

