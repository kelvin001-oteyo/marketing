from django.db import transaction

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import ProductVariant
from inventory.models import InventoryRecord

from .models import Cart, CartItem
from .serializers import CartSerializer


def get_cart(request):
    """
    Get the authenticated user's cart or the guest session cart.
    """
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        return cart

    if not request.session.session_key:
        request.session.create()

    cart, created = Cart.objects.get_or_create(
        session_key=request.session.session_key
    )

    return cart


def get_available_stock(variant):
    """
    Return the actual available stock from InventoryRecord.

    available_quantity = quantity - reserved_quantity
    """
    try:
        inventory = InventoryRecord.objects.get(
            variant=variant
        )
    except InventoryRecord.DoesNotExist:
        return 0

    return inventory.available_quantity


class CartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = get_cart(request)

        return Response(
            CartSerializer(cart).data
        )


class AddToCartView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        variant_id = request.data.get("variant")

        quantity = request.data.get(
            "quantity",
            1,
        )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {
                    "error": "Quantity must be a valid number."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:
            return Response(
                {
                    "error": "Quantity must be greater than zero."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            variant = ProductVariant.objects.select_related(
                "product",
                "product__seller",
            ).get(
                id=variant_id,
                is_active=True,
            )
        except ProductVariant.DoesNotExist:
            return Response(
                {
                    "error": "Product variant not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get authoritative inventory information.
        try:
            inventory = InventoryRecord.objects.select_for_update().get(
                variant=variant
            )
        except InventoryRecord.DoesNotExist:
            return Response(
                {
                    "error": "Inventory record not found for this product."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        available_quantity = inventory.available_quantity

        if available_quantity <= 0:
            return Response(
                {
                    "error": "This product is currently out of stock."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > available_quantity:
            return Response(
                {
                    "error": "Not enough stock available.",
                    "available_quantity": available_quantity,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = get_cart(request)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={
                "product": variant.product,
                "quantity": quantity,
                "price": variant.current_price,
            },
        )

        if not created:
            new_quantity = item.quantity + quantity

            if new_quantity > available_quantity:
                return Response(
                    {
                        "error": "Requested quantity exceeds available stock.",
                        "available_quantity": available_quantity,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            item.quantity = new_quantity
            item.price = variant.current_price

            item.save(
                update_fields=[
                    "quantity",
                    "price",
                    "updated_at",
                ]
            )

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_201_CREATED,
        )


class UpdateCartItemView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def patch(self, request, item_id):
        quantity = request.data.get("quantity")

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {
                    "error": "Quantity must be a valid number."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:
            return Response(
                {
                    "error": "Quantity must be greater than zero."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = get_cart(request)

        try:
            item = CartItem.objects.select_related(
                "variant",
                "product",
            ).get(
                id=item_id,
                cart=cart,
            )
        except CartItem.DoesNotExist:
            return Response(
                {
                    "error": "Cart item not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            inventory = InventoryRecord.objects.select_for_update().get(
                variant=item.variant
            )
        except InventoryRecord.DoesNotExist:
            return Response(
                {
                    "error": "Inventory record not found for this product."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        available_quantity = inventory.available_quantity

        if available_quantity <= 0:
            return Response(
                {
                    "error": "This product is currently out of stock."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > available_quantity:
            return Response(
                {
                    "error": "Requested quantity exceeds available stock.",
                    "available_quantity": available_quantity,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = quantity
        item.price = item.variant.current_price

        item.save(
            update_fields=[
                "quantity",
                "price",
                "updated_at",
            ]
        )

        return Response(
            CartSerializer(cart).data
        )


class RemoveCartItemView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, item_id):
        cart = get_cart(request)

        try:
            item = CartItem.objects.get(
                id=item_id,
                cart=cart,
            )
        except CartItem.DoesNotExist:
            return Response(
                {
                    "error": "Cart item not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        item.delete()

        return Response(
            CartSerializer(cart).data
        )


class ClearCartView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request):
        cart = get_cart(request)

        cart.items.all().delete()

        return Response(
            CartSerializer(cart).data
        )


class MergeGuestCartView(APIView):
    """
    Merge the current guest session cart into the authenticated
    user's cart after login.
    """

    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {
                    "error": "You must be logged in to merge a guest cart."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        session_key = request.session.session_key

        if not session_key:
            return Response(
                CartSerializer(
                    get_cart(request)
                ).data
            )

        try:
            guest_cart = Cart.objects.prefetch_related(
                "items__variant",
                "items__product",
            ).get(
                session_key=session_key
            )
        except Cart.DoesNotExist:
            return Response(
                CartSerializer(
                    get_cart(request)
                ).data
            )

        customer_cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        for guest_item in guest_cart.items.all():

            try:
                inventory = InventoryRecord.objects.select_for_update().get(
                    variant=guest_item.variant
                )
            except InventoryRecord.DoesNotExist:
                continue

            available_quantity = inventory.available_quantity

            if available_quantity <= 0:
                continue

            existing_item = CartItem.objects.filter(
                cart=customer_cart,
                variant=guest_item.variant,
            ).first()

            if existing_item:
                combined_quantity = (
                    existing_item.quantity +
                    guest_item.quantity
                )

                existing_item.quantity = min(
                    combined_quantity,
                    available_quantity,
                )

                existing_item.price = (
                    guest_item.variant.current_price
                )

                existing_item.save(
                    update_fields=[
                        "quantity",
                        "price",
                        "updated_at",
                    ]
                )

            else:
                quantity = min(
                    guest_item.quantity,
                    available_quantity,
                )

                if quantity > 0:
                    CartItem.objects.create(
                        cart=customer_cart,
                        product=guest_item.product,
                        variant=guest_item.variant,
                        quantity=quantity,
                        price=guest_item.variant.current_price,
                    )

        guest_cart.delete()

        return Response(
            CartSerializer(customer_cart).data,
            status=status.HTTP_200_OK,
        )
