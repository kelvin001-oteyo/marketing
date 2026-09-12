import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   HELPERS (unchanged)
========================================================= */

function getCategories(data) {
    if (Array.isArray(data)) return data;
    return data?.results || data?.categories || [];
}

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

const IconSpark = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
    </svg>
);

/* =========================================================
   SELLER ADD PRODUCT
========================================================= */

export default function SellerAddProduct() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        name: "",
        brand: "",
        category: "",
        description: "",
        price: "",
        discount_price: "",
        status: "ACTIVE",
        featured: false,
        new_arrival: true,
    });

    /* ---------- auto-dismiss success ---------- */
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 4000);
        return () => clearTimeout(timer);
    }, [success]);

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            const response = await api.get("/categories/?page_size=100");
            setCategories(getCategories(response.data));
        } catch (err) {
            console.error(err);
            setError("Unable to load categories.");
        } finally {
            setLoadingCategories(false);
        }
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!form.name.trim()) {
            setError("Product name is required.");
            return;
        }
        if (!form.category) {
            setError("Please select a category.");
            return;
        }
        if (!form.price || Number(form.price) <= 0) {
            setError("Enter a valid product price.");
            return;
        }
        if (
            form.discount_price &&
            Number(form.discount_price) >= Number(form.price)
        ) {
            setError("Discount price must be lower than the original price.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: form.name.trim(),
                brand: form.brand.trim(),
                category: Number(form.category),
                description: form.description.trim(),
                price: form.price,
                discount_price: form.discount_price || null,
                status: form.status,
                featured: form.featured,
                new_arrival: form.new_arrival,
            };

            const response = await api.post("/products/", payload);

            setSuccess("Product created successfully.");

            const productId = response.data?.id;

            setTimeout(() => {
                if (productId) {
                    navigate(`/seller/products/${productId}/variants`);
                } else {
                    navigate("/seller/products");
                }
            }, 700);
        } catch (err) {
            console.error(err);

            const data = err.response?.data;

            setError(
                data?.detail ||
                data?.name?.[0] ||
                data?.category?.[0] ||
                "Unable to create product."
            );
        } finally {
            setSaving(false);
        }
    }

    /* =========================================================
       MAIN
    ========================================================= */

    return (
        <div className="marketplace">
            <SellerHeader active="products" />

            <main className="nf-sap-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/seller/dashboard">Seller Center</Link>
                    <span aria-hidden="true">/</span>
                    <Link to="/seller/products">My Products</Link>
                    <span aria-hidden="true">/</span>
                    <span>Add Product</span>
                </nav>

                {/* ---- Heading ---- */}
                <header className="nf-sap-heading">
                    <div>
                        <span className="section-eyebrow">SELLER CENTER</span>
                        <h1>Add Product</h1>
                        <p>Create a new product for your marketplace store.</p>
                    </div>

                    <Link to="/seller/products" className="nf-btn-ghost">
                        Cancel
                    </Link>
                </header>

                {/* ---- Banners ---- */}
                {error && (
                    <div className="nf-sap-banner nf-sap-banner-error" role="alert">
                        <IconWarning />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="nf-sap-banner nf-sap-banner-success" role="status">
                        <IconCheck />
                        <span>{success}</span>
                    </div>
                )}

                <form className="nf-sap-form" onSubmit={handleSubmit}>

                    {/* ================= BASIC ================= */}
                    <section className="nf-sap-card" aria-labelledby="nf-sap-basic-title">
                        <header className="nf-sap-card-head">
                            <span className="nf-sap-card-icon" aria-hidden="true">
                                <IconBox />
                            </span>
                            <div>
                                <span className="section-eyebrow">BASICS</span>
                                <h2 id="nf-sap-basic-title">Basic information</h2>
                                <p>Tell customers what you are selling.</p>
                            </div>
                        </header>

                        <div className="nf-sap-grid">
                            <label className="nf-sap-field nf-sap-field-full">
                                Product name <span className="nf-sap-req">*</span>
                                <input
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Men's Cotton T-Shirt"
                                    autoComplete="off"
                                    required
                                />
                                <small>Use a clear and descriptive product name.</small>
                            </label>

                            <label className="nf-sap-field">
                                Brand
                                <input
                                    name="brand"
                                    type="text"
                                    value={form.brand}
                                    onChange={handleChange}
                                    placeholder="Brand name"
                                    autoComplete="organization"
                                />
                            </label>

                            <label className="nf-sap-field">
                                Category <span className="nf-sap-req">*</span>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    disabled={loadingCategories}
                                    required
                                >
                                    <option value="">
                                        {loadingCategories
                                            ? "Loading categories…"
                                            : "Select category"}
                                    </option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="nf-sap-field nf-sap-field-full">
                                Description
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="6"
                                    placeholder="Describe the product, materials, fit, quality and other important details…"
                                />
                                <small>Keep the description useful and accurate.</small>
                            </label>
                        </div>
                    </section>

                    {/* ================= PRICING ================= */}
                    <section className="nf-sap-card" aria-labelledby="nf-sap-pricing-title">
                        <header className="nf-sap-card-head">
                            <span className="nf-sap-card-icon" aria-hidden="true">
                                <IconTag />
                            </span>
                            <div>
                                <span className="section-eyebrow">PRICING</span>
                                <h2 id="nf-sap-pricing-title">Pricing</h2>
                                <p>Set the selling price and optional discount.</p>
                            </div>
                        </header>

                        <div className="nf-sap-grid">
                            <label className="nf-sap-field">
                                Original price (KES) <span className="nf-sap-req">*</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="2500"
                                    required
                                />
                            </label>

                            <label className="nf-sap-field">
                                Discount price (KES)
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="discount_price"
                                    value={form.discount_price}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                                <small>Leave empty if there is no discount.</small>
                            </label>
                        </div>
                    </section>

                    {/* ================= LISTING ================= */}
                    <section className="nf-sap-card" aria-labelledby="nf-sap-listing-title">
                        <header className="nf-sap-card-head">
                            <span className="nf-sap-card-icon" aria-hidden="true">
                                <IconSpark />
                            </span>
                            <div>
                                <span className="section-eyebrow">LISTING</span>
                                <h2 id="nf-sap-listing-title">Marketplace settings</h2>
                                <p>Control the product's visibility across the marketplace.</p>
                            </div>
                        </header>

                        <div className="nf-sap-grid">
                            <label className="nf-sap-field">
                                Product status
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="DRAFT">Draft</option>
                                </select>
                                <small>
                                    Use Draft while preparing the listing and
                                    Active when it is ready for customers.
                                </small>
                            </label>

                            <div className="nf-sap-options">
                                <label className="nf-sap-checkbox">
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

                                <label className="nf-sap-checkbox">
                                    <input
                                        type="checkbox"
                                        name="new_arrival"
                                        checked={form.new_arrival}
                                        onChange={handleChange}
                                    />
                                    <span>
                                        <strong>New arrival</strong>
                                        <small>Show this product as a new arrival.</small>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* ================= NEXT STEP ================= */}
                    <section className="nf-sap-next" aria-label="Next step">
                        <div className="nf-sap-next-icon" aria-hidden="true">
                            <IconBox />
                        </div>
                        <div>
                            <strong>Add product variants next</strong>
                            <p>
                                After creating the product, you can add sizes,
                                colors, SKUs and stock for each variant.
                            </p>
                        </div>
                    </section>

                    {/* ================= ACTIONS ================= */}
                    <div className="nf-sap-actions">
                        <Link to="/seller/products" className="nf-btn-ghost">
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="nf-btn-primary"
                            disabled={saving}
                        >
                            {saving ? "Creating…" : "Create Product"}
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
                                <label htmlFor="sap-search" className="nf-visually-hidden">
                                    Search products
                                </label>
                                <input
                                    id="sap-search"
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
