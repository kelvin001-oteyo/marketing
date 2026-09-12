import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   HELPERS (unchanged)
========================================================= */

function getOrdersFromResponse(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.orders)) return data.orders;
    if (Array.isArray(data?.items)) return data.items;
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
    if (!dateValue) return "Date unavailable";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

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
                Number(item?.quantity ?? item?.qty ?? item?.count ?? 1)
            );
        }, 0);
    }

    return Number(
        order?.item_count ?? order?.items_count ?? order?.quantity ?? 0
    );
}

function normalizeStatus(status) {
    if (!status) return "Pending";
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

/* =========================================================
   INLINE ICONS
========================================================= */

const IconBox = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
    </svg>
);

const IconWarning = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
    </svg>
);

/* =========================================================
   ORDERS
========================================================= */

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/orders/");
            setOrders(getOrdersFromResponse(response.data));
        } catch (err) {
            console.error("Failed to load orders:", err);

            if (err.response?.status === 401) {
                setError("Please sign in to view your orders.");
            } else {
                setError(
                    err.response?.data?.detail ||
                    "We could not load your orders right now."
                );
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div className="marketplace">

            {/* ================= HEADER ================= */}
            <header className="marketplace-header">
                <div className="marketplace-header-inner">
                    <Link to="/" className="marketplace-logo" aria-label="Nila Fashion home">
                        <span className="marketplace-logo-mark">NF</span>
                        <span>Nila<strong>Fashion</strong></span>
                    </Link>

                    <form
                        className="marketplace-search"
                        role="search"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <label htmlFor="orders-search" className="nf-visually-hidden">
                            Search products
                        </label>
                        <input
                            id="orders-search"
                            type="text"
                            placeholder="Search products, brands and more..."
                        />
                        <button type="submit">Search</button>
                    </form>

                    <div className="marketplace-header-actions">
                        <Link to="/wishlist" className="nf-header-link">
                            <span aria-hidden="true">♡</span>
                            <span>Wishlist</span>
                        </Link>
                        <Link to="/cart" className="nf-header-link">
                            <span aria-hidden="true">🛍</span>
                            <span>Cart</span>
                        </Link>
                        <Link to="/profile" className="marketplace-login">
                            My Account
                        </Link>
                    </div>
                </div>
            </header>

            {/* ================= NAV ================= */}
            <nav className="marketplace-nav" aria-label="Primary">
                <div className="marketplace-nav-inner">
                    <Link to="/">Home</Link>
                    <Link to="/products">All Products</Link>
                    <Link to="/categories">Categories</Link>
                    <Link to="/stores">Stores</Link>
                    <Link to="/orders" className="active">Orders</Link>
                    <Link to="/wishlist">Wishlist</Link>
                    <Link to="/profile">Account</Link>
                </div>
            </nav>

            <main className="nf-orders-main">

                {/* ---- Heading ---- */}
                <header className="nf-orders-heading">
                    <div>
                        <span className="section-eyebrow">ACCOUNT</span>
                        <h1>My Orders</h1>
                        <p>
                            Track your purchases and view your order
                            details.
                        </p>
                    </div>

                    <Link to="/products" className="nf-btn-primary">
                        Continue Shopping <IconArrow />
                    </Link>
                </header>

                {/* ================= LOADING ================= */}
                {loading && (
                    <section className="nf-orders-skeleton" aria-hidden="true">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div className="nf-order-skeleton-card" key={i}>
                                <div className="nf-skeleton-line" />
                                <div className="nf-skeleton-line short" />
                                <div className="nf-skeleton-grid">
                                    <div className="nf-skeleton-line" />
                                    <div className="nf-skeleton-line" />
                                    <div className="nf-skeleton-line" />
                                    <div className="nf-skeleton-line" />
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* ================= ERROR ================= */}
                {!loading && error && (
                    <section className="nf-orders-empty" role="alert">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconWarning />
                        </div>
                        <h2>Unable to load orders</h2>
                        <p>{error}</p>
                        <div className="nf-empty-actions">
                            <button
                                type="button"
                                className="nf-btn-primary"
                                onClick={fetchOrders}
                            >
                                Try Again
                            </button>
                            <Link to="/products" className="nf-btn-ghost">
                                Continue Shopping
                            </Link>
                        </div>
                    </section>
                )}

                {/* ================= EMPTY ================= */}
                {!loading && !error && orders.length === 0 && (
                    <section className="nf-orders-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconBox />
                        </div>
                        <h2>No orders yet</h2>
                        <p>
                            You haven't placed any orders yet. Browse the
                            marketplace and find something you like.
                        </p>
                        <div className="nf-empty-actions">
                            <Link to="/products" className="nf-btn-primary">
                                Start Shopping <IconArrow />
                            </Link>
                        </div>
                    </section>
                )}

                {/* ================= LIST ================= */}
                {!loading && !error && orders.length > 0 && (
                    <section
                        className="nf-orders-list-section"
                        aria-label="Your orders"
                    >
                        <div className="nf-orders-summary">
                            <div>
                                <strong>{orders.length}</strong>{" "}
                                {orders.length === 1 ? "order" : "orders"} found
                            </div>
                            <Link to="/products" className="nf-orders-browse">
                                Browse Products <IconArrow />
                            </Link>
                        </div>

                        <div className="nf-orders-list">
                            {orders.map((order) => {
                                const orderId = getOrderId(order);
                                const orderStatus = order?.status || "pending";
                                const paymentStatus = getPaymentStatus(order);
                                const statusClass = getStatusClass(orderStatus);

                                return (
                                    <article
                                        className="nf-order-card"
                                        key={orderId || getOrderNumber(order)}
                                    >
                                        {/* ---- Card top ---- */}
                                        <header className="nf-order-card-top">
                                            <div className="nf-order-id-block">
                                                <span className="nf-order-label">
                                                    ORDER
                                                </span>
                                                <h2>{getOrderNumber(order)}</h2>
                                            </div>

                                            <span
                                                className={`order-status-badge ${statusClass}`}
                                            >
                                                {normalizeStatus(orderStatus)}
                                            </span>
                                        </header>

                                        {/* ---- Details grid ---- */}
                                        <div className="nf-order-details">
                                            <div className="nf-order-detail">
                                                <span>Order Date</span>
                                                <strong>
                                                    {formatDate(
                                                        order?.created_at ||
                                                        order?.created ||
                                                        order?.date ||
                                                        order?.ordered_at
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="nf-order-detail">
                                                <span>Items</span>
                                                <strong>
                                                    {getItemCount(order) || "—"}
                                                </strong>
                                            </div>

                                            <div className="nf-order-detail">
                                                <span>Payment</span>
                                                <strong
                                                    className={getStatusClass(
                                                        paymentStatus
                                                    )}
                                                >
                                                    {normalizeStatus(paymentStatus)}
                                                </strong>
                                            </div>

                                            <div className="nf-order-detail">
                                                <span>Total</span>
                                                <strong className="nf-order-total">
                                                    {formatCurrency(
                                                        getOrderTotal(order)
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* ---- Footer ---- */}
                                        <footer className="nf-order-card-foot">
                                            <div className="nf-order-progress">
                                                <span
                                                    className={`nf-order-dot ${statusClass}`}
                                                    aria-hidden="true"
                                                />
                                                <span>
                                                    Order status:{" "}
                                                    <strong>
                                                        {normalizeStatus(orderStatus)}
                                                    </strong>
                                                </span>
                                            </div>

                                            {orderId ? (
                                                <Link
                                                    to={`/orders/${orderId}`}
                                                    className="nf-order-view"
                                                >
                                                    View Order <IconArrow />
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="nf-order-view"
                                                    disabled
                                                >
                                                    View Order
                                                </button>
                                            )}
                                        </footer>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            {/* ================= FOOTER ================= */}
            <footer className="marketplace-footer">
                <div className="marketplace-footer-grid">
                    <div>
                        <Link to="/" className="marketplace-logo footer-logo">
                            <span className="marketplace-logo-mark">NF</span>
                            <span>Nila<strong>Fashion</strong></span>
                        </Link>
                        <p>
                            A modern marketplace connecting customers with
                            trusted sellers.
                        </p>
                    </div>

                    <div>
                        <h3>Marketplace</h3>
                        <Link to="/products">Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                    </div>

                    <div>
                        <h3>Customer</h3>
                        <Link to="/orders">Orders</Link>
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/cart">Cart</Link>
                    </div>

                    <div>
                        <h3>Sell with us</h3>
                        <Link to="/sell">Become a seller</Link>
                        <Link to="/seller">Seller dashboard</Link>
                    </div>
                </div>

                <div className="marketplace-footer-bottom">
                    <span>
                        © {new Date().getFullYear()} Nila Fashion. All rights reserved.
                    </span>
                    <span>Secure checkout • M-Pesa supported</span>
                </div>
            </footer>
        </div>
    );
}
