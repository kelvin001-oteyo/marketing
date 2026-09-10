import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

function formatCurrency(value) {
    const amount = Number(value || 0);

    return `KSh ${Number.isNaN(amount)
        ? "0.00"
        : amount.toLocaleString("en-KE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}`;
}

function formatDate(value) {
    if (!value) {
        return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function normalizeStatus(value) {
    if (!value) {
        return "Pending";
    }

    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(value) {
    const status = String(value || "").toLowerCase();

    if (
        status.includes("delivered") ||
        status.includes("completed") ||
        status.includes("paid")
    ) {
        return "status-success";
    }

    if (
        status.includes("cancel") ||
        status.includes("failed") ||
        status.includes("rejected")
    ) {
        return "status-danger";
    }

    if (
        status.includes("shipping") ||
        status.includes("processing") ||
        status.includes("confirmed")
    ) {
        return "status-info";
    }

    return "status-warning";
}

function getItems(order) {
    if (Array.isArray(order?.items)) {
        return order.items;
    }

    if (Array.isArray(order?.order_items)) {
        return order.order_items;
    }

    if (Array.isArray(order?.orderItems)) {
        return order.orderItems;
    }

    if (Array.isArray(order?.products)) {
        return order.products;
    }

    return [];
}

function getProductName(item) {
    return (
        item?.product_name ||
        item?.product?.name ||
        item?.variant?.product?.name ||
        item?.name ||
        "Product"
    );
}

function getProductImage(item) {
    return (
        item?.product_image ||
        item?.image ||
        item?.product?.image ||
        item?.variant?.image ||
        ""
    );
}

function getQuantity(item) {
    return Number(
        item?.quantity ??
            item?.qty ??
            item?.count ??
            1
    );
}

function getItemPrice(item) {
    return Number(
        item?.price ??
            item?.unit_price ??
            item?.product?.current_price ??
            item?.product?.price ??
            0
    );
}

function getItemTotal(item) {
    const explicitTotal =
        item?.total_price ??
        item?.subtotal ??
        item?.total;

    if (explicitTotal !== undefined && explicitTotal !== null) {
        return Number(explicitTotal) || 0;
    }

    return getItemPrice(item) * getQuantity(item);
}

export default function OrderDetails() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function fetchOrder() {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/orders/${id}/`);

                if (mounted) {
                    setOrder(response.data);
                }
            } catch (err) {
                console.error("Failed to load order:", err);

                if (mounted) {
                    if (err.response?.status === 401) {
                        setError(
                            "Please sign in to view this order."
                        );
                    } else if (err.response?.status === 404) {
                        setError("This order could not be found.");
                    } else {
                        setError(
                            err.response?.data?.detail ||
                                "We could not load this order right now."
                        );
                    }
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        if (id) {
            fetchOrder();
        } else {
            setLoading(false);
            setError("No order was selected.");
        }

        return () => {
            mounted = false;
        };
    }, [id]);

    const items = getItems(order);

    const subtotal = Number(
        order?.subtotal ??
            order?.sub_total ??
            order?.items_subtotal ??
            0
    );

    const shipping = Number(
        order?.shipping_cost ??
            order?.shipping_fee ??
            order?.delivery_fee ??
            order?.shipping ??
            0
    );

    const total = Number(
        order?.total_amount ??
            order?.grand_total ??
            order?.total ??
            subtotal + shipping
    );

    const orderStatus = order?.status || "pending";

    const paymentStatus =
        order?.payment_status ||
        order?.payment?.status ||
        "pending";

    const deliveryAddress =
        order?.shipping_address ||
        order?.delivery_address ||
        order?.address ||
        {};

    const customerName =
        deliveryAddress?.full_name ||
        deliveryAddress?.name ||
        order?.customer_name ||
        order?.full_name ||
        "";

    const phone =
        deliveryAddress?.phone ||
        order?.phone ||
        order?.customer_phone ||
        "";

    const email =
        deliveryAddress?.email ||
        order?.email ||
        order?.customer_email ||
        "";

    const address =
        deliveryAddress?.address ||
        deliveryAddress?.street ||
        order?.address ||
        "";

    const city =
        deliveryAddress?.city ||
        order?.city ||
        "";

    const county =
        deliveryAddress?.county ||
        order?.county ||
        "";

    const deliveryNotes =
        deliveryAddress?.delivery_notes ||
        order?.delivery_notes ||
        order?.notes ||
        "";

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <div className="marketplace-header-inner">
                    <Link
                        to="/"
                        className="marketplace-logo"
                    >
                        Oteyo<span>Store</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/">Home</Link>
                        <Link to="/products">Products</Link>
                        <Link to="/categories">
                            Categories
                        </Link>
                        <Link to="/stores">Stores</Link>
                        <Link to="/wishlist">
                            Wishlist
                        </Link>
                        <Link to="/cart">Cart</Link>
                        <Link
                            to="/orders"
                            className="marketplace-nav-active"
                        >
                            Orders
                        </Link>
                    </nav>

                    <div className="marketplace-header-actions">
                        <Link
                            to="/sell"
                            className="marketplace-seller-link"
                        >
                            Sell on OteyoStore
                        </Link>

                        <Link
                            to="/cart"
                            className="marketplace-cart-button"
                        >
                            Cart
                        </Link>
                    </div>
                </div>
            </header>

            <main className="marketplace-main">
                {loading && (
                    <section className="marketplace-state-card">
                        <div className="marketplace-loader"></div>

                        <h3>
                            Loading order details
                        </h3>

                        <p>
                            Please wait while we retrieve
                            your order.
                        </p>
                    </section>
                )}

                {!loading && error && (
                    <section className="marketplace-state-card marketplace-error-state">
                        <div className="marketplace-state-icon">
                            !
                        </div>

                        <h3>
                            Unable to load order
                        </h3>

                        <p>{error}</p>

                        <div className="marketplace-state-actions">
                            <Link
                                to="/orders"
                                className="marketplace-primary-button"
                            >
                                Back to Orders
                            </Link>

                            <Link
                                to="/products"
                                className="marketplace-secondary-button"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </section>
                )}

                {!loading && !error && order && (
                    <>
                        <div className="order-details-breadcrumb">
                            <Link to="/orders">
                                My Orders
                            </Link>

                            <span>/</span>

                            <span>
                                {order?.order_number ||
                                    order?.number ||
                                    `Order #${id}`}
                            </span>
                        </div>

                        <section className="order-details-header">
                            <div>
                                <span className="marketplace-eyebrow">
                                    ORDER DETAILS
                                </span>

                                <h1>
                                    {order?.order_number ||
                                        order?.number ||
                                        `Order #${id}`}
                                </h1>

                                <p>
                                    Placed on{" "}
                                    {formatDate(
                                        order?.created_at ||
                                            order?.created ||
                                            order?.date ||
                                            order?.ordered_at
                                    )}
                                </p>
                            </div>

                            <div className="order-details-statuses">
                                <span
                                    className={`order-status-badge ${getStatusClass(
                                        orderStatus
                                    )}`}
                                >
                                    {normalizeStatus(
                                        orderStatus
                                    )}
                                </span>

                                <span
                                    className={`order-status-badge ${getStatusClass(
                                        paymentStatus
                                    )}`}
                                >
                                    Payment:{" "}
                                    {normalizeStatus(
                                        paymentStatus
                                    )}
                                </span>
                            </div>
                        </section>

                        <div className="order-details-layout">
                            <div className="order-details-main">
                                <section className="order-details-card">
                                    <div className="order-details-card-heading">
                                        <div>
                                            <span className="marketplace-eyebrow">
                                                PURCHASE
                                            </span>

                                            <h2>
                                                Ordered Items
                                            </h2>
                                        </div>

                                        <span>
                                            {items.length}{" "}
                                            {items.length === 1
                                                ? "item"
                                                : "items"}
                                        </span>
                                    </div>

                                    {items.length === 0 ? (
                                        <div className="order-no-items">
                                            <p>
                                                No item details
                                                are available
                                                for this order.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="order-items-list">
                                            {items.map(
                                                (
                                                    item,
                                                    index
                                                ) => {
                                                    const image =
                                                        getProductImage(
                                                            item
                                                        );

                                                    const quantity =
                                                        getQuantity(
                                                            item
                                                        );

                                                    const price =
                                                        getItemPrice(
                                                            item
                                                        );

                                                    const itemTotal =
                                                        getItemTotal(
                                                            item
                                                        );

                                                    return (
                                                        <div
                                                            className="order-item-row"
                                                            key={
                                                                item?.id ||
                                                                item?.order_item_id ||
                                                                index
                                                            }
                                                        >
                                                            <div className="order-item-image">
                                                                {image ? (
                                                                    <img
                                                                        src={
                                                                            image
                                                                        }
                                                                        alt={getProductName(
                                                                            item
                                                                        )}
                                                                    />
                                                                ) : (
                                                                    <span>
                                                                        No Image
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="order-item-info">
                                                                <h3>
                                                                    {getProductName(
                                                                        item
                                                                    )}
                                                                </h3>

                                                                <p>
                                                                    {item?.brand ||
                                                                        item?.product?.brand ||
                                                                        "Marketplace product"}
                                                                </p>

                                                                {(
                                                                    item?.size ||
                                                                    item?.color ||
                                                                    item?.variant?.size ||
                                                                    item?.variant?.color
                                                                ) && (
                                                                    <div className="order-item-variant">
                                                                        {(
                                                                            item?.size ||
                                                                            item?.variant?.size
                                                                        ) && (
                                                                            <span>
                                                                                Size:{" "}
                                                                                {item?.size ||
                                                                                    item?.variant?.size}
                                                                            </span>
                                                                        )}

                                                                        {(
                                                                            item?.color ||
                                                                            item?.variant?.color
                                                                        ) && (
                                                                            <span>
                                                                                Color:{" "}
                                                                                {item?.color ||
                                                                                    item?.variant?.color}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <span className="order-item-quantity">
                                                                    Qty:{" "}
                                                                    {
                                                                        quantity
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="order-item-pricing">
                                                                <span>
                                                                    {formatCurrency(
                                                                        price
                                                                    )}{" "}
                                                                    each
                                                                </span>

                                                                <strong>
                                                                    {formatCurrency(
                                                                        itemTotal
                                                                    )}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </section>

                                <section className="order-details-card">
                                    <div className="order-details-card-heading">
                                        <div>
                                            <span className="marketplace-eyebrow">
                                                DELIVERY
                                            </span>

                                            <h2>
                                                Delivery Information
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="delivery-information-grid">
                                        <div>
                                            <span>
                                                Recipient
                                            </span>

                                            <strong>
                                                {customerName ||
                                                    "Not provided"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Phone
                                            </span>

                                            <strong>
                                                {phone ||
                                                    "Not provided"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Email
                                            </span>

                                            <strong>
                                                {email ||
                                                    "Not provided"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Address
                                            </span>

                                            <strong>
                                                {address ||
                                                    "Not provided"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                City
                                            </span>

                                            <strong>
                                                {city ||
                                                    "Not provided"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                County
                                            </span>

                                            <strong>
                                                {county ||
                                                    "Not provided"}
                                            </strong>
                                        </div>
                                    </div>

                                    {deliveryNotes && (
                                        <div className="delivery-notes">
                                            <span>
                                                Delivery Notes
                                            </span>

                                            <p>
                                                {
                                                    deliveryNotes
                                                }
                                            </p>
                                        </div>
                                    )}
                                </section>
                            </div>

                            <aside className="order-details-sidebar">
                                <section className="order-details-card order-summary-card">
                                    <div className="order-details-card-heading">
                                        <div>
                                            <span className="marketplace-eyebrow">
                                                SUMMARY
                                            </span>

                                            <h2>
                                                Order Total
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="order-summary-lines">
                                        <div>
                                            <span>
                                                Subtotal
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    subtotal
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Shipping
                                            </span>

                                            <strong>
                                                {shipping === 0
                                                    ? "Free"
                                                    : formatCurrency(
                                                          shipping
                                                      )}
                                            </strong>
                                        </div>

                                        <div className="order-summary-total">
                                            <span>
                                                Total
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    total
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="order-payment-note">
                                        <span>
                                            Payment Method
                                        </span>

                                        <strong>
                                            {order?.payment_method ||
                                                order?.payment?.method ||
                                                "M-Pesa"}
                                        </strong>

                                        <p>
                                            Payment integration
                                            can be connected when
                                            the M-Pesa module is
                                            finalized.
                                        </p>
                                    </div>
                                </section>

                                <section className="order-trust-card">
                                    <h3>
                                        Need help?
                                    </h3>

                                    <p>
                                        If you have an issue with
                                        this order, keep your order
                                        number ready when contacting
                                        support.
                                    </p>

                                    <strong>
                                        Order{" "}
                                        {order?.order_number ||
                                            `#${id}`}
                                    </strong>
                                </section>
                            </aside>
                        </div>

                        <div className="order-details-actions">
                            <Link
                                to="/orders"
                                className="marketplace-secondary-button"
                            >
                                Back to Orders
                            </Link>

                            <Link
                                to="/products"
                                className="marketplace-primary-button"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </>
                )}
            </main>

            <footer className="marketplace-footer">
                <div className="marketplace-footer-inner">
                    <div>
                        <Link
                            to="/"
                            className="marketplace-logo"
                        >
                            Oteyo<span>Store</span>
                        </Link>

                        <p>
                            A modern marketplace connecting
                            customers with trusted sellers.
                        </p>
                    </div>

                    <div className="marketplace-footer-links">
                        <Link to="/products">
                            Products
                        </Link>

                        <Link to="/categories">
                            Categories
                        </Link>

                        <Link to="/stores">
                            Stores
                        </Link>

                        <Link to="/wishlist">
                            Wishlist
                        </Link>

                        <Link to="/cart">
                            Cart
                        </Link>

                        <Link to="/orders">
                            Orders
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}