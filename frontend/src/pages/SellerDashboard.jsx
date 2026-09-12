import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

function getProducts(data) {
    if (Array.isArray(data)) return data;
    return data?.results || data?.products || data?.items || [];
}

function getOrders(data) {
    if (Array.isArray(data)) return data;
    return data?.results || data?.orders || data?.items || [];
}

function getProductImage(product) {
    return (
        product?.image ||
        product?.thumbnail ||
        product?.main_image ||
        product?.images?.[0]?.image ||
        product?.images?.[0]?.url ||
        ""
    );
}

function getProductPrice(product) {
    return (
        product?.current_price ||
        product?.discount_price ||
        product?.price ||
        0
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
        value.includes("approved") ||
        value.includes("active")
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
        value.includes("processing") ||
        value.includes("shipping") ||
        value.includes("confirmed")
    ) {
        return "status-info";
    }
    return "status-warning";
}

/* =========================================================
   INLINE ICONS
========================================================= */

const IconBox = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const IconCart = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

const IconCoins = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="6" rx="9" ry="3" />
        <path d="M3 6v6c0 1.66 4.03 3 9 3s9-1.34 9-3V6" />
        <path d="M3 12v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
    </svg>
);

const IconPlus = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
    </svg>
);

const IconWarning = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

const IconStore = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v11H3z" />
        <path d="M9 20v-6h6v6" />
    </svg>
);

const IconInventory = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18v14H3z" />
        <path d="M3 10h18" />
        <path d="M7 6V4h10v2" />
    </svg>
);

const IconList = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
);

/* =========================================================
   SELLER DASHBOARD
========================================================= */

export default function SellerDashboard() {
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const [sellerResponse, productsResponse] = await Promise.all([
                    api.get("/sellers/me/"),
                    api.get("/products/?page_size=100"),
                ]);

                let ordersData = [];
                try {
                    const ordersResponse = await api.get("/orders/?page_size=100");
                    ordersData = getOrders(ordersResponse.data);
                } catch (orderError) {
                    console.warn("Seller orders could not be loaded:", orderError);
                }

                if (mounted) {
                    setSeller(sellerResponse.data);
                    setProducts(getProducts(productsResponse.data));
                    setOrders(ordersData);
                }
            } catch (err) {
                console.error("Failed to load seller dashboard:", err);

                if (mounted) {
                    if (err.response?.status === 401) {
                        setError(
                            "Please sign in to access your seller dashboard."
                        );
                    } else {
                        setError(
                            err.response?.data?.detail ||
                            "We could not load your seller dashboard."
                        );
                    }
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadDashboard();
        return () => { mounted = false; };
    }, []);

    /* ---------- derived metrics (unchanged) ---------- */

    const activeProducts = products.filter(
        (product) => String(product?.status || "").toUpperCase() === "ACTIVE"
    );

    const pendingOrders = orders.filter((order) => {
        const status = String(order?.status || "").toLowerCase();
        return (
            status.includes("pending") ||
            status.includes("processing") ||
            status.includes("confirmed")
        );
    });

    const totalSales = orders.reduce((total, order) => {
        const status = String(order?.status || "").toLowerCase();
        if (status.includes("cancel") || status.includes("failed")) return total;

        return (
            total +
            Number(order?.total_amount ?? order?.grand_total ?? order?.total ?? 0)
        );
    }, 0);

    const recentProducts = products.slice(0, 5);
    const recentOrders = orders.slice(0, 5);

    const storeSlug =
        seller?.store_slug || seller?.slug || seller?.id || "";

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <Header minimal />
                <main className="nf-sd-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading seller dashboard…</p>
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

                <main className="nf-sd-main">
                    <div className="nf-sd-empty" role="alert">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconWarning />
                        </div>
                        <h2>Seller dashboard unavailable</h2>
                        <p>{error}</p>
                        <div className="nf-empty-actions">
                            <Link to="/sell" className="nf-btn-primary">
                                Seller Application
                            </Link>
                            <Link to="/products" className="nf-btn-ghost">
                                Browse Products
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

    return (
        <div className="marketplace">
            <Header />

            <main className="nf-sd-main">

                {/* ---- Heading ---- */}
                <header className="nf-sd-heading">
                    <div>
                        <span className="section-eyebrow">SELLER CENTER</span>
                        <h1>
                            Welcome back
                            {seller?.store_name ? `, ${seller.store_name}` : ""}
                        </h1>
                        <p>
                            Manage your products, orders and store activity
                            from one place.
                        </p>
                    </div>

                    <div className="nf-sd-heading-actions">
                        <Link to="/products" className="nf-btn-ghost">
                            View Marketplace
                        </Link>
                        <Link to="/seller/products/new" className="nf-btn-primary">
                            <IconPlus /> Add Product
                        </Link>
                    </div>
                </header>

                {/* ---- Store banner ---- */}
                <section className="nf-sd-store" aria-label="Store information">
                    <div className="nf-sd-store-identity">
                        <div className="nf-sd-store-logo" aria-hidden="true">
                            {seller?.logo ? (
                                <img
                                    src={seller.logo}
                                    alt={seller?.store_name || "Store"}
                                />
                            ) : (
                                <span>
                                    {(seller?.store_name || "S")
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="nf-sd-store-text">
                            <div className="nf-sd-store-name">
                                <h2>{seller?.store_name || "My Store"}</h2>
                                {seller?.verified && (
                                    <span className="nf-sd-verified">
                                        <IconCheck /> Verified
                                    </span>
                                )}
                            </div>
                            <p>
                                {seller?.location || "Location not provided"}
                            </p>
                        </div>
                    </div>

                    {storeSlug && (
                        <Link
                            to={`/stores/${storeSlug}`}
                            className="nf-sd-store-link"
                        >
                            <IconStore /> View Store <IconArrow />
                        </Link>
                    )}
                </section>

                {/* ---- Metrics ---- */}
                <section className="nf-sd-metrics" aria-label="Store metrics">
                    <div className="nf-sd-metric">
                        <span className="nf-sd-metric-icon"><IconBox /></span>
                        <span className="nf-sd-metric-label">Total Products</span>
                        <strong>{products.length}</strong>
                        <small>Products in your store</small>
                    </div>

                    <div className="nf-sd-metric">
                        <span className="nf-sd-metric-icon is-success"><IconCheck /></span>
                        <span className="nf-sd-metric-label">Active Products</span>
                        <strong>{activeProducts.length}</strong>
                        <small>Currently available</small>
                    </div>

                    <div className="nf-sd-metric">
                        <span className="nf-sd-metric-icon is-info"><IconCart /></span>
                        <span className="nf-sd-metric-label">Orders</span>
                        <strong>{orders.length}</strong>
                        <small>Customer orders</small>
                    </div>

                    <div className="nf-sd-metric">
                        <span className="nf-sd-metric-icon is-accent"><IconCoins /></span>
                        <span className="nf-sd-metric-label">Sales Value</span>
                        <strong>{formatCurrency(totalSales)}</strong>
                        <small>Based on available orders</small>
                    </div>
                </section>

                {/* ---- Two panels ---- */}
                <div className="nf-sd-grid">

                    {/* ---- Recent products ---- */}
                    <section className="nf-sd-panel" aria-labelledby="nf-sd-products-title">
                        <header className="nf-sd-panel-head">
                            <div>
                                <span className="section-eyebrow">PRODUCTS</span>
                                <h2 id="nf-sd-products-title">Recent Products</h2>
                            </div>
                            <Link to="/seller/products" className="nf-sd-panel-link">
                                View All <IconArrow />
                            </Link>
                        </header>

                        {recentProducts.length === 0 ? (
                            <div className="nf-sd-panel-empty">
                                <h3>No products yet</h3>
                                <p>
                                    Add your first product to start building
                                    your store.
                                </p>
                                <Link
                                    to="/seller/products/new"
                                    className="nf-btn-primary"
                                >
                                    <IconPlus /> Add Product
                                </Link>
                            </div>
                        ) : (
                            <div className="nf-sd-list">
                                {recentProducts.map((product) => (
                                    <div className="nf-sd-row" key={product.id}>
                                        <div className="nf-sd-thumb">
                                            {getProductImage(product) ? (
                                                <img
                                                    src={getProductImage(product)}
                                                    alt={product.name}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <span>No Image</span>
                                            )}
                                        </div>

                                        <div className="nf-sd-row-info">
                                            <strong>{product.name || "Product"}</strong>
                                            <span>
                                                {formatCurrency(getProductPrice(product))}
                                            </span>
                                        </div>

                                        <span
                                            className={`order-status-badge ${getStatusClass(product?.status)}`}
                                        >
                                            {normalizeStatus(product?.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ---- Recent orders ---- */}
                    <section className="nf-sd-panel" aria-labelledby="nf-sd-orders-title">
                        <header className="nf-sd-panel-head">
                            <div>
                                <span className="section-eyebrow">ORDERS</span>
                                <h2 id="nf-sd-orders-title">Recent Orders</h2>
                            </div>
                            <Link to="/orders" className="nf-sd-panel-link">
                                View All <IconArrow />
                            </Link>
                        </header>

                        {recentOrders.length === 0 ? (
                            <div className="nf-sd-panel-empty">
                                <h3>No orders yet</h3>
                                <p>
                                    Customer orders will appear here when they
                                    start purchasing from your store.
                                </p>
                            </div>
                        ) : (
                            <div className="nf-sd-list">
                                {recentOrders.map((order) => (
                                    <div
                                        className="nf-sd-row"
                                        key={order.id || order.order_number}
                                    >
                                        <div className="nf-sd-row-info nf-sd-row-info-wide">
                                            <strong>
                                                {order?.order_number ||
                                                    order?.number ||
                                                    `Order #${order?.id || ""}`}
                                            </strong>
                                            <span>
                                                {formatCurrency(
                                                    order?.total_amount ??
                                                        order?.grand_total ??
                                                        order?.total ??
                                                        0
                                                )}
                                            </span>
                                        </div>

                                        <span
                                            className={`order-status-badge ${getStatusClass(order?.status)}`}
                                        >
                                            {normalizeStatus(order?.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* ---- Quick actions ---- */}
                <section className="nf-sd-quick" aria-labelledby="nf-sd-quick-title">
                    <header className="nf-sd-quick-head">
                        <span className="section-eyebrow">STORE MANAGEMENT</span>
                        <h2 id="nf-sd-quick-title">Manage your business</h2>
                        <p>
                            Use the marketplace tools to keep your store up to
                            date.
                        </p>
                    </header>

                    <div className="nf-sd-quick-grid">
                        <Link to="/seller/products" className="nf-sd-quick-card">
                            <span className="nf-sd-quick-icon"><IconList /></span>
                            <strong>Products</strong>
                            <small>Manage your catalog</small>
                            <span className="nf-sd-quick-arrow" aria-hidden="true">
                                <IconArrow />
                            </span>
                        </Link>

                        <Link to="/seller/inventory" className="nf-sd-quick-card">
                            <span className="nf-sd-quick-icon"><IconInventory /></span>
                            <strong>Inventory</strong>
                            <small>Monitor available stock</small>
                            <span className="nf-sd-quick-arrow" aria-hidden="true">
                                <IconArrow />
                            </span>
                        </Link>

                        <Link to="/orders" className="nf-sd-quick-card">
                            <span className="nf-sd-quick-icon"><IconCart /></span>
                            <strong>Orders</strong>
                            <small>Track customer orders</small>
                            <span className="nf-sd-quick-arrow" aria-hidden="true">
                                <IconArrow />
                            </span>
                        </Link>

                        <Link to="/stores" className="nf-sd-quick-card">
                            <span className="nf-sd-quick-icon"><IconStore /></span>
                            <strong>Storefront</strong>
                            <small>View your public store</small>
                            <span className="nf-sd-quick-arrow" aria-hidden="true">
                                <IconArrow />
                            </span>
                        </Link>
                    </div>
                </section>

                {/* ---- Pending alert ---- */}
                {pendingOrders.length > 0 && (
                    <section className="nf-sd-alert" role="status">
                        <div className="nf-sd-alert-icon" aria-hidden="true">
                            <IconWarning />
                        </div>
                        <div>
                            <strong>
                                {pendingOrders.length}{" "}
                                {pendingOrders.length === 1 ? "order" : "orders"}{" "}
                                may need your attention
                            </strong>
                            <p>
                                Review and process them to keep your customers
                                happy.
                            </p>
                        </div>
                        <Link to="/orders" className="nf-btn-ghost">
                            Review Orders <IconArrow />
                        </Link>
                    </section>
                )}
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
                            <label htmlFor="sd-search" className="nf-visually-hidden">
                                Search products
                            </label>
                            <input
                                id="sd-search"
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
                            <Link to="/seller/dashboard" className="marketplace-login">
                                Seller Center
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
                    <h3>Seller</h3>
                    <Link to="/seller/dashboard">Dashboard</Link>
                    <Link to="/seller/products">Products</Link>
                    <Link to="/seller/inventory">Inventory</Link>
                </div>

                <div>
                    <h3>Support</h3>
                    <Link to="/contact">Contact</Link>
                    <Link to="/help">Help Center</Link>
                    <Link to="/returns">Returns</Link>
                </div>
            </div>

            <div className="marketplace-footer-bottom">
                <span>
                    © {new Date().getFullYear()} Nila Fashion. All rights reserved.
                </span>
                <span>Seller Center • Nila Fashion</span>
            </div>
        </footer>
    );
}
