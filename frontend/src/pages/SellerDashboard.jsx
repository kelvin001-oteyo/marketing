import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

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
    if (Array.isArray(data)) {
        return data;
    }

    return data?.results || data?.products || data?.items || [];
}

function getOrders(data) {
    if (Array.isArray(data)) {
        return data;
    }

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
    if (!status) {
        return "Pending";
    }

    return String(status)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
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

                const [sellerResponse, productsResponse] =
                    await Promise.all([
                        api.get("/sellers/me/"),
                        api.get("/products/?page_size=100"),
                    ]);

                let ordersData = [];

                try {
                    const ordersResponse =
                        await api.get(
                            "/orders/?page_size=100"
                        );

                    ordersData = getOrders(
                        ordersResponse.data
                    );
                } catch (orderError) {
                    console.warn(
                        "Seller orders could not be loaded:",
                        orderError
                    );
                }

                if (mounted) {
                    setSeller(sellerResponse.data);
                    setProducts(
                        getProducts(productsResponse.data)
                    );
                    setOrders(ordersData);
                }
            } catch (err) {
                console.error(
                    "Failed to load seller dashboard:",
                    err
                );

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
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            mounted = false;
        };
    }, []);

    const activeProducts = products.filter(
        (product) =>
            String(product?.status || "")
                .toUpperCase() === "ACTIVE"
    );

    const pendingOrders = orders.filter((order) => {
        const status = String(
            order?.status || ""
        ).toLowerCase();

        return (
            status.includes("pending") ||
            status.includes("processing") ||
            status.includes("confirmed")
        );
    });

    const totalSales = orders.reduce(
        (total, order) => {
            const status = String(
                order?.status || ""
            ).toLowerCase();

            if (
                status.includes("cancel") ||
                status.includes("failed")
            ) {
                return total;
            }

            return (
                total +
                Number(
                    order?.total_amount ??
                        order?.grand_total ??
                        order?.total ??
                        0
                )
            );
        },
        0
    );

    const recentProducts = products.slice(0, 5);
    const recentOrders = orders.slice(0, 5);

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
                        <Link to="/">
                            Home
                        </Link>

                        <Link to="/products">
                            Products
                        </Link>

                        <Link to="/categories">
                            Categories
                        </Link>

                        <Link to="/stores">
                            Stores
                        </Link>

                        <Link to="/orders">
                            Orders
                        </Link>
                    </nav>

                    <div className="marketplace-header-actions">
                        <Link
                            to="/sell/dashboard"
                            className="marketplace-seller-link"
                        >
                            Seller Dashboard
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
                            Loading seller dashboard
                        </h3>

                        <p>
                            Please wait while we retrieve
                            your store information.
                        </p>
                    </section>
                )}

                {!loading && error && (
                    <section className="marketplace-state-card marketplace-error-state">
                        <div className="marketplace-state-icon">
                            !
                        </div>

                        <h3>
                            Seller dashboard unavailable
                        </h3>

                        <p>{error}</p>

                        <div className="marketplace-state-actions">
                            <Link
                                to="/sell"
                                className="marketplace-primary-button"
                            >
                                Seller Application
                            </Link>

                            <Link
                                to="/products"
                                className="marketplace-secondary-button"
                            >
                                Browse Products
                            </Link>
                        </div>
                    </section>
                )}

                {!loading && !error && (
                    <>
                        <section className="seller-dashboard-heading">
                            <div>
                                <span className="marketplace-eyebrow">
                                    SELLER CENTER
                                </span>

                                <h1>
                                    Welcome back
                                    {seller?.store_name
                                        ? `, ${seller.store_name}`
                                        : ""}
                                </h1>

                                <p>
                                    Manage your products,
                                    orders and store activity
                                    from one place.
                                </p>
                            </div>

                            <div className="seller-dashboard-actions">
                                <Link
                                    to="/products"
                                    className="marketplace-secondary-button"
                                >
                                    View Marketplace
                                </Link>

                                <Link
                                    to="/seller/products/new"
                                    className="marketplace-primary-button"
                                >
                                    Add Product
                                </Link>
                            </div>
                        </section>

                        <section className="seller-store-banner">
                            <div className="seller-store-identity">
                                <div className="seller-store-logo">
                                    {seller?.logo ? (
                                        <img
                                            src={seller.logo}
                                            alt={
                                                seller?.store_name ||
                                                "Store"
                                            }
                                        />
                                    ) : (
                                        <span>
                                            {(
                                                seller?.store_name ||
                                                "S"
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <div className="seller-store-name-row">
                                        <h2>
                                            {seller?.store_name ||
                                                "My Store"}
                                        </h2>

                                        {seller?.verified && (
                                            <span className="seller-verified-badge">
                                                Verified
                                            </span>
                                        )}
                                    </div>

                                    <p>
                                        {seller?.location ||
                                            "Location not provided"}
                                    </p>
                                </div>
                            </div>

                            <Link
                                to={`/stores/${
                                    seller?.store_slug ||
                                    seller?.slug ||
                                    seller?.id ||
                                    ""
                                }`}
                                className="marketplace-secondary-button"
                            >
                                View Store
                            </Link>
                        </section>

                        <section className="seller-dashboard-metrics">
                            <div className="seller-metric-card">
                                <span>
                                    Total Products
                                </span>

                                <strong>
                                    {products.length}
                                </strong>

                                <small>
                                    Products in your store
                                </small>
                            </div>

                            <div className="seller-metric-card">
                                <span>
                                    Active Products
                                </span>

                                <strong>
                                    {activeProducts.length}
                                </strong>

                                <small>
                                    Currently available
                                </small>
                            </div>

                            <div className="seller-metric-card">
                                <span>
                                    Orders
                                </span>

                                <strong>
                                    {orders.length}
                                </strong>

                                <small>
                                    Customer orders
                                </small>
                            </div>

                            <div className="seller-metric-card">
                                <span>
                                    Sales Value
                                </span>

                                <strong>
                                    {formatCurrency(
                                        totalSales
                                    )}
                                </strong>

                                <small>
                                    Based on available orders
                                </small>
                            </div>
                        </section>

                        <div className="seller-dashboard-grid">
                            <section className="seller-dashboard-panel">
                                <div className="seller-panel-heading">
                                    <div>
                                        <span className="marketplace-eyebrow">
                                            PRODUCTS
                                        </span>

                                        <h2>
                                            Recent Products
                                        </h2>
                                    </div>

                                    <Link to="/seller/products">
                                        View All
                                    </Link>
                                </div>

                                {recentProducts.length ===
                                0 ? (
                                    <div className="seller-empty-panel">
                                        <h3>
                                            No products yet
                                        </h3>

                                        <p>
                                            Add your first
                                            product to start
                                            building your store.
                                        </p>

                                        <Link
                                            to="/seller/products/new"
                                            className="marketplace-primary-button"
                                        >
                                            Add Product
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="seller-product-list">
                                        {recentProducts.map(
                                            (product) => (
                                                <div
                                                    className="seller-product-row"
                                                    key={
                                                        product.id
                                                    }
                                                >
                                                    <div className="seller-product-thumbnail">
                                                        {getProductImage(
                                                            product
                                                        ) ? (
                                                            <img
                                                                src={getProductImage(
                                                                    product
                                                                )}
                                                                alt={
                                                                    product.name
                                                                }
                                                            />
                                                        ) : (
                                                            <span>
                                                                No Image
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="seller-product-info">
                                                        <strong>
                                                            {product.name ||
                                                                "Product"}
                                                        </strong>

                                                        <span>
                                                            {formatCurrency(
                                                                getProductPrice(
                                                                    product
                                                                )
                                                            )}
                                                        </span>
                                                    </div>

                                                    <span
                                                        className={`order-status-badge ${getStatusClass(
                                                            product?.status
                                                        )}`}
                                                    >
                                                        {normalizeStatus(
                                                            product?.status
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="seller-dashboard-panel">
                                <div className="seller-panel-heading">
                                    <div>
                                        <span className="marketplace-eyebrow">
                                            ORDERS
                                        </span>

                                        <h2>
                                            Recent Orders
                                        </h2>
                                    </div>

                                    <Link to="/orders">
                                        View All
                                    </Link>
                                </div>

                                {recentOrders.length ===
                                0 ? (
                                    <div className="seller-empty-panel">
                                        <h3>
                                            No orders yet
                                        </h3>

                                        <p>
                                            Customer orders will
                                            appear here when they
                                            start purchasing from
                                            your store.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="seller-order-list">
                                        {recentOrders.map(
                                            (order) => (
                                                <div
                                                    className="seller-order-row"
                                                    key={
                                                        order.id ||
                                                        order.order_number
                                                    }
                                                >
                                                    <div>
                                                        <strong>
                                                            {order?.order_number ||
                                                                order?.number ||
                                                                `Order #${
                                                                    order?.id ||
                                                                    ""
                                                                }`}
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
                                                        className={`order-status-badge ${getStatusClass(
                                                            order?.status
                                                        )}`}
                                                    >
                                                        {normalizeStatus(
                                                            order?.status
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>

                        <section className="seller-dashboard-quick-actions">
                            <div>
                                <span className="marketplace-eyebrow">
                                    STORE MANAGEMENT
                                </span>

                                <h2>
                                    Manage your business
                                </h2>

                                <p>
                                    Use the marketplace tools to
                                    keep your store up to date.
                                </p>
                            </div>

                            <div className="seller-quick-action-grid">
                                <Link
                                    to="/seller/products"
                                    className="seller-quick-action"
                                >
                                    <strong>
                                        Products
                                    </strong>

                                    <span>
                                        Manage your catalog
                                    </span>
                                </Link>

                                <Link
                                    to="/seller/inventory"
                                    className="seller-quick-action"
                                >
                                    <strong>
                                        Inventory
                                    </strong>

                                    <span>
                                        Monitor available stock
                                    </span>
                                </Link>

                                <Link
                                    to="/orders"
                                    className="seller-quick-action"
                                >
                                    <strong>
                                        Orders
                                    </strong>

                                    <span>
                                        Track customer orders
                                    </span>
                                </Link>

                                <Link
                                    to="/stores"
                                    className="seller-quick-action"
                                >
                                    <strong>
                                        Storefront
                                    </strong>

                                    <span>
                                        View your public store
                                    </span>
                                </Link>
                            </div>
                        </section>

                        <section className="seller-dashboard-alert">
                            <div>
                                <strong>
                                    {pendingOrders.length}
                                </strong>

                                <span>
                                    orders may need your
                                    attention
                                </span>
                            </div>

                            <Link
                                to="/orders"
                                className="marketplace-secondary-button"
                            >
                                Review Orders
                            </Link>
                        </section>
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

                        <Link to="/orders">
                            Orders
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}