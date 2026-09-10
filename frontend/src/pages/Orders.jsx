import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

function getOrdersFromResponse(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    if (Array.isArray(data?.orders)) {
        return data.orders;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    return [];
}

function getOrderId(order) {
    return order?.id || order?.order_id || order?.pk;
}

function getOrderNumber(order) {
    return (
        order?.order_number ||
        order?.number ||
        order?.reference ||
        `#${getOrderId(order) || "N/A"}`
    );
}

function getOrderTotal(order) {
    const value =
        order?.total_amount ??
        order?.grand_total ??
        order?.total ??
        order?.amount ??
        0;

    const numericValue = Number(value);

    return Number.isNaN(numericValue) ? 0 : numericValue;
}

function formatCurrency(amount) {
    return `KSh ${Number(amount || 0).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getItemCount(order) {
    if (Array.isArray(order?.items)) {
        return order.items.reduce((total, item) => {
            return (
                total +
                Number(
                    item?.quantity ??
                        item?.qty ??
                        item?.count ??
                        1
                )
            );
        }, 0);
    }

    return Number(
        order?.item_count ??
            order?.items_count ??
            order?.quantity ??
            0
    );
}

function normalizeStatus(status) {
    if (!status) {
        return "Pending";
    }

    return String(status)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status) {
    const value = String(status || "").toLowerCase();

    if (
        value.includes("delivered") ||
        value.includes("completed") ||
        value.includes("paid")
    ) {
        return "status-success";
    }

    if (
        value.includes("cancel") ||
        value.includes("failed") ||
        value.includes("rejected")
    ) {
        return "status-danger";
    }

    if (
        value.includes("shipping") ||
        value.includes("processing") ||
        value.includes("confirmed")
    ) {
        return "status-info";
    }

    return "status-warning";
}

function getPaymentStatus(order) {
    return (
        order?.payment_status ||
        order?.payment?.status ||
        order?.paymentState ||
        "Pending"
    );
}

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function fetchOrders() {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/orders/");

                if (mounted) {
                    setOrders(getOrdersFromResponse(response.data));
                }
            } catch (err) {
                console.error("Failed to load orders:", err);

                if (mounted) {
                    if (err.response?.status === 401) {
                        setError(
                            "Please sign in to view your orders."
                        );
                    } else {
                        setError(
                            err.response?.data?.detail ||
                                "We could not load your orders right now."
                        );
                    }
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        fetchOrders();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <div className="marketplace-header-inner">
                    <Link to="/" className="marketplace-logo">
                        Oteyo<span>Store</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/">Home</Link>
                        <Link to="/products">Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                        <Link to="/wishlist">Wishlist</Link>
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
                <section className="marketplace-page-heading">
                    <div>
                        <span className="marketplace-eyebrow">
                            ACCOUNT
                        </span>

                        <h1>My Orders</h1>

                        <p>
                            Track your purchases and view your order
                            details.
                        </p>
                    </div>

                    <Link
                        to="/products"
                        className="marketplace-primary-button"
                    >
                        Continue Shopping
                    </Link>
                </section>

                {loading && (
                    <section className="marketplace-state-card">
                        <div className="marketplace-loader"></div>
                        <h3>Loading your orders</h3>
                        <p>
                            Please wait while we retrieve your order
                            history.
                        </p>
                    </section>
                )}

                {!loading && error && (
                    <section className="marketplace-state-card marketplace-error-state">
                        <div className="marketplace-state-icon">
                            !
                        </div>

                        <h3>Unable to load orders</h3>

                        <p>{error}</p>

                        <div className="marketplace-state-actions">
                            <button
                                type="button"
                                className="marketplace-primary-button"
                                onClick={() =>
                                    window.location.reload()
                                }
                            >
                                Try Again
                            </button>

                            <Link
                                to="/products"
                                className="marketplace-secondary-button"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </section>
                )}

                {!loading && !error && orders.length === 0 && (
                    <section className="marketplace-state-card">
                        <div className="marketplace-state-icon">
                            O
                        </div>

                        <h3>No orders yet</h3>

                        <p>
                            You have not placed any orders yet. Browse
                            the marketplace and find something you like.
                        </p>

                        <Link
                            to="/products"
                            className="marketplace-primary-button"
                        >
                            Start Shopping
                        </Link>
                    </section>
                )}

                {!loading && !error && orders.length > 0 && (
                    <section className="orders-page-section">
                        <div className="orders-summary-bar">
                            <div>
                                <strong>
                                    {orders.length}
                                </strong>{" "}
                                {orders.length === 1
                                    ? "order"
                                    : "orders"}{" "}
                                found
                            </div>

                            <Link to="/products">
                                Browse Products
                            </Link>
                        </div>

                        <div className="orders-list">
                            {orders.map((order) => {
                                const orderId = getOrderId(order);
                                const orderStatus =
                                    order?.status || "pending";
                                const paymentStatus =
                                    getPaymentStatus(order);

                                return (
                                    <article
                                        className="order-card"
                                        key={orderId || getOrderNumber(order)}
                                    >
                                        <div className="order-card-top">
                                            <div>
                                                <span className="order-label">
                                                    ORDER
                                                </span>

                                                <h2>
                                                    {getOrderNumber(
                                                        order
                                                    )}
                                                </h2>
                                            </div>

                                            <span
                                                className={`order-status-badge ${getStatusClass(
                                                    orderStatus
                                                )}`}
                                            >
                                                {normalizeStatus(
                                                    orderStatus
                                                )}
                                            </span>
                                        </div>

                                        <div className="order-card-details">
                                            <div className="order-detail">
                                                <span>
                                                    Order Date
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        order?.created_at ||
                                                            order?.created ||
                                                            order?.date ||
                                                            order?.ordered_at
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="order-detail">
                                                <span>
                                                    Items
                                                </span>

                                                <strong>
                                                    {getItemCount(
                                                        order
                                                    ) || "—"}
                                                </strong>
                                            </div>

                                            <div className="order-detail">
                                                <span>
                                                    Payment
                                                </span>

                                                <strong
                                                    className={getStatusClass(
                                                        paymentStatus
                                                    )}
                                                >
                                                    {normalizeStatus(
                                                        paymentStatus
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="order-detail">
                                                <span>
                                                    Total
                                                </span>

                                                <strong className="order-total">
                                                    {formatCurrency(
                                                        getOrderTotal(
                                                            order
                                                        )
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="order-card-footer">
                                            <div className="order-progress">
                                                <span
                                                    className={`order-progress-dot ${getStatusClass(
                                                        orderStatus
                                                    )}`}
                                                ></span>

                                                <span>
                                                    Order status:{" "}
                                                    <strong>
                                                        {normalizeStatus(
                                                            orderStatus
                                                        )}
                                                    </strong>
                                                </span>
                                            </div>

                                            {orderId ? (
                                                <Link
                                                    to={`/orders/${orderId}`}
                                                    className="marketplace-secondary-button"
                                                >
                                                    View Order
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="marketplace-secondary-button"
                                                    disabled
                                                >
                                                    View Order
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
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
                            A modern marketplace connecting customers
                            with trusted sellers.
                        </p>
                    </div>

                    <div className="marketplace-footer-links">
                        <Link to="/products">Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/cart">Cart</Link>
                        <Link to="/orders">Orders</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}