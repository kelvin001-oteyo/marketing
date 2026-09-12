import { useEffect, useState } from "react";
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

/* =========================================================
   INLINE ICONS
========================================================= */

const IconStore = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v11H3z" />
        <path d="M9 20v-6h6v6" />
    </svg>
);

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

const IconDashboard = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
);

/* =========================================================
   SELLER STORE
========================================================= */

export default function SellerStore() {
    const [store, setStore] = useState(null);
    const [form, setForm] = useState({
        store_name: "",
        description: "",
        location: "",
        phone: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        loadStore();
    }, []);

    /* ---------- auto-dismiss success ---------- */
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 4000);
        return () => clearTimeout(timer);
    }, [success]);

    async function loadStore() {
        try {
            setLoading(true);

            const response = await api.get("/sellers/me/");
            const data = response.data;

            setStore(data);
            setForm({
                store_name: data.store_name || "",
                description: data.description || "",
                location: data.location || "",
                phone: data.phone || "",
            });
            setDirty(false);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.detail || "Unable to load your store."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setDirty(true);
        if (success) setSuccess("");
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await api.patch("/sellers/me/", form);

            setStore(response.data);
            setSuccess("Store information updated successfully.");
            setDirty(false);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.detail || "Unable to update your store."
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
                <main className="nf-ss-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading store…</p>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       MAIN
    ========================================================= */

    const storeSlug =
        store?.store_slug || store?.slug || store?.id || "";

    return (
        <div className="marketplace">
            <SellerHeader />

            <main className="nf-ss-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/seller/dashboard">Seller Center</Link>
                    <span aria-hidden="true">/</span>
                    <span>My Store</span>
                </nav>

                {/* ---- Heading ---- */}
                <header className="nf-ss-heading">
                    <div>
                        <span className="section-eyebrow">STORE MANAGEMENT</span>
                        <h1>My Store</h1>
                        <p>Manage how your store appears to customers.</p>
                    </div>

                    {storeSlug && (
                        <Link
                            to={`/stores/${storeSlug}`}
                            className="nf-btn-ghost"
                        >
                            <IconStore /> View Public Store <IconArrow />
                        </Link>
                    )}
                </header>

                {/* ---- Banners ---- */}
                {error && (
                    <div className="nf-ss-banner nf-ss-banner-error" role="alert">
                        <IconWarning />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="nf-ss-banner nf-ss-banner-success" role="status">
                        <IconCheck />
                        <span>{success}</span>
                    </div>
                )}

                {/* ---- Preview ---- */}
                {store && (
                    <section className="nf-ss-preview" aria-label="Store preview">
                        <div
                            className="nf-ss-preview-banner"
                            style={{
                                backgroundImage: store.banner
                                    ? `url(${getImageUrl(store.banner)})`
                                    : undefined,
                            }}
                        >
                            <span className="nf-ss-preview-overlay" aria-hidden="true" />

                            <div className="nf-ss-preview-content">
                                <div className="nf-ss-preview-logo">
                                    {store.logo ? (
                                        <img
                                            src={getImageUrl(store.logo)}
                                            alt={store.store_name}
                                        />
                                    ) : (
                                        <span>
                                            {(store.store_name || "S")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="nf-ss-preview-text">
                                    <h2>{store.store_name}</h2>
                                    <p>
                                        {store.verified
                                            ? "Verified Seller"
                                            : "Seller Store"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ---- Form ---- */}
                <form className="nf-ss-form" onSubmit={handleSubmit}>

                    <section className="nf-ss-card">
                        <header className="nf-ss-card-head">
                            <div>
                                <span className="section-eyebrow">BASICS</span>
                                <h2>Store information</h2>
                                <p>
                                    Keep your store information accurate and
                                    professional.
                                </p>
                            </div>
                        </header>

                        <div className="nf-ss-grid">
                            <label className="nf-ss-field">
                                Store name
                                <input
                                    name="store_name"
                                    value={form.store_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Nila Threads"
                                    autoComplete="organization"
                                    required
                                />
                            </label>

                            <label className="nf-ss-field">
                                Phone <span>(optional)</span>
                                <input
                                    name="phone"
                                    type="tel"
                                    inputMode="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. 0712345678"
                                    autoComplete="tel"
                                />
                            </label>

                            <label className="nf-ss-field nf-ss-field-full">
                                Location <span>(optional)</span>
                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Kisumu, Kenya"
                                    autoComplete="address-level2"
                                />
                            </label>

                            <label className="nf-ss-field nf-ss-field-full">
                                Store description
                                <textarea
                                    name="description"
                                    rows="7"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Tell customers about your store — what you sell, your story, what makes you different…"
                                />
                                <small>
                                    This appears at the top of your public
                                    store page.
                                </small>
                            </label>
                        </div>
                    </section>

                    {/* ---- Action bar ---- */}
                    <div className="nf-ss-actions">
                        <div className="nf-ss-actions-note">
                            {dirty ? (
                                <>
                                    <span className="nf-ss-dot" aria-hidden="true" />
                                    You have unsaved changes
                                </>
                            ) : (
                                <>
                                    <IconCheck /> All changes saved
                                </>
                            )}
                        </div>

                        <div className="nf-ss-actions-buttons">
                            <Link
                                to="/seller/dashboard"
                                className="nf-btn-ghost"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="nf-btn-primary"
                                disabled={saving || !dirty}
                            >
                                {saving ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
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
                                <label htmlFor="ss-search" className="nf-visually-hidden">
                                    Search products
                                </label>
                                <input
                                    id="ss-search"
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
                        <Link to="/seller/dashboard">
                            <IconDashboard /> Dashboard
                        </Link>
                        <Link to="/seller/products">Products</Link>
                        <Link to="/seller/inventory">Inventory</Link>
                        <Link to="/seller/orders">Orders</Link>
                        <Link to="/seller/store" className="active">
                            My Store
                        </Link>
                    </div>
                </nav>
            )}
        </>
    );
}
