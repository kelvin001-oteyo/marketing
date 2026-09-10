from .models import Notification


def create_notification(
    user,
    title,
    message,
    notification_type=Notification.NotificationType.SYSTEM,
    link="",
):
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
    )


def notify_order(
    user,
    title,
    message,
    link="",
):
    return create_notification(
        user=user,
        title=title,
        message=message,
        notification_type=Notification.NotificationType.ORDER,
        link=link,
    )


def notify_payment(
    user,
    title,
    message,
    link="",
):
    return create_notification(
        user=user,
        title=title,
        message=message,
        notification_type=Notification.NotificationType.PAYMENT,
        link=link,
    )


def notify_inventory(
    user,
    title,
    message,
    link="",
):
    return create_notification(
        user=user,
        title=title,
        message=message,
        notification_type=Notification.NotificationType.INVENTORY,
        link=link,
    )


def notify_seller(
    user,
    title,
    message,
    link="",
):
    return create_notification(
        user=user,
        title=title,
        message=message,
        notification_type=Notification.NotificationType.SELLER,
        link=link,
    )


def notify_order_created(
    user,
    order_number,
    total_amount,
):
    return notify_order(
        user=user,
        title="Order placed successfully",
        message=(
            f"Your order {order_number} has been placed "
            f"successfully. Total amount: KES "
            f"{total_amount}."
        ),
        link=f"/account/orders/{order_number}",
    )


def notify_order_status_changed(
    user,
    order_number,
    new_status,
):
    status_labels = {
        "PENDING": "Pending",
        "CONFIRMED": "Confirmed",
        "PROCESSING": "Processing",
        "SHIPPED": "Shipped",
        "OUT_FOR_DELIVERY": "Out for delivery",
        "DELIVERED": "Delivered",
        "CANCELLED": "Cancelled",
    }

    readable_status = status_labels.get(
        new_status,
        new_status,
    )

    return notify_order(
        user=user,
        title="Order status updated",
        message=(
            f"Your order {order_number} is now "
            f"{readable_status}."
        ),
        link=f"/account/orders/{order_number}",
    )


def notify_order_cancelled(
    user,
    order_number,
):
    return notify_order(
        user=user,
        title="Order cancelled",
        message=(
            f"Your order {order_number} has been "
            f"cancelled successfully."
        ),
        link=f"/account/orders/{order_number}",
    )


def notify_seller_new_order(
    user,
    order_number,
):
    return notify_seller(
        user=user,
        title="New order received",
        message=(
            f"You have received products in order "
            f"{order_number}. Please review the order "
            f"and prepare the items for processing."
        ),
        link=f"/seller/orders/{order_number}",
    )