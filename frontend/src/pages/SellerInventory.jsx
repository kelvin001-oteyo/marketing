import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   HELPERS (unchanged)
========================================================= */

function getItems(data) {
    if (Array.isArray(data)) return data;
    return (
        data?.results ||
        data?.inventory ||
        data?.items ||
        data?.records ||
        []
    );
}

function getVariant(record) {
    return record?.variant || record?.product_variant || {};
}

function getProduct(record) {
    const variant = getVariant(record);
    return record?.product || variant?.product || {};
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

const IconClose = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

const IconEdit = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
);

const IconCoins = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="6" rx="9" ry="3" />
        <path d="M3 6v6c0 1.66 4.03 3 9 3s9-1.34 9-3V6" />
        <path d="M3 12v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
    </svg>
);

/* =========================================================
   SELLER INVENTORY
========================================================= */

export default function SellerInventory() {
    const [records, setRecords] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    const [editing, setEditing] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [threshold, setThreshold] = useState("");
    const [saving, setSaving] = useState(false);

    /* ---------- body-scroll lock + ESC close ---------- */
    useEffect(() => {
        if (!editing) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKey = (e) => {
            if (e.key === "Escape" && !saving) closeEditor();
        };
        document.addEventListener("keydown", onKey);

        return () => {
            document.body.style.overflow = previous;
            document.removeEventListener("keydown", onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing, saving]);

    useEffect(() => {
        loadInventory();
    }, []);

    async function loadInventory() {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/inventory/");
            setRecords(getItems(response.data));
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                setError("Please sign in to manage inventory.");
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load inventory."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    /* ---------- derived stats (unchanged) ---------- */

    const stats = useMemo(() => {
        let total = 0;
        let low = 0;
        let out = 0;

        records.forEach((record) => {
            const available =
                record.available_quantity ??
                Math.max(
                    Number(record.quantity || 0) -
                        Number(record.reserved_quantity || 0),
                    0
                );

            const thresholdValue = Number(record.low_stock_threshold ?? 5);

            total += available;

            if (available <= 0) {
                out++;
            } else if (available <= thresholdValue) {
                low++;
            }
        });

        return { total, low, out };
    }, [records]);

    /* ---------- filtering (unchanged) ---------- */

    const filteredRecords = records.filter((record) => {
        const variant = getVariant(record);
        const product = getProduct(record);

        const text = `
            ${product.name || ""}
            ${product.brand || ""}
            ${variant.sku || ""}
            ${variant.size || ""}
            ${variant.color || ""}
        `.toLowerCase();

        const matchesSearch = text.includes(search.toLowerCase());

        const available =
            record.available_quantity ??
            Math.max(
                Number(record.quantity || 0) -
                    Number(record.reserved_quantity || 0),
                0
            );

        const thresholdValue = Number(record.low_stock_threshold ?? 5);

        let matchesFilter = true;

        if (filter === "LOW") {
            matchesFilter = available > 0 && available <= thresholdValue;
        }
        if (filter === "OUT") {
            matchesFilter = available <= 0;
        }
        if (filter === "HEALTHY") {
            matchesFilter = available > thresholdValue;
        }

        return matchesSearch && matchesFilter;
    });

    const hasActiveFilters = search.trim() !== "" || filter !== "ALL";

    function clearFilters() {
        setSearch("");
        setFilter("ALL");
    }

    /* ---------- editor (unchanged) ---------- */

    function openEditor(record) {
        setEditing(record);
        setQuantity(String(record.quantity ?? 0));
        setThreshold(String(record.low_stock_threshold ?? 5));
        setError("");
    }

    function closeEditor() {
        setEditing(null);
        setQuantity("");
        setThreshold("");
    }

    async function saveInventory(e) {
        e.preventDefault();
        if (!editing) return;

        const newQuantity = Number(quantity);

        if (Number.isNaN(newQuantity) || newQuantity < 0) {
            setError("Enter a valid stock quantity.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                quantity: newQuantity,
                low_stock_threshold:
                    Number(threshold) >= 0 ? Number(threshold) : 5,
            };

            await api.patch(`/inventory/${editing.id}/update/`, payload);

            closeEditor();
            await loadInventory();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.quantity?.[0] ||
                "Unable to update inventory."
            );
        } finally {
            setSaving(false);
        }
    }

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <SellerHeader minimal />
                <main className="nf-si-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading inventory…</p>
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
            <SellerHeader active="inventory" />

            <main className="nf-si-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/seller/dashboard">Seller Center</Link>
                    <span aria-hidden="true">/</span>
                    <span>Inventory</span>
                </nav>

                {/* ---- Heading ---- */}
                <header className="nf-si-heading">
                    <div>
                        <span className="section-eyebrow">INVENTORY MANAGEMENT</span>
                        <h1>Inventory</h1>
                        <p>Keep track of product variants and available stock.</p>
                    </div>
                </header>

                {error && (
                    <div className="nf-si-banner-error" role="alert">
                        {error}
                    </div>
                )}

                {/* ---- Metrics ---- */}
                <section className="nf-si-metrics" aria-label="Inventory statistics">
                    <div className="nf-si-metric">
                        <span className="nf-si-metric-icon"><IconBox /></span>
                        <span className="nf-si-metric-label">Inventory records</span>
                        <strong>{records.length}</strong>
                    </div>
                    <div className="nf-si-metric">
                        <span className="nf-si-metric-icon is-info"><IconCoins /></span>
                        <span className="nf-si-metric-label">Available units</span>
                        <strong>{stats.total.toLocaleString()}</strong>
                    </div>
                    <div className="nf-si-metric">
                        <span className="nf-si-metric-icon is-accent"><IconWarning /></span>
                        <span className="nf-si-metric-label">Low stock</span>
                        <strong>{stats.low}</strong>
                    </div>
                    <div className="nf-si-metric">
                        <span className="nf-si-metric-icon is-danger"><IconWarning /></span>
                        <span className="nf-si-metric-label">Out of stock</span>
                        <strong>{stats.out}</strong>
                    </div>
                </section>

                {/* ---- Toolbar ---- */}
                <section className="nf-si-toolbar" aria-label="Filters">
                    <div className="nf-si-search">
                        <span className="nf-si-search-icon" aria-hidden="true">
                            <IconSearch />
                        </span>
                        <label htmlFor="inventory-search" className="nf-visually-hidden">
                            Search inventory
                        </label>
                        <input
                            id="inventory-search"
                            type="search"
                            placeholder="Search product, SKU, size or color..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <label htmlFor="inventory-filter" className="nf-visually-hidden">
                        Filter inventory
                    </label>
                    <select
                        id="inventory-filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="ALL">All inventory</option>
                        <option value="HEALTHY">Healthy stock</option>
                        <option value="LOW">Low stock</option>
                        <option value="OUT">Out of stock</option>
                    </select>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="nf-si-clear"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    )}
                </section>

                {/* ================= EMPTY ================= */}
                {filteredRecords.length === 0 ? (
                    <section className="nf-si-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconBox />
                        </div>
                        <h2>
                            {hasActiveFilters
                                ? "No matching inventory"
                                : "No inventory records found"}
                        </h2>
                        <p>
                            {hasActiveFilters
                                ? "Try changing your search or filter."
                                : "Product variants with inventory records will appear here."}
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="nf-btn-ghost"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>
                        )}
                    </section>
                ) : (
                    /* ================= TABLE ================= */
                    <section className="nf-si-table-section" aria-label="Inventory records">
                        <header className="nf-si-table-head">
                            <h2>Inventory</h2>
                            <span className="nf-si-count">
                                Showing {filteredRecords.length} of{" "}
                                {records.length} record
                                {records.length === 1 ? "" : "s"}
                            </span>
                        </header>

                        <div className="nf-si-table-wrap">
                            <table className="nf-si-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Product</th>
                                        <th scope="col">SKU</th>
                                        <th scope="col">Variant</th>
                                        <th scope="col">Total stock</th>
                                        <th scope="col">Reserved</th>
                                        <th scope="col">Available</th>
                                        <th scope="col">Status</th>
                                        <th scope="col" className="nf-si-th-actions">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredRecords.map((record) => {
                                        const variant = getVariant(record);
                                        const product = getProduct(record);

                                        const available =
                                            record.available_quantity ??
                                            Math.max(
                                                Number(record.quantity || 0) -
                                                    Number(
                                                        record.reserved_quantity || 0
                                                    ),
                                                0
                                            );

                                        const threshold = Number(
                                            record.low_stock_threshold ?? 5
                                        );

                                        let status = "Healthy";
                                        let statusClass = "nf-si-status is-ok";

                                        if (available <= 0) {
                                            status = "Out of stock";
                                            statusClass = "nf-si-status is-out";
                                        } else if (available <= threshold) {
                                            status = "Low stock";
                                            statusClass = "nf-si-status is-low";
                                        }

                                        return (
                                            <tr key={record.id}>
                                                <td>
                                                    <strong className="nf-si-product">
                                                        {product.name || "Product"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="nf-si-sku">
                                                        {variant.sku || "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="nf-si-variant">
                                                        {variant.size || "—"}
                                                        {variant.color
                                                            ? ` / ${variant.color}`
                                                            : ""}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="nf-si-num">
                                                        {record.quantity ?? 0}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="nf-si-num is-muted">
                                                        {record.reserved_quantity ?? 0}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="nf-si-available">
                                                        {available}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className={statusClass}>
                                                        {status}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="nf-si-actions">
                                                        <button
                                                            type="button"
                                                            className="nf-si-action"
                                                            onClick={() => openEditor(record)}
                                                        >
                                                            <IconEdit /> Update
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

                {/* ================= EDITOR MODAL ================= */}
                {editing && (
                    <div
                        className="nf-si-modal-overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="nf-si-modal-title"
                        onClick={(e) => {
                            if (e.target === e.currentTarget && !saving) {
                                closeEditor();
                            }
                        }}
                    >
                        <div className="nf-si-modal">
                            <button
                                type="button"
                                className="nf-si-modal-close"
                                onClick={closeEditor}
                                disabled={saving}
                                aria-label="Close"
                            >
                                <IconClose />
                            </button>

                            <header className="nf-si-modal-head">
                                <span className="section-eyebrow">UPDATE INVENTORY</span>
                                <h2 id="nf-si-modal-title">
                                    {getProduct(editing).name || "Inventory record"}
                                </h2>
                                <p>
                                    Adjust the stock quantity and low-stock
                                    threshold for this variant.
                                </p>
                            </header>

                            <form className="nf-si-modal-form" onSubmit={saveInventory}>
                                <label className="nf-si-field">
                                    Stock quantity
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                    <small>
                                        Total units you have on hand, including
                                        reserved.
                                    </small>
                                </label>

                                <label className="nf-si-field">
                                    Low stock threshold
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={threshold}
                                        onChange={(e) => setThreshold(e.target.value)}
                                        required
                                    />
                                    <small>
                                        You'll be alerted when available stock
                                        falls to this number or below.
                                    </small>
                                </label>

                                <div className="nf-si-modal-actions">
                                    <button
                                        type="button"
                                        className="nf-btn-ghost"
                                        onClick={closeEditor}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="nf-btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? "Saving…" : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
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
                                <label htmlFor="si-header-search" className="nf-visually-hidden">
                                    Search products
                                </label>
                                <input
                                    id="si-header-search"
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
