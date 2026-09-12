import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const initialForm = {
    name: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    discount_price: "",
    status: "DRAFT",
    featured: false,
    new_arrival: false,
};

const getCategories = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.categories)) return data.categories;
    return [];
};

/* =========================================================
   INLINE ICONS
========================================================= */

const IconCheck = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const IconWarning = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

const IconBox = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
    </svg>
);

const IconTag = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <path d="M7 7h.01" />
    </svg>
);

const IconSettings = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1.1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
);

/* =========================================================
   SELLER EDIT PRODUCT
========================================================= */

export default function SellerEditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* ---------- auto-dismiss success ---------- */
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 4000);
        return () => clearTimeout(timer);
    }, [success]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError("");

            try {
                const [productResponse, categoriesResponse] =
                    await Promise.all([
                        api.get(`/products/${id}/`),
                        api.get("/categories/"),
                    ]);

                const product = productResponse.data;

                setCategories(getCategories(categoriesResponse.data));

                setForm({
                    name: product.name || "",
                    brand: product.brand || "",
                    category:
                        typeof product.category === "object"
                            ? product.category?.id || ""
                            : product.category || "",
                    description: product.description || "",
                    price: product.price ?? "",
                    discount_price: product.discount_price ?? "",
                    status: product.status || "DRAFT",
                    featured: Boolean(product.featured),
                    new_arrival: Boolean(product.new_arrival),
                });
            } catch (err) {
                console.error("Failed to load product:", err);

                if (err.response?.status === 401) {
                    setError(
                        "You need to sign in as a seller to edit products."
                    );
                } else if (err.response?.status === 403) {
                    setError(
                        "You do not have permission to edit this product."
                    );
                } else if (err.response?.status === 404) {
                    setError("The product could not be found.");
                } else {
                    setError(
                        err.response?.data?.detail ||
                        "Unable to load the product. Please try again."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validateForm = () => {
        if (!form.name.trim()) return "Product name is required.";
        if (!form.category) return "Please select a category.";
        if (!form.price || Number(form.price) <= 0) {
            return "Please enter a valid product price.";
        }
        if (
            form.discount_price &&
            Number(form.discount_price) >= Number(form.price)
        ) {
            return "Discount price must be lower than the original price.";
        }
        return "";
    };

    const formatBackendError = (data) => {
        if (!data) return "Unable to update the product.";
        if (typeof data === "string") return data;
        if (data.detail) return data.detail;

        const messages = Object.entries(data)
            .map(([field, value]) => {
                const message = Array.isArray(value)
                    ? value.join(" ")
                    : String(value);
                return `${field}: ${message}`;
            })
            .join(" ");

        return messages || "Unable to update the product.";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name: form.name.trim(),
                brand: form.brand.trim(),
                category: Number(form.category),
                description: form.description.trim(),
                price: form.price,
                discount_price: form.discount_price
                    ? form.discount_price
                    : null,
                status: form.status,
                featured: form.featured,
                new_arrival: form.new_arrival,
            };

            await api.patch(`/products/${id}/`, payload);

            setSuccess("Product updated successfully.");

            setTimeout(() => {
                navigate(`/seller/products/${id}/variants`);
            }, 700);
        } catch (err) {
            console.error("Failed to update product:", err);

            if (err.response?.status === 401) {
                setError("Your session has expired. Please sign in again.");
            } else if (err.response?.status === 403) {
                setError(
                    err.response?.data?.detail ||
                    "You do not have permission to edit this product."
                );
            } else {
                setError(formatBackendError(err.response?.data));
            }
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <SellerHeader minimal />
                <main className="nf-sep-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading product…</p>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       HARD ERROR (couldn't load product)
    ========================================================= */

    if (error && !form.name) {
        return (
            <div className="marketplace">
                <SellerHeader minimal />

                <main className="nf-sep-main">
                    <div className="nf-sep-empty" role="alert">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconWarning />
                        </div>
                        <h2>Unable to load product</h2>
                        <p>{error}</p>
                        <div className="nf-empty-actions">
                            <Link
                                to="/seller/products"
                                className="nf-btn-primary"
                            >
                                Back to Products
                            </Link>
                            <Link to="/seller/dashboard" className="nf-btn-ghost">
                                Seller Center
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
            <SellerHeader active="products" />

            <main className="nf-sep-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/seller/dashboard">Seller Center</Link>
                    <span aria-hidden="true">/</span>
                    <Link to="/seller/products">My Products</Link>
                    <span aria-hidden="true">/</span>
                    <span>Edit Product</span>
                </nav>

                {/* ---- Heading ---- */}
                <header className="nf-sep-heading">
                    <div>
                        <span className="section-eyebrow">EDIT PRODUCT</span>
                        <h1>{form.name || "Edit Product"}</h1>
                        <p>
                            Update your product information, pricing and
                            marketplace settings.
                        </p>
                    </div>

                    <Link to="/seller/products" className="nf-btn-ghost">
                        Back to Products
                    </Link>
                </header>

                {/* ---- Banners ---- */}
                {error && (
                    <div className="nf-sep-banner nf-sep-banner-error" role="alert">
                        <IconWarning />
                        <div>
                            <strong>Update failed</strong>
                            <span>{error}</span>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="nf-sep-banner nf-sep-banner-success" role="status">
                        <IconCheck />
                        <div>
                            <strong>Product updated</strong>
                            <span>{success}</span>
                        </div>
                    </div>
                )}

                <form className="nf-sep-form" onSubmit={handleSubmit}>

                    {/* ================= BASIC ================= */}
                    <section className="nf-sep-card" aria-labelledby="nf-sep-basic-title">
                        <header className="nf-sep-card-head">
                            <span className="nf-sep-card-icon" aria-hidden="true">
                                <IconBox />
                            </span>
                            <div>
                                <span className="section-eyebrow">BASICS</span>
                                <h2 id="nf-sep-basic-title">Basic information</h2>
                                <p>Update the main information customers see.</p>
                            </div>
                        </header>

                        <div className="nf-sep-grid">
                            <label className="nf-sep-field nf-sep-field-full">
                                Product name <span className="nf-sep-req">*</span>
                                <input
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Men's Premium Cotton T-Shirt"
                                    required
                                    autoComplete="off"
                                />
                                <small>Use a clear and descriptive product name.</small>
                            </label>

                            <label className="nf-sep-field">
                                Brand
                                <input
                                    name="brand"
                                    type="text"
                                    value={form.brand}
                                    onChange={handleChange}
                                    placeholder="e.g. Nila Threads"
                                    autoComplete="organization"
                                />
                            </label>

                            <label className="nf-sep-field">
                                Category <span className="nf-sep-req">*</span>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="nf-sep-field nf-sep-field-full">
                                Product description
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe the product, material, fit, style and other useful information…"
                                    rows="7"
                                />
                                <small>Keep the description useful and accurate.</small>
                            </label>
                        </div>
                    </section>

                    {/* ================= PRICING ================= */}
                    <section className="nf-sep-card" aria-labelledby="nf-sep-pricing-title">
                        <header className="nf-sep-card-head">
                            <span className="nf-sep-card-icon" aria-hidden="true">
                                <IconTag />
                            </span>
                            <div>
                                <span className="section-eyebrow">PRICING</span>
                                <h2 id="nf-sep-pricing-title">Pricing</h2>
                                <p>Update the normal and discounted selling price.</p>
                            </div>
                        </header>

                        <div className="nf-sep-grid">
                            <label className="nf-sep-field">
                                Original price (KES) <span className="nf-sep-req">*</span>
                                <input
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="2500"
                                    required
                                />
                            </label>

                            <label className="nf-sep-field">
                                Discount price (KES)
                                <input
                                    name="discount_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.discount_price}
                                    onChange={handleChange}
                                    placeholder="1999"
                                />
                                <small>Leave empty if there is no discount.</small>
                            </label>
                        </div>
                    </section>

                    {/* ================= LISTING ================= */}
                    <section className="nf-sep-card" aria-labelledby="nf-sep-listing-title">
                        <header className="nf-sep-card-head">
                            <span className="nf-sep-card-icon" aria-hidden="true">
                                <IconSettings />
                            </span>
                            <div>
                                <span className="section-eyebrow">LISTING</span>
                                <h2 id="nf-sep-listing-title">Listing settings</h2>
                                <p>Control the product's marketplace visibility.</p>
                            </div>
                        </header>

                        <div className="nf-sep-grid">
                            <label className="nf-sep-field">
                                Product status
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                                <small>
                                    Use Draft while preparing the listing and
                                    Active when it is ready for customers.
                                </small>
                            </label>

                            <div className="nf-sep-options">
                                <label className="nf-sep-checkbox">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={form.featured}
                                        onChange={handleChange}
                                    />
                                    <span>
                                        <strong>Featured product</strong>
                                        <small>
                                            Highlight this product in featured
                                            sections.
                                        </small>
                                    </span>
                                </label>

                                <label className="nf-sep-checkbox">
                                    <input
                                        type="checkbox"
                                        name="new_arrival"
                                        checked={form.new_arrival}
                                        onChange={handleChange}
                                    />
                                    <span>
                                        <strong>New arrival</strong>
                                        <small>Mark this product as a new arrival.</small>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* ================= NEXT STEP ================= */}
                    <section className="nf-sep-next" aria-label="Next step">
                        <div className="nf-sep-next-icon" aria-hidden="true">
                            <IconBox />
                        </div>
                        <div>
                            <strong>Manage product variants</strong>
                            <p>
                                After saving, you can manage sizes, colors,
                                SKUs and variant stock.
                            </p>
                        </div>
                        <Link
                            to={`/seller/products/${id}/variants`}
                            className="nf-sep-next-link"
                        >
                            Variants <IconArrow />
                        </Link>
                    </section>

                    {/* ================= ACTIONS ================= */}
                    <div className="nf-sep-actions">
                        <div className="nf-sep-actions-left">
                            <Link to="/seller/products" className="nf-btn-ghost">
                                Cancel
                            </Link>
                            <Link
                                to={`/products/${id}`}
                                className="nf-btn-ghost"
                            >
                                View Product <IconArrow />
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="nf-btn-primary"
                            disabled={saving}
                        >
                            {saving ? "Saving Changes…" : "Save Changes"}
                        </button>
                    </div>
                </form>
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
                                <label htmlFor="sep-search" className="nf-visually-hidden">
                                    Search products
                                </label>
                                <input
                                    id="sep-search"
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
