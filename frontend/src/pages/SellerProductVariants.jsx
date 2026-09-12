import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   CONSTANTS + HELPERS (unchanged)
========================================================= */

const emptyVariant = {
    sku: "",
    size: "",
    color: "",
    price: "",
    stock_quantity: "",
    is_active: true,
};

const getVariants = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.variants)) return data.variants;
    if (Array.isArray(data?.items)) return data.items;
    return [];
};

const getImageUrl = (image) => {
    if (!image) return null;

    if (typeof image === "object") {
        image = image.image || image.url || image.src;
    }
    if (!image) return null;

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    return `http://127.0.0.1:8000${image.startsWith("/") ? "" : "/"}${image}`;
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

/* =========================================================
   INLINE ICONS
========================================================= */

const IconPlus = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const IconSearch = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const IconClose = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
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

const IconWarning = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

const IconEdit = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
);

const IconTrash = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
);

/* =========================================================
   SELLER PRODUCT VARIANTS
========================================================= */

export default function SellerProductVariants() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);

    const [form, setForm] = useState(emptyVariant);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    /* ---------- auto-dismiss success ---------- */
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 4000);
        return () => clearTimeout(timer);
    }, [success]);

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [productResponse, variantsResponse] = await Promise.all([
                api.get(`/products/${id}/`),
                api.get(`/products/${id}/variants/`),
            ]);

            setProduct(productResponse.data);
            setVariants(getVariants(variantsResponse.data));
        } catch (err) {
            console.error("Failed to load product variants:", err);

            if (err.response?.status === 401) {
                setError("You need to sign in as a seller to manage variants.");
            } else if (err.response?.status === 403) {
                setError(
                    "You do not have permission to manage variants for this product."
                );
            } else if (err.response?.status === 404) {
                setError("The product or its variants could not be found.");
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load product variants."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const openAddForm = () => {
        setEditingVariant(null);
        setForm(emptyVariant);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (variant) => {
        setEditingVariant(variant);

        setForm({
            sku: variant.sku || "",
            size: variant.size || "",
            color: variant.color || "",
            price:
                variant.price === null || variant.price === undefined
                    ? ""
                    : variant.price,
            stock_quantity:
                variant.stock_quantity ?? variant.inventory?.quantity ?? "",
            is_active: variant.is_active !== false,
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingVariant(null);
        setForm(emptyVariant);
    };

    const validateForm = () => {
        if (!form.sku.trim()) return "SKU is required.";
        if (!form.size.trim()) return "Size is required.";
        if (!form.color.trim()) return "Color is required.";

        if (form.price !== "" && Number(form.price) < 0) {
            return "Variant price cannot be negative.";
        }
        if (form.stock_quantity === "" || Number(form.stock_quantity) < 0) {
            return "Stock quantity must be zero or greater.";
        }

        return "";
    };

    const formatBackendError = (data) => {
        if (!data) return "Unable to save the variant.";
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

        return messages || "Unable to save the variant.";
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
                sku: form.sku.trim(),
                size: form.size.trim(),
                color: form.color.trim(),
                price: form.price === "" ? null : form.price,
                stock_quantity: Number(form.stock_quantity),
                is_active: form.is_active,
            };

            if (editingVariant) {
                await api.patch(
                    `/products/${id}/variants/${editingVariant.id}/`,
                    payload
                );
                setSuccess("Variant updated successfully.");
            } else {
                await api.post(`/products/${id}/variants/`, payload);
                setSuccess("Variant created successfully.");
            }

            await loadData();

            setShowForm(false);
            setEditingVariant(null);
            setForm(emptyVariant);
        } catch (err) {
            console.error("Failed to save variant:", err);

            if (err.response?.status === 401) {
                setError("Your session has expired. Please sign in again.");
            } else if (err.response?.status === 403) {
                setError(
                    err.response?.data?.detail ||
                    "You do not have permission to modify this variant."
                );
            } else {
                setError(formatBackendError(err.response?.data));
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (variant) => {
        const confirmed = window.confirm(
            `Delete variant "${variant.sku}"? This action cannot be undone.`
        );
        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await api.delete(`/products/${id}/variants/${variant.id}/`);

            setVariants((current) =>
                current.filter((item) => item.id !== variant.id)
            );

            setSuccess("Variant deleted successfully.");
        } catch (err) {
            console.error("Failed to delete variant:", err);
            setError(
                err.response?.data?.detail || "Unable to delete this variant."
            );
        }
    };

    /* ---------- filtering (unchanged) ---------- */

    const filteredVariants = useMemo(() => {
        let result = [...variants];
        const searchValue = search.trim().toLowerCase();

        if (searchValue) {
            result = result.filter((variant) => {
                const sku = variant.sku || "";
                const size = variant.size || "";
                const color = variant.color || "";

                return (
                    sku.toLowerCase().includes(searchValue) ||
                    size.toLowerCase().includes(searchValue) ||
                    color.toLowerCase().includes(searchValue)
                );
            });
        }

        if (statusFilter === "ACTIVE") {
            result = result.filter((variant) => variant.is_active !== false);
        }
        if (statusFilter === "INACTIVE") {
            result = result.filter((variant) => variant.is_active === false);
        }
        if (statusFilter === "OUT_OF_STOCK") {
            result = result.filter((variant) => {
                const stock =
                    variant.stock_quantity ?? variant.inventory?.quantity ?? 0;
                return Number(stock) <= 0;
            });
        }

        return result;
    }, [variants, search, statusFilter]);

    /* ---------- metrics (unchanged) ---------- */

    const activeVariants = variants.filter(
        (variant) => variant.is_active !== false
    ).length;

    const inactiveVariants = variants.filter(
        (variant) => variant.is_active === false
    ).length;

    const totalStock = variants.reduce(
        (total, variant) =>
            total +
            Number(variant.stock_quantity ?? variant.inventory?.quantity ?? 0),
        0
    );

    const outOfStock = variants.filter(
        (variant) =>
            Number(
                variant.stock_quantity ?? variant.inventory?.quantity ?? 0
            ) <= 0
    ).length;

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <SellerHeader minimal />
                <main className="nf-sv-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading product variants…</p>
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
            <SellerHeader />

            <main className="nf-sv-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/seller/dashboard">Seller Center</Link>
                    <span aria-hidden="true">/</span>
                    <Link to="/seller/products">My Products</Link>
                    <span aria-hidden="true">/</span>
                    <span>Variants</span>
                </nav>

                {/* ---- Product header ---- */}
                {product && (
                    <section className="nf-sv-product" aria-label="Product">
                        <div className="nf-sv-product-info">
                            <div className="nf-sv-product-img">
                                {product.image ? (
                                    <img
                                        src={getImageUrl(product.image)}
                                        alt={product.name}
                                    />
                                ) : (
                                    <span>Product</span>
                                )}
                            </div>

                            <div className="nf-sv-product-text">
                                <span className="section-eyebrow">
                                    PRODUCT VARIANTS
                                </span>
                                <h1>{product.name}</h1>
                                <p>{product.brand || "No brand specified"}</p>
                            </div>
                        </div>

                        <div className="nf-sv-product-actions">
                            <Link
                                to={`/seller/products/${id}/edit`}
                                className="nf-btn-ghost"
                            >
                                Edit Product
                            </Link>
                            <Link
                                to={`/products/${id}`}
                                className="nf-btn-ghost"
                            >
                                View Product <IconArrow />
                            </Link>
                            <button
                                type="button"
                                className="nf-btn-primary"
                                onClick={openAddForm}
                            >
                                <IconPlus /> Add Variant
                            </button>
                        </div>
                    </section>
                )}

                {/* ---- Banners ---- */}
                {error && (
                    <div className="nf-sv-banner nf-sv-banner-error" role="alert">
                        <IconWarning />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="nf-sv-banner nf-sv-banner-success" role="status">
                        <IconCheck />
                        <span>{success}</span>
                    </div>
                )}

                {/* ---- Add / Edit form ---- */}
                {showForm && (
                    <section className="nf-sv-form-card" aria-labelledby="nf-sv-form-title">
                        <header className="nf-sv-form-head">
                            <div>
                                <span className="section-eyebrow">
                                    {editingVariant ? "EDIT" : "NEW VARIANT"}
                                </span>
                                <h2 id="nf-sv-form-title">
                                    {editingVariant
                                        ? "Edit Variant"
                                        : "Add Product Variant"}
                                </h2>
                                <p>
                                    Add the size, color, SKU, price and
                                    available stock for this variant.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="nf-sv-close"
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Close form"
                            >
                                <IconClose />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="nf-sv-form">
                            <div className="nf-sv-grid">
                                <label className="nf-sv-field">
                                    SKU <span className="nf-sv-required">*</span>
                                    <input
                                        name="sku"
                                        type="text"
                                        value={form.sku}
                                        onChange={handleChange}
                                        placeholder="e.g. TSH-BLK-M-001"
                                        required
                                    />
                                    <small>Use a unique identifier for this variant.</small>
                                </label>

                                <label className="nf-sv-field">
                                    Size <span className="nf-sv-required">*</span>
                                    <input
                                        name="size"
                                        type="text"
                                        value={form.size}
                                        onChange={handleChange}
                                        placeholder="e.g. M"
                                        required
                                    />
                                </label>

                                <label className="nf-sv-field">
                                    Color <span className="nf-sv-required">*</span>
                                    <input
                                        name="color"
                                        type="text"
                                        value={form.color}
                                        onChange={handleChange}
                                        placeholder="e.g. Black"
                                        required
                                    />
                                </label>

                                <label className="nf-sv-field">
                                    Variant price (KES)
                                    <input
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={handleChange}
                                        placeholder={
                                            product?.price
                                                ? `Default: ${product.price}`
                                                : "Use product price"
                                        }
                                    />
                                    <small>Leave empty to use the main product price.</small>
                                </label>

                                <label className="nf-sv-field">
                                    Stock quantity <span className="nf-sv-required">*</span>
                                    <input
                                        name="stock_quantity"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={form.stock_quantity}
                                        onChange={handleChange}
                                        placeholder="0"
                                        required
                                    />
                                </label>

                                <label className="nf-sv-checkbox nf-sv-field-full">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleChange}
                                    />
                                    <span>
                                        <strong>Active variant</strong>
                                        <small>
                                            Allow customers to select and
                                            purchase this variant.
                                        </small>
                                    </span>
                                </label>
                            </div>

                            <div className="nf-sv-form-actions">
                                <button
                                    type="button"
                                    className="nf-btn-ghost"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="nf-btn-primary"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving…"
                                        : editingVariant
                                        ? "Save Changes"
                                        : "Create Variant"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {/* ---- Metrics ---- */}
                <section className="nf-sv-metrics" aria-label="Variant statistics">
                    <div className="nf-sv-metric">
                        <span className="nf-sv-metric-icon"><IconBox /></span>
                        <span className="nf-sv-metric-label">Total variants</span>
                        <strong>{variants.length}</strong>
                    </div>
                    <div className="nf-sv-metric">
                        <span className="nf-sv-metric-icon is-success"><IconCheck /></span>
                        <span className="nf-sv-metric-label">Active</span>
                        <strong>{activeVariants}</strong>
                    </div>
                    <div className="nf-sv-metric">
                        <span className="nf-sv-metric-label-plain">Inactive</span>
                        <strong>{inactiveVariants}</strong>
                    </div>
                    <div className="nf-sv-metric">
                        <span className="nf-sv-metric-label-plain">Total stock</span>
                        <strong>{totalStock}</strong>
                    </div>
                    <div className="nf-sv-metric">
                        <span className="nf-sv-metric-icon is-danger"><IconWarning /></span>
                        <span className="nf-sv-metric-label">Out of stock</span>
                        <strong>{outOfStock}</strong>
                    </div>
                </section>

                {/* ---- Toolbar ---- */}
                <section className="nf-sv-toolbar" aria-label="Filters">
                    <div className="nf-sv-search">
                        <span className="nf-sv-search-icon" aria-hidden="true">
                            <IconSearch />
                        </span>
                        <label htmlFor="variant-search" className="nf-visually-hidden">
                            Search variants
                        </label>
                        <input
                            id="variant-search"
                            type="search"
                            placeholder="Search SKU, size or color..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <label htmlFor="variant-status" className="nf-visually-hidden">
                        Filter by status
                    </label>
                    <select
                        id="variant-status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All variants</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="OUT_OF_STOCK">Out of stock</option>
                    </select>

                    <button
                        type="button"
                        className="nf-btn-primary"
                        onClick={openAddForm}
                    >
                        <IconPlus /> Add Variant
                    </button>
                </section>

                {/* ================= EMPTY STATES ================= */}
                {variants.length === 0 ? (
                    <section className="nf-sv-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconPlus />
                        </div>
                        <h2>No variants yet</h2>
                        <p>
                            Add sizes, colors, SKUs and stock so customers can
                            choose the exact version of this product they want.
                        </p>
                        <button
                            type="button"
                            className="nf-btn-primary"
                            onClick={openAddForm}
                        >
                            Add First Variant
                        </button>
                    </section>
                ) : filteredVariants.length === 0 ? (
                    <section className="nf-sv-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconSearch />
                        </div>
                        <h2>No variants found</h2>
                        <p>Try changing your search or status filter.</p>
                    </section>
                ) : (
                    /* ================= TABLE ================= */
                    <section className="nf-sv-table-section" aria-label="Product variants">
                        <header className="nf-sv-table-head">
                            <h2>Product Variants</h2>
                            <span className="nf-sv-count">
                                Showing {filteredVariants.length} of{" "}
                                {variants.length} variant
                                {variants.length === 1 ? "" : "s"}
                            </span>
                        </header>

                        <div className="nf-sv-table-wrap">
                            <table className="nf-sv-table">
                                <thead>
                                    <tr>
                                        <th scope="col">SKU</th>
                                        <th scope="col">Size</th>
                                        <th scope="col">Color</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Stock</th>
                                        <th scope="col">Status</th>
                                        <th scope="col" className="nf-sv-th-actions">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredVariants.map((variant) => {
                                        const stock =
                                            variant.stock_quantity ??
                                            variant.inventory?.quantity ??
                                            0;

                                        const price =
                                            variant.price ?? product?.price ?? 0;

                                        const stockClass =
                                            Number(stock) <= 0
                                                ? "nf-sv-stock is-out"
                                                : Number(stock) <= 5
                                                ? "nf-sv-stock is-low"
                                                : "nf-sv-stock is-ok";

                                        return (
                                            <tr key={variant.id}>
                                                <td>
                                                    <strong className="nf-sv-sku">
                                                        {variant.sku}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="nf-sv-chip">
                                                        {variant.size || "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="nf-sv-color">
                                                        <span className="nf-sv-color-dot" aria-hidden="true" />
                                                        {variant.color || "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="nf-sv-price">
                                                        {formatCurrency(price)}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className={stockClass}>
                                                        {stock}
                                                    </span>
                                                </td>

                                                <td>
                                                    {variant.is_active !== false ? (
                                                        <span className="nf-sv-status is-active">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="nf-sv-status is-inactive">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="nf-sv-actions">
                                                        <button
                                                            type="button"
                                                            className="nf-sv-action nf-sv-action-edit"
                                                            onClick={() => openEditForm(variant)}
                                                        >
                                                            <IconEdit /> Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="nf-sv-action nf-sv-action-delete"
                                                            onClick={() => handleDelete(variant)}
                                                        >
                                                            <IconTrash /> Delete
                                                        </button>
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

function SellerHeader({ minimal = false }) {
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
                                <label htmlFor="sv-search" className="nf-visually-hidden">
                                    Search products
                                </label>
                                <input
                                    id="sv-search"
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
                        <Link to="/seller/products" className="active">
                            Products
                        </Link>
                        <Link to="/seller/inventory">Inventory</Link>
                        <Link to="/seller/orders">Orders</Link>
                        <Link to="/seller/store">My Store</Link>
                    </div>
                </nav>
            )}
        </>
    );
}
