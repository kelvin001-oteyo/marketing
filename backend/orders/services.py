from decimal import Decimal
import uuid

from django.db import transaction
from rest_framework.exceptions import ValidationError

from cart.models import Cart
from inventory.models import InventoryRecord, InventoryTransaction
from .models import Order, OrderItem


def generate_order_number():
    return f"ORD-{uuid.uuid4().hex[:12].upper()}"


@transaction.atomic
def create_order_from_cart(
    user,
    full_name,
    phone,
    address,
    city,
    county,
    notes="",
):
    """
    Create an order from the customer's current cart.

    InventoryRecord is the authoritative source for stock.
    Inventory is locked during checkout to prevent overselling.
    """

    cart = (
        Cart.objects
        .select_related("user")
        .prefetch_related(
            "items__product",
            "items__variant",
        )
        .filter(user=user)
        .first()
    )

    if not cart:
        raise ValidationError(
            {
                "cart": "Cart not found."
            }
        )

    cart_items = list(cart.items.all())

    if not cart_items:
        raise ValidationError(
            {
                "cart": "Your cart is empty."
            }
        )

    subtotal = Decimal("0.00")

    validated_items = []

    for cart_item in cart_items:

        if not cart_item.variant.is_active:
            raise ValidationError(
                {
                    "cart": (
                        f"{cart_item.product.name} "
                        "is no longer available."
                    )
                }
            )

        try:
            inventory = (
                InventoryRecord.objects
                .select_for_update()
                .select_related(
                    "variant",
                    "variant__product",
                    "variant__product__seller",
                )
                .get(
                    variant=cart_item.variant
                )
            )

        except InventoryRecord.DoesNotExist:
            raise ValidationError(
                {
                    "cart": (
                        f"Inventory is not configured for "
                        f"{cart_item.product.name}."
                    )
                }
            )

        available_quantity = inventory.available_quantity

        if available_quantity < cart_item.quantity:
            raise ValidationError(
                {
                    "cart": (
                        f"Not enough stock for "
                        f"{cart_item.product.name}. "
                        f"Only {available_quantity} available."
                    )
                }
            )

        current_price = cart_item.variant.current_price

        item_total = (
            current_price *
            cart_item.quantity
        )

        subtotal += item_total

        validated_items.append(
            {
                "cart_item": cart_item,
                "inventory": inventory,
                "unit_price": current_price,
                "quantity": cart_item.quantity,
            }
        )

    # Temporary shipping rule.
    # This will later be controlled from
    # the admin dashboard.
    shipping_fee = (
        Decimal("0.00")
        if subtotal >= Decimal("5000.00")
        else Decimal("300.00")
    )

    # Promotions and discount rules will be
    # connected later.
    discount = Decimal("0.00")

    total_amount = (
        subtotal
        + shipping_fee
        - discount
    )

    order = Order.objects.create(
        user=user,
        order_number=generate_order_number(),
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        discount=discount,
        total_amount=total_amount,
        payment_status=Order.PaymentStatus.PENDING,
        order_status=Order.OrderStatus.PENDING,
        shipping_full_name=full_name,
        shipping_phone=phone,
        shipping_address=address,
        shipping_city=city,
        shipping_county=county,
        notes=notes,
    )

    for item_data in validated_items:

        cart_item = item_data["cart_item"]
        inventory = item_data["inventory"]
        quantity = item_data["quantity"]
        unit_price = item_data["unit_price"]

        seller = cart_item.product.seller

        OrderItem.objects.create(
            order=order,
            product=cart_item.product,
            variant=cart_item.variant,
            seller=seller,
            quantity=quantity,
            unit_price=unit_price,
        )

        # Reserve inventory.
        inventory.reserved_quantity += quantity

        inventory.save(
            update_fields=[
                "reserved_quantity",
                "updated_at",
            ]
        )

        InventoryTransaction.objects.create(
            inventory=inventory,
            transaction_type=(
                InventoryTransaction
                .TransactionType
                .RESERVATION
            ),
            quantity=quantity,
            reference=order.order_number,
            notes=(
                f"Stock reserved for order "
                f"{order.order_number}."
            ),
        )

    # Remove cart items only after the order
    # and inventory reservations succeed.
    cart.items.all().delete()

    return order