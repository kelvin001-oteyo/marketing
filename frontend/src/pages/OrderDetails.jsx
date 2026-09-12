import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   HELPERS (unchanged)
========================================================= */

function formatCurrency(value) {
    const amount = Number(value || 0);
    return `KSh ${
        Number.isNaN(amount)
            ? "0.00"
            : amount.toLocaleString("en-KE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
    }`;
}

function formatDate(value) {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function normalizeStatus(value) {
    if (!value) return "Pending";
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
    if (Array.isArray(order?.items)) return order.items;
    if (Array.isArray(order?.order_items)) return order.order_items;
    if (Array.isArray(order?.orderItems)) return order.orderItems;
    if (Array.isArray(order?.products)) return order.products;
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
    return Number(item?.quantity ?? item?.qty ?? item?.count ?? 1);
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
        item?.total_price ?? item?.subtotal ?? item?.total;

    if (explicitTotal !== undefined && explicitTotal !== null) {
        return Number(explicitTotal) || 0;
    }
    return getItemPrice(item) * getQuantity(item);
}

/* ---------- NEW: progress step derivation ---------- */

function getProgressStep(status) {
    const value = String(status || "").toLowerCase();

    if (value.includes("delivered") || value.includes("completed")) {
        return 4;
    }
    if (value.includes("shipped") || value.includes("out")) {
        return 3;
    }
    if (
        value.includes("processing") ||
        value.includes("confirmed") ||
        value.includes("paid") ||
        value.includes("packed")
    ) {
        return 2;
    }
    if (value.includes("cancel") || value.includes("failed")) {
        return -1; // special: cancelled
    }
    return 1; // placed
}

/* =========================================================
   INLINE ICONS
========================================================= */

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

const IconCheck = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

/* =========================================================
   ORDER DETAILS
========================================================= */

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
                if (mounted) setOrder(response.data);
            } catch (err) {
                console.error("Failed to load order:", err);

                if (mounted) {
                    if (err.response?.status === 401) {
                        setError("Please sign in to view this order.");
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
                if (mounted) setLoading(false);
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

    /* ---------- derived (unchanged) ---------- */

    const items = getItems(order);

    const subtotal = Number(
        order?.subtotal ?? order?.sub_total ?? order?.items_subtotal ?? 0
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
        order?.payment_status || order?.payment?.status || "pending";

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

    const city = deliveryAddress?.city || order?.city || "";
    const county = deliveryAddress?.county || order?.county || "";

    const deliveryNotes =
        deliveryAddress?.delivery_notes ||
        order?.delivery_notes ||
        order?.notes ||
        "";

    const orderNumber =
        order?.order_number || order?.number || `Order #${id}`;

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <Header minimal />
                <main className="nf-od-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading order details…</p>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {
        return (
            <div className="marketplace">
                <Header minimal />

                <main className="nf-od-main">
                    <div className="nf-od-empty" role="alert">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconWarning />
                        </div>
                        <h2>Unable to load order</h2>
                        <p>{error}</p>
                        <div className="nf-empty-actions">
                            <Link to="/orders" className="nf-btn-primary">
                                Back to Orders
                            </Link>
                            <Link to="/products" className="nf-btn-ghost">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       MAIN
    ========================================================= */

    const progressStep = getProgressStep(orderStatus);
    const isCancelled = progressStep === -1;

    const steps = [
        { key: 1, label: "Placed" },
        { key: 2, label: "Processing" },
        { key: 3, label: "Shipped" },
        { key: 4, label: "Delivered" },
    ];

    return (
        <div className="marketplace">
            <Header />

            <main className="nf-od-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link to="/orders">My Orders</Link>
                    <span aria-hidden="true">/</span>
                    <span>{orderNumber}</span>
                </nav>

                {/* ---- Header ---- */}
                <header className="nf-od-heading">
                    <div>
                        <span className="section-eyebrow">ORDER DETAILS</span>
                        <h1>{orderNumber}</h1>
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

                    <div className="nf-od-badges">
                        <span
                            className={`order-status-badge ${getStatusClass(
                                orderStatus
                            )}`}
                        >
                            {normalizeStatus(orderStatus)}
                        </span>

                        <span
                            className={`order-status-badge ${getStatusClass(
                                paymentStatus
                            )}`}
                        >
                            Payment: {normalizeStatus(paymentStatus)}
                        </span>
                    </div>
                </header>

                {/* ---- Progress tracker ---- */}
                {isCancelled ? (
                    <div className="nf-od-cancelled" role="status">
                        <IconWarning />
                        <div>
                            <strong>Order cancelled</strong>
                            <p>
                                This order was cancelled and won't be
                                delivered. Contact support if you have
                                questions.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ol
                        className="nf-od-progress"
                        aria-label="Order progress"
                    >
                        {steps.map((step, index) => {
                            const isDone = step.key <= progressStep;
                            const isCurrent = step.key === progressStep;
                            return (
                                <li
                                    key={step.key}
                                    className={`nf-od-step ${
                                        isDone ? "is-done" : ""
                                    } ${
                                        isCurrent ? "is-current" : ""
                                    }`}
                                >
                                    <span className="nf-od-step-dot" aria-hidden="true">
                                        {isDone ? <IconCheck /> : step.key}
                                    </span>
                                    <span className="nf-od-step-label">
                                        {step.label}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <span
                                            className="nf-od-step-line"
                                            aria-hidden="true"
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                )}

                {/* ---- Layout ---- */}
                <div className="nf-od-layout">

                    {/* ============ LEFT ============ */}
                    <div className="nf-od-main-col">

                        {/* ---- Items ---- */}
                        <section
                            className="nf-od-card"
                            aria-labelledby="nf-od-items-title"
                        >
                            <header className="nf-od-card-head">
                                <div>
                                    <span className="section-eyebrow">
                                        PURCHASE
                                    </span>
                                    <h2 id="nf-od-items-title">
                                        Ordered items
                                    </h2>
                                </div>
                                <span className="nf-od-count">
                                    {items.length}{" "}
                                    {items.length === 1 ? "item" : "items"}
                                </span>
                            </header>

                            {items.length === 0 ? (
                                <div className="nf-od-no-items">
                                    <p>
                                        No item details are available for
                                        this order.
                                    </p>
                                </div>
                            ) : (
                                <div className="nf-od-items">
                                    {items.map((item, index) => {
                                        const image = getProductImage(item);
                                        const quantity = getQuantity(item);
                                        const price = getItemPrice(item);
                                        const itemTotal = getItemTotal(item);
                                        const name = getProductName(item);

                                        return (
                                            <div
                                                className="nf-od-item"
                                                key={
                                                    item?.id ||
                                                    item?.order_item_id ||
                                                    index
                                                }
                                            >
                                                <div className="nf-od-item-img">
                                                    {image ? (
                                                        <img
                                                            src={image}
                                                            alt={name}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <span>No Image</span>
                                                    )}
                                                </div>

                                                <div className="nf-od-item-info">
                                                    <h3>{name}</h3>
                                                    <p>
                                                        {item?.brand ||
                                                            item?.product?.brand ||
                                                            "Marketplace product"}
                                                    </p>

                                                    {(item?.size ||
                                                        item?.color ||
                                                        item?.variant?.size ||
                                                        item?.variant?.color) && (
                                                        <div className="nf-od-variant">
                                                            {(item?.size ||
                                                                item?.variant?.size) && (
                                                                <span>
                                                                    Size:{" "}
                                                                    {item?.size ||
                                                                        item?.variant?.size}
                                                                </span>
                                                            )}
                                                            {(item?.color ||
                                                                item?.variant?.color) && (
                                                                <span>
                                                                    Color:{" "}
                                                                    {item?.color ||
                                                                        item?.variant?.color}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <span className="nf-od-qty">
                                                        Qty: {quantity}
                                                    </span>
                                                </div>

                                                <div className="nf-od-item-price">
                                                    <span>
                                                        {formatCurrency(price)} each
                                                    </span>
                                                    <strong>
                                                        {formatCurrency(itemTotal)}
                                                    </strong>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* ---- Delivery ---- */}
                        <section
                            className="nf-od-card"
                            aria-labelledby="nf-od-delivery-title"
                        >
                            <header className="nf-od-card-head">
                                <div>
                                    <span className="section-eyebrow">
                                        DELIVERY
                                    </span>
                                    <h2 id="nf-od-delivery-title">
                                        Delivery information
                                    </h2>
                                </div>
                            </header>

                            <div className="nf-od-delivery-grid">
                                <div>
                                    <span>Recipient</span>
                                    <strong>
                                        {customerName || "Not provided"}
                                    </strong>
                                </div>
                                <div>
                                    <span>Phone</span>
                                    <strong>
                                        {phone || "Not provided"}
                                    </strong>
                                </div>
                                <div>
                                    <span>Email</span>
                                    <strong>
                                        {email || "Not provided"}
                                    </strong>
                                </div>
                                <div>
                                    <span>Address</span>
                                    <strong>
                                        {address || "Not provided"}
                                    </strong>
                                </div>
                                <div>
                                    <span>City</span>
                                    <strong>
                                        {city || "Not provided"}
                                    </strong>
                                </div>
                                <div>
                                    <span>County</span>
                                    <strong>
                                        {county || "Not provided"}
                                    </strong>
                                </div>
                            </div>

                            {deliveryNotes && (
                                <div className="nf-od-notes">
                                    <span>Delivery notes</span>
                                    <p>{deliveryNotes}</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ============ RIGHT ============ */}
                    <aside className="nf-od-aside" aria-label="Order summary">
                        <section className="nf-od-summary">
                            <header className="nf-od-card-head">
                                <div>
                                    <span className="section-eyebrow">
                                        SUMMARY
                                    </span>
                                    <h2>Order total</h2>
                                </div>
                            </header>

                            <div className="nf-od-summary-lines">
                                <div className="nf-od-summary-row">
                                    <span>Subtotal</span>
                                    <strong>{formatCurrency(subtotal)}</strong>
                                </div>
                                <div className="nf-od-summary-row">
                                    <span>Shipping</span>
                                    <strong>
                                        {shipping === 0
                                            ? "Free"
                                            : formatCurrency(shipping)}
                                    </strong>
                                </div>
                                <div className="nf-od-summary-total">
                                    <span>Total</span>
                                    <strong>{formatCurrency(total)}</strong>
                                </div>
                            </div>

                            <div className="nf-od-payment-note">
                                <span>Payment method</span>
                                <strong>
                                    {order?.payment_method ||
                                        order?.payment?.method ||
                                        "M-Pesa"}
                                </strong>
                                <p>
                                    Payment status:{" "}
                                    <strong>
                                        {normalizeStatus(paymentStatus)}
                                    </strong>
                                </p>
                            </div>
                        </section>

                        <section className="nf-od-trust">
                            <IconShield />
                            <div>
                                <strong>Need help?</strong>
                                <p>
                                    If you have an issue with this order,
                                    keep your order number ready when
                                    contacting support.
                                </p>
                                <span className="nf-od-trust-ref">
                                    {orderNumber}
                                </span>
                            </div>
                        </section>
                    </aside>
                </div>

                {/* ---- Bottom actions ---- */}
                <div className="nf-od-actions">
                    <Link to="/orders" className="nf-btn-ghost">
                        Back to Orders
                    </Link>
                    <Link to="/products" className="nf-btn-primary">
                        Continue Shopping <IconArrow />
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}

/* =========================================================
   HEADER (local)
========================================================= */

function Header({ minimal = false }) {
    return (
        <header className="marketplace-header">
            <div className="marketplace-header-inner">
                <Link to="/" className="marketplace-logo" aria-label="Nila Fashion home">
                    <span className="marketplace-logo-mark">NF</span>
                    <span>Nila<strong>Fashion</strong></span>
                </Link>

                {!minimal && (
                    <>
                        <form
                            className="marketplace-search"
                            role="search"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <label htmlFor="od-search" className="nf-visually-hidden">
                                Search products
                            </label>
                            <input
                                id="od-search"
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
                    </>
                )}
            </div>
        </header>
    );
}

/* =========================================================
   FOOTER (local)
========================================================= */

function Footer() {
    return (
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
    );
}
