import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const MEDIA_BASE_URL = "http://127.0.0.1:8000";

/* =========================================================
   HELPERS (unchanged)
========================================================= */

function getImageUrl(image) {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${MEDIA_BASE_URL}${image}`;
}

function getProducts(data) {
    if (Array.isArray(data)) return data;
    return data?.results || data?.products || data?.items || [];
}

function getCategories(data) {
    if (Array.isArray(data)) return data;
    return data?.results || data?.categories || [];
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

const IconStar = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const IconWarning = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

const IconStore = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v11H3z" />
        <path d="M9 20v-6h6v6" />
    </svg>
);

/* =========================================================
   STATUS LABEL
========================================================= */

function statusLabel(status) {
    if (!status) return "Unknown";
    return String(status)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* =========================================================
   SELLER PRODUCTS
========================================================= */

export default function SellerProducts() {
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [category, setCategory] = useState("ALL");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const sellerResponse = await api.get("/sellers/me/");
            const sellerData = sellerResponse.data;

            setSeller(sellerData);

            const [productsResponse, categoriesResponse] = await Promise.all([
                api.get(`/products/?seller=${sellerData.id}&page_size=100`),
                api.get("/categories/?page_size=100"),
            ]);

            setProducts(getProducts(productsResponse.data));
            setCategories(getCategories(categoriesResponse.data));
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                setError("Please sign in to manage your products.");
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load your products."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    /* ---------- filtering (unchanged) ---------- */

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const text = `${product.name || ""} ${
                product.brand || ""
            } ${product.slug || ""}`.toLowerCase();

            const matchesSearch = text.includes(search.toLowerCase());

            const matchesStatus =
                status === "ALL" || product.status === status;

            const productCategory =
                product.category?.id || product.category;

            const matchesCategory =
                category === "ALL" ||
                String(productCategory) === String(category);

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [products, search, status, category]);

    /* ---------- metrics (unchanged) ---------- */

    const activeProducts = products.filter(
        (product) => product.status === "ACTIVE"
    ).length;

    const outOfStockProducts = products.filter(
        (product) => product.status === "OUT_OF_STOCK"
    ).length;

    const featuredProducts = products.filter(
        (product) => product.featured
    ).length;

    const hasActiveFilters =
        search.trim() !== "" || status !== "ALL" || category !== "ALL";

    function clearFilters() {
        setSearch("");
        setStatus("ALL");
        setCategory("ALL");
    }

    /* =========================================================
       HEADER
    ========================================================= */

    const storeSlug =
        seller?.store_slug || seller?.slug || seller?.id || "";

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <SellerHeader minimal />
                <main className="nf-sp-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading your products…</p>
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
            <SellerHeader active="products" />

            <main className="nf-sp-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/seller/dashboard">Seller Center</Link>
                    <span aria-hidden="true">/</span>
                    <span>Products</span>
                </nav>

                {/* ---- Heading ---- */}
                <header className="nf-sp-heading">
                    <div>
                        <span className="section-eyebrow">SELLER CENTER</span>
                        <h1>My Products</h1>
                        <p>
                            Manage the products you sell across your
                            marketplace store.
                        </p>
                    </div>

                    <Link to="/seller/products/new" className="nf-btn-primary">
                        <IconPlus /> Add Product
                    </Link>
                </header>

                {/* ---- Store strip ---- */}
                {seller && (
                    <section className="nf-sp-store" aria-label="Store">
                        <div className="nf-sp-store-info">
                            <span className="nf-sp-store-icon" aria-hidden="true">
                                <IconStore />
                            </span>
                            <div>
                                <strong>{seller.store_name}</strong>
                                <span>
                                    {seller.verified
                                        ? "Verified seller"
                                        : "Seller account"}
                                </span>
                            </div>
                        </div>

                        {storeSlug && (
                            <Link
                                to={`/stores/${storeSlug}`}
                                className="nf-sp-store-link"
                            >
                                View Store <IconArrow />
                            </Link>
                        )}
                    </section>
                )}

                {/* ---- Metrics ---- */}
                <section className="nf-sp-metrics" aria-label="Product statistics">
                    <div className="nf-sp-metric">
                        <span className="nf-sp-metric-icon"><IconBox /></span>
                        <span className="nf-sp-metric-label">Total products</span>
                        <strong>{products.length}</strong>
                    </div>
                    <div className="nf-sp-metric">
                        <span className="nf-sp-metric-icon is-success"><IconCheck /></span>
                        <span className="nf-sp-metric-label">Active</span>
                        <strong>{activeProducts}</strong>
                    </div>
                    <div className="nf-sp-metric">
                        <span className="nf-sp-metric-icon is-accent"><IconStar /></span>
                        <span className="nf-sp-metric-label">Featured</span>
                        <strong>{featuredProducts}</strong>
                    </div>
                    <div className="nf-sp-metric">
                        <span className="nf-sp-metric-icon is-danger"><IconWarning /></span>
                        <span className="nf-sp-metric-label">Out of stock</span>
                        <strong>{outOfStockProducts}</strong>
                    </div>
                </section>

                {/* ---- Toolbar ---- */}
                <section className="nf-sp-toolbar" aria-label="Filters">
                    <div className="nf-sp-search">
                        <span className="nf-sp-search-icon" aria-hidden="true">
                            <IconSearch />
                        </span>
                        <label htmlFor="seller-products-search" className="nf-visually-hidden">
                            Search your products
                        </label>
                        <input
                            id="seller-products-search"
                            type="search"
                            placeholder="Search your products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <label htmlFor="seller-products-status" className="nf-visually-hidden">
                        Filter by status
                    </label>
                    <select
                        id="seller-products-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ALL">All statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="OUT_OF_STOCK">Out of stock</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>

                    <label htmlFor="seller-products-category" className="nf-visually-hidden">
                        Filter by category
                    </label>
                    <select
                        id="seller-products-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="ALL">All categories</option>
                        {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="nf-sp-clear"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    )}
                </section>

                {error && (
                    <div className="marketplace-error nf-error" role="alert">
                        {error}
                    </div>
                )}

                {/* ================= EMPTY ================= */}
                {!error && filteredProducts.length === 0 && (
                    <section className="nf-sp-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconBox />
                        </div>
                        <h2>
                            {hasActiveFilters
                                ? "No matching products"
                                : "No products yet"}
                        </h2>
                        <p>
                            {hasActiveFilters
                                ? "Try changing your search or filters."
                                : "Add your first product to start selling."}
                        </p>
                        <div className="nf-empty-actions">
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
                                    to="/seller/products/new"
                                    className="nf-btn-primary"
                                >
                                    <IconPlus /> Add Your First Product
                                </Link>
                            )}
                        </div>
                    </section>
                )}

                {/* ================= TABLE ================= */}
                {!error && filteredProducts.length > 0 && (
                    <section className="nf-sp-table-section" aria-label="Your products">
                        <header className="nf-sp-table-head">
                            <h2>Products</h2>
                            <span className="nf-sp-count">
                                {filteredProducts.length}{" "}
                                {filteredProducts.length === 1
                                    ? "result"
                                    : "results"}
                            </span>
                        </header>

                        <div className="nf-sp-table-wrap">
                            <table className="nf-sp-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Product</th>
                                        <th scope="col">Category</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Rating</th>
                                        <th scope="col" className="nf-sp-th-actions">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredProducts.map((product) => {
                                        const image =
                                            product.primary_image ||
                                            product.image ||
                                            product.images?.[0]?.image;

                                        const price =
                                            product.current_price ||
                                            product.discount_price ||
                                            product.price;

                                        const rating = Number(product.rating || 0);

                                        return (
                                            <tr key={product.id}>
                                                <td>
                                                    <div className="nf-sp-cell-product">
                                                        <div className="nf-sp-thumb">
                                                            {image ? (
                                                                <img
                                                                    src={getImageUrl(image)}
                                                                    alt={product.name}
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <span>No Image</span>
                                                            )}
                                                        </div>
                                                        <div className="nf-sp-product-meta">
                                                            <strong>{product.name}</strong>
                                                            <small>
                                                                {product.brand || "No brand"}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="nf-sp-category">
                                                        {product.category_name ||
                                                            product.category?.name ||
                                                            "Uncategorized"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="nf-sp-price">
                                                        KSh {Number(price || 0).toLocaleString()}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`seller-status seller-status-${String(
                                                            product.status || ""
                                                        ).toLowerCase()}`}
                                                    >
                                                        {statusLabel(product.status || "UNKNOWN")}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="nf-sp-rating">
                                                        <span aria-hidden="true">★</span>
                                                        {rating > 0
                                                            ? rating.toFixed(1)
                                                            : "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="nf-sp-actions">
                                                        <Link
                                                            to={`/products/${product.id}`}
                                                            className="nf-sp-action nf-sp-action-view"
                                                        >
                                                            View
                                                        </Link>

                                                        <Link
                                                            to={`/seller/products/${product.id}/edit`}
                                                            className="nf-sp-action nf-sp-action-edit"
                                                        >
                                                            Edit
                                                        </Link>

                                                        <Link
                                                            to={`/seller/products/${product.id}/variants`}
                                                            className="nf-sp-action"
                                                        >
                                                            Variants
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
                                <label htmlFor="sp-header-search" className="nf-visually-hidden">
                                    Search products
                                </label>
                                <input
                                    id="sp-header-search"
                                    type="text"
                                    placeholder="Search products, brands and more..."
                                />
                                <button type="submit">Search</button>
                            </form>

                            <div className="marketplace-header-actions">
                                <Link to="/products" className="nf-header-link">
                                    <span aria-hidden="true">🛍</span>
                                    <span>Marketplace</span>
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
