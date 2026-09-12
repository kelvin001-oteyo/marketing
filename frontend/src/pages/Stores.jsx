import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconSearch = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const IconStore = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v11H3z" />
        <path d="M9 20v-6h6v6" />
    </svg>
);

const IconPin = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
    </svg>
);

const IconWarning = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

/* =========================================================
   STORES
========================================================= */

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/sellers/");
            const data = response.data;

            setStores(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            console.error("Failed to load stores:", err);
            setError(
                err.response?.data?.detail || "Unable to load stores."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------- filtering (unchanged) ---------- */

    const filteredStores = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return stores;

        return stores.filter((store) => {
            return (
                store.store_name?.toLowerCase().includes(query) ||
                store.location?.toLowerCase().includes(query) ||
                store.description?.toLowerCase().includes(query)
            );
        });
    }, [stores, search]);

    /* ---------- helpers (unchanged) ---------- */

    const getStoreInitial = (store) =>
        store.store_name?.charAt(0)?.toUpperCase() || "S";

    const getStoreLogo = (store) =>
        store.logo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            store.store_name || "Store"
        )}&background=172033&color=ffffff&size=300`;

    const getStoreBanner = (store) =>
        store.banner ||
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80";

    const getStoreSlug = (store) =>
        store.store_slug || store.slug || store.id;

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <Header minimal />
                <main className="nf-stores-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Discovering stores…</p>
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

            {/* ---- Hero ---- */}
            <section className="nf-stores-hero" aria-labelledby="nf-stores-hero-title">
                <div className="nf-stores-hero-bg" aria-hidden="true" />
                <div className="nf-stores-hero-overlay" aria-hidden="true" />

                <div className="nf-stores-hero-inner">
                    <span className="section-eyebrow">MARKETPLACE STORES</span>
                    <h1 id="nf-stores-hero-title">
                        Discover <br />
                        <span>great stores</span>
                    </h1>
                    <p>
                        Shop from trusted clothing sellers and discover
                        unique collections from across Kenya.
                    </p>
                </div>
            </section>

            <main className="nf-stores-main">

                {/* ---- Toolbar ---- */}
                <header className="nf-stores-toolbar">
                    <div>
                        <span className="section-eyebrow">DIRECTORY</span>
                        <h2>All stores</h2>
                        <p>
                            {stores.length}{" "}
                            {stores.length === 1 ? "store" : "stores"} on the
                            marketplace
                        </p>
                    </div>

                    <div className="nf-stores-search">
                        <span className="nf-search-icon" aria-hidden="true">
                            <IconSearch />
                        </span>
                        <label htmlFor="stores-search" className="nf-visually-hidden">
                            Search stores
                        </label>
                        <input
                            id="stores-search"
                            type="search"
                            placeholder="Search stores by name or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </header>

                {/* ---- Error ---- */}
                {error && (
                    <section className="nf-stores-empty" role="alert">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconWarning />
                        </div>
                        <h2>Unable to load stores</h2>
                        <p>{error}</p>
                        <div className="nf-empty-actions">
                            <button
                                type="button"
                                className="nf-btn-primary"
                                onClick={fetchStores}
                            >
                                Try again
                            </button>
                            <Link to="/products" className="nf-btn-ghost">
                                Browse Products
                            </Link>
                        </div>
                    </section>
                )}

                {/* ---- Empty ---- */}
                {!error && filteredStores.length === 0 && (
                    <section className="nf-stores-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconStore />
                        </div>
                        <h2>
                            {search
                                ? "No stores found"
                                : "No stores available yet"}
                        </h2>
                        <p>
                            {search
                                ? "Try searching for another store or location."
                                : "Stores will appear here as sellers join the marketplace."}
                        </p>
                        {search && (
                            <button
                                type="button"
                                className="nf-btn-ghost"
                                onClick={() => setSearch("")}
                            >
                                Clear search
                            </button>
                        )}
                    </section>
                )}

                {/* ---- Grid ---- */}
                {!error && filteredStores.length > 0 && (
                    <section
                        className="nf-stores-grid"
                        aria-label="Marketplace stores"
                    >
                        {filteredStores.map((store) => {
                            const slug = getStoreSlug(store);
                            const name = store.store_name || "Store";

                            return (
                                <article className="nf-store-card" key={store.id}>
                                    {/* ---- Banner ---- */}
                                    <Link
                                        to={`/stores/${slug}`}
                                        className="nf-store-banner"
                                        aria-label={`Visit ${name}`}
                                    >
                                        <img
                                            src={getStoreBanner(store)}
                                            alt={`${name} banner`}
                                            loading="lazy"
                                        />

                                        {store.verified && (
                                            <span className="nf-store-verified">
                                                <IconCheck /> Verified
                                            </span>
                                        )}
                                    </Link>

                                    {/* ---- Content ---- */}
                                    <div className="nf-store-body">
                                        <header className="nf-store-head">
                                            <div className="nf-store-logo" aria-hidden="true">
                                                {store.logo ? (
                                                    <img
                                                        src={getStoreLogo(store)}
                                                        alt={name}
                                                    />
                                                ) : (
                                                    <span>{getStoreInitial(store)}</span>
                                                )}
                                            </div>

                                            <div className="nf-store-title">
                                                <Link to={`/stores/${slug}`}>
                                                    {name}
                                                </Link>
                                                {store.location && (
                                                    <span>
                                                        <IconPin /> {store.location}
                                                    </span>
                                                )}
                                            </div>
                                        </header>

                                        <p className="nf-store-desc">
                                            {store.description ||
                                                "Discover clothing and fashion products from this marketplace seller."}
                                        </p>

                                        <div className="nf-store-stats">
                                            <div>
                                                <strong>
                                                    {Number(store.rating || 0).toFixed(1)}
                                                </strong>
                                                <span>Rating</span>
                                            </div>
                                            <div>
                                                <strong>
                                                    {store.product_count ??
                                                        store.products_count ??
                                                        "—"}
                                                </strong>
                                                <span>Products</span>
                                            </div>
                                            <div>
                                                <strong>
                                                    {store.verified ? "Yes" : "—"}
                                                </strong>
                                                <span>Verified</span>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/stores/${slug}`}
                                            className="nf-store-visit"
                                        >
                                            Visit store <IconArrow />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </main>

            {/* ---- Seller CTA ---- */}
            <section className="nf-stores-cta" aria-labelledby="nf-stores-cta-title">
                <div className="nf-stores-cta-bg" aria-hidden="true" />
                <div className="nf-stores-cta-overlay" aria-hidden="true" />

                <div className="nf-stores-cta-inner">
                    <div>
                        <span className="section-eyebrow">HAVE PRODUCTS TO SELL?</span>
                        <h2 id="nf-stores-cta-title">
                            Build your store on Nila Fashion
                        </h2>
                        <p>
                            Reach customers, showcase your products and grow
                            your clothing business online.
                        </p>
                    </div>

                    <Link to="/sell" className="nf-stores-cta-btn">
                        Become a seller <IconArrow />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

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
                            <label htmlFor="stores-header-search" className="nf-visually-hidden">
                                Search products
                            </label>
                            <input
                                id="stores-header-search"
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
                            <Link to="/login" className="marketplace-login">
                                Sign In
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
                        trusted clothing sellers.
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

export default Stores;
