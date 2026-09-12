import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   HELPERS (unchanged)
========================================================= */

function getOrders(data) {
    if (Array.isArray(data)) return data;
    return data?.results || data?.orders || data?.items || [];
}

function getOrderItems(order) {
    return (
        order.items ||
        order.order_items ||
        order.orderItems ||
        []
    );
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatCurrency(amount) {
    return `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;
}

/* =========================================================
   INLINE ICONS
========================================================= */

const IconSearch = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const IconBox = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
    </svg>
);

const IconClock = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const IconCoins = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="6" rx="9" ry="3" />
        <path d="M3 6v6c0 1.66 4.03 3 9 3s9-1.34 9-3V6" />
        <path d="M3 12v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
    </svg>
);

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
    </svg>
);

/* =========================================================
   SELLER ORDERS
========================================================= */

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/orders/?page_size=100");
            setOrders(getOrders(response.data));
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                setError("Please sign in to view your seller orders.");
            } else {
                setError(
                    err.response?.data?.detail || "Unable to load orders."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    /* ---------- filtering (unchanged) ---------- */

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const number =
                order.order_number || order.orderNumber || order.id || "";

            const currentStatus =
                order.status || order.order_status || "PENDING";

            const matchesSearch = String(number)
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesStatus =
                status === "ALL" || currentStatus === status;

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, status]);

    /* ---------- metrics (unchanged) ---------- */

    const totalValue = orders.reduce(
        (sum, order) =>
            sum +
            Number(order.total || order.total_amount || order.grand_total || 0),
        0
    );

    const pending = orders.filter((order) => {
        const value = order.status || order.order_status;
        return value === "PENDING";
    }).length;

    const completed = orders.filter((order) => {
        const value = order.status || order.order_status;
        return value === "COMPLETED";
    }).length;

    const hasActiveFilters = search.trim() !== "" || status !== "ALL";

    function clearFilters() {
        setSearch("");
        setStatus("ALL");
    }

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <SellerHeader minimal />
                <main className="nf-so-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading orders…</p>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       MAIN
    ========================================================= */

    return (
        <div className="marketplace">
            <SellerHeader active="orders" />

            <main className="nf-so-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/seller/dashboard">Seller Center</Link>
                    <span aria-hidden="true">/</span>
                    <span>Orders</span>
                </nav>

                {/* ---- Heading ---- */}
                <header className="nf-so-heading">
                    <div>
                        <span className="section-eyebrow">SALES MANAGEMENT</span>
                        <h1>Orders</h1>
                        <p>Track and manage customer orders.</p>
                    </div>
                </header>

                {error && (
                    <div className="nf-so-banner-error" role="alert">
                        {error}
                    </div>
                )}

                {/* ---- Metrics ---- */}
                <section className="nf-so-metrics" aria-label="Order statistics">
                    <div className="nf-so-metric">
                        <span className="nf-so-metric-icon"><IconBox /></span>
                        <span className="nf-so-metric-label">Total orders</span>
                        <strong>{orders.length}</strong>
                    </div>
                    <div className="nf-so-metric">
                        <span className="nf-so-metric-icon is-accent"><IconClock /></span>
                        <span className="nf-so-metric-label">Pending</span>
                        <strong>{pending}</strong>
                    </div>
                    <div className="nf-so-metric">
                        <span className="nf-so-metric-icon is-success"><IconCheck /></span>
                        <span className="nf-so-metric-label">Completed</span>
                        <strong>{completed}</strong>
                    </div>
                    <div className="nf-so-metric">
                        <span className="nf-so-metric-icon is-info"><IconCoins /></span>
                        <span className="nf-so-metric-label">Order value</span>
                        <strong>{formatCurrency(totalValue)}</strong>
                    </div>
                </section>

                {/* ---- Toolbar ---- */}
                <section className="nf-so-toolbar" aria-label="Filters">
                    <div className="nf-so-search">
                        <span className="nf-so-search-icon" aria-hidden="true">
                            <IconSearch />
                        </span>
                        <label htmlFor="seller-orders-search" className="nf-visually-hidden">
                            Search order number
                        </label>
                        <input
                            id="seller-orders-search"
                            type="search"
                            placeholder="Search order number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <label htmlFor="seller-orders-status" className="nf-visually-hidden">
                        Filter by status
                    </label>
                    <select
                        id="seller-orders-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ALL">All orders</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="nf-so-clear"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    )}
                </section>

                {/* ================= EMPTY ================= */}
                {filteredOrders.length === 0 ? (
                    <section className="nf-so-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconBox />
                        </div>
                        <h2>
                            {hasActiveFilters
                                ? "No matching orders"
                                : "No orders yet"}
                        </h2>
                        <p>
                            {hasActiveFilters
                                ? "Try changing your search or status filter."
                                : "Orders will appear here when customers purchase your products."}
                        </p>
                        {hasActiveFilters ? (
                            <button
                                type="button"
                                className="nf-btn-ghost"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>
                        ) : (
                            <Link
                                to="/seller/products"
                                className="nf-btn-primary"
                            >
                                Manage Products <IconArrow />
                            </Link>
                        )}
                    </section>
                ) : (
                    /* ================= TABLE ================= */
                    <section className="nf-so-table-section" aria-label="Your orders">
                        <header className="nf-so-table-head">
                            <h2>Orders</h2>
                            <span className="nf-so-count">
                                Showing {filteredOrders.length} of{" "}
                                {orders.length} order
                                {orders.length === 1 ? "" : "s"}
                            </span>
                        </header>

                        <div className="nf-so-table-wrap">
                            <table className="nf-so-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Order</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">Items</th>
                                        <th scope="col">Total</th>
                                        <th scope="col">Payment</th>
                                        <th scope="col">Status</th>
                                        <th scope="col" className="nf-so-th-actions">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredOrders.map((order) => {
                                        const number =
                                            order.order_number ||
                                            order.orderNumber ||
                                            `#${order.id}`;

                                        const orderStatus =
                                            order.status ||
                                            order.order_status ||
                                            "PENDING";

                                        const paymentStatus =
                                            order.payment_status ||
                                            order.paymentStatus ||
                                            "PENDING";

                                        const total =
                                            order.total ||
                                            order.total_amount ||
                                            order.grand_total ||
                                            0;

                                        const itemCount = getOrderItems(order).length;

                                        return (
                                            <tr key={order.id}>
                                                <td>
                                                    <strong className="nf-so-number">
                                                        {number}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="nf-so-date">
                                                        {formatDate(order.created_at)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="nf-so-items">
                                                        {itemCount}{" "}
                                                        {itemCount === 1
                                                            ? "item"
                                                            : "items"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="nf-so-total">
                                                        {formatCurrency(total)}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`seller-status seller-status-${String(
                                                            paymentStatus
                                                        ).toLowerCase()}`}
                                                    >
                                                        {paymentStatus}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`seller-status seller-status-${String(
                                                            orderStatus
                                                        ).toLowerCase()}`}
                                                    >
                                                        {orderStatus}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="nf-so-actions">
                                                        <Link
                                                            to={`/orders/${order.id}`}
                                                            className="nf-so-action"
                                                        >
                                                            View
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

/* =========================================================
   SELLER HEADER (local)
========================================================= */

function SellerHeader({ active, minimal = false }) {
    return (
        <>
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
                                <label htmlFor="so-search" className="nf-visually-hidden">
                                    Search products
                                </label>
                                <input
                                    id="so-search"
                                    type="text"
                                    placeholder="Search products, brands and more..."
                                />
                                <button type="submit">Search</button>
                            </form>

                            <div className="marketplace-header-actions">
                                <Link to="/cart" className="nf-header-link">
                                    <span aria-hidden="true">🛍</span>
                                    <span>Cart</span>
                                </Link>
                                <Link
                                    to="/seller/dashboard"
                                    className="marketplace-login"
                                >
                                    Seller Center
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {!minimal && (
                <nav className="marketplace-nav" aria-label="Seller">
                    <div className="marketplace-nav-inner">
                        <Link to="/seller/dashboard">Dashboard</Link>
                        <Link
                            to="/seller/products"
                            className={active === "products" ? "active" : ""}
                        >
                            Products
                        </Link>
                        <Link
                            to="/seller/inventory"
                            className={active === "inventory" ? "active" : ""}
                        >
                            Inventory
                        </Link>
                        <Link
                            to="/seller/orders"
                            className={active === "orders" ? "active" : ""}
                        >
                            Orders
                        </Link>
                        <Link
                            to="/seller/store"
                            className={active === "store" ? "active" : ""}
                        >
                            My Store
                        </Link>
                    </div>
                </nav>
            )}
        </>
    );
}
