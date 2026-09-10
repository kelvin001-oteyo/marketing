import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

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

            setStores(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error("Failed to load stores:", err);
            setError(
                err.response?.data?.detail ||
                    "Unable to load stores."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredStores = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return stores;
        }

        return stores.filter((store) => {
            return (
                store.store_name
                    ?.toLowerCase()
                    .includes(query) ||
                store.location
                    ?.toLowerCase()
                    .includes(query) ||
                store.description
                    ?.toLowerCase()
                    .includes(query)
            );
        });
    }, [stores, search]);

    const getStoreInitial = (store) => {
        return (
            store.store_name?.charAt(0)?.toUpperCase() || "S"
        );
    };

    const getStoreLogo = (store) => {
        return (
            store.logo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                store.store_name || "Store"
            )}&background=111111&color=ffffff&size=300`
        );
    };

    const getStoreBanner = (store) => {
        return (
            store.banner ||
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
        );
    };

    if (loading) {
        return (
            <div className="marketplace-page">
                <div className="marketplace-container">
                    <div className="marketplace-loading">
                        <div className="loading-spinner"></div>
                        <p>Discovering stores...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="marketplace-page">
            {/* HEADER */}
            <header className="marketplace-header">
                <div className="marketplace-container marketplace-header-inner">
                    <Link
                        to="/"
                        className="marketplace-logo"
                    >
                        Kelvoh<span>Market</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/">Home</Link>
                        <Link to="/products">Products</Link>
                        <Link to="/categories">
                            Categories
                        </Link>
                        <Link
                            to="/stores"
                            className="active"
                        >
                            Stores
                        </Link>
                        <Link to="/sell">Sell</Link>
                    </nav>

                    <div className="marketplace-actions">
                        <Link
                            to="/wishlist"
                            className="marketplace-action"
                        >
                            ♡
                        </Link>

                        <Link
                            to="/cart"
                            className="marketplace-action"
                        >
                            🛒
                        </Link>

                        <Link
                            to="/login"
                            className="marketplace-login-button"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO */}
            <section className="stores-hero">
                <div className="marketplace-container">
                    <div className="stores-hero-content">
                        <span>MARKETPLACE STORES</span>

                        <h1>
                            Discover
                            <br />
                            great stores
                        </h1>

                        <p>
                            Shop from trusted clothing sellers
                            and discover unique collections
                            from across Kenya.
                        </p>
                    </div>
                </div>
            </section>

            {/* STORE DIRECTORY */}
            <main className="marketplace-container stores-page">
                <div className="stores-toolbar">
                    <div>
                        <h2>All stores</h2>
                        <p>
                            {stores.length}{" "}
                            {stores.length === 1
                                ? "store"
                                : "stores"}{" "}
                            on the marketplace
                        </p>
                    </div>

                    <div className="stores-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search stores..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>
                </div>

                {error && (
                    <div className="marketplace-error">
                        <h3>Unable to load stores</h3>
                        <p>{error}</p>

                        <button
                            type="button"
                            className="marketplace-primary-button"
                            onClick={fetchStores}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!error &&
                    filteredStores.length === 0 && (
                        <div className="stores-empty">
                            <div className="stores-empty-icon">
                                ◇
                            </div>

                            <h3>
                                {search
                                    ? "No stores found"
                                    : "No stores available yet"}
                            </h3>

                            <p>
                                {search
                                    ? "Try searching for another store or location."
                                    : "Stores will appear here as sellers join the marketplace."}
                            </p>

                            {search && (
                                <button
                                    type="button"
                                    className="marketplace-secondary-button"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}

                {!error &&
                    filteredStores.length > 0 && (
                        <div className="stores-grid">
                            {filteredStores.map((store) => (
                                <article
                                    className="store-card"
                                    key={store.id}
                                >
                                    <Link
                                        to={`/stores/${
                                            store.store_slug ||
                                            store.slug ||
                                            store.id
                                        }`}
                                        className="store-card-banner"
                                    >
                                        <img
                                            src={getStoreBanner(
                                                store
                                            )}
                                            alt={`${store.store_name} banner`}
                                        />

                                        {store.verified && (
                                            <span className="store-verified-badge">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </Link>

                                    <div className="store-card-content">
                                        <div className="store-card-top">
                                            <div className="store-logo">
                                                {store.logo ? (
                                                    <img
                                                        src={getStoreLogo(
                                                            store
                                                        )}
                                                        alt={
                                                            store.store_name
                                                        }
                                                    />
                                                ) : (
                                                    <span>
                                                        {getStoreInitial(
                                                            store
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="store-card-title">
                                                <Link
                                                    to={`/stores/${
                                                        store.store_slug ||
                                                        store.slug ||
                                                        store.id
                                                    }`}
                                                >
                                                    {
                                                        store.store_name
                                                    }
                                                </Link>

                                                {store.location && (
                                                    <span>
                                                        📍{" "}
                                                        {
                                                            store.location
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="store-card-description">
                                            {store.description ||
                                                "Discover clothing and fashion products from this marketplace seller."}
                                        </p>

                                        <div className="store-card-stats">
                                            <div>
                                                <strong>
                                                    {Number(
                                                        store.rating ||
                                                            0
                                                    ).toFixed(1)}
                                                </strong>

                                                <span>
                                                    ★ Rating
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    {store.product_count ??
                                                        store.products_count ??
                                                        "—"}
                                                </strong>

                                                <span>
                                                    Products
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    {store.verified
                                                        ? "Yes"
                                                        : "—"}
                                                </strong>

                                                <span>
                                                    Verified
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/stores/${
                                                store.store_slug ||
                                                store.slug ||
                                                store.id
                                            }`}
                                            className="store-view-button"
                                        >
                                            Visit store
                                            <span>→</span>
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
            </main>

            {/* SELLER CTA */}
            <section className="stores-seller-cta">
                <div className="marketplace-container">
                    <div className="stores-seller-cta-inner">
                        <div>
                            <span>
                                HAVE PRODUCTS TO SELL?
                            </span>

                            <h2>
                                Build your store on
                                KelvohMarket
                            </h2>

                            <p>
                                Reach customers, showcase your
                                products and grow your clothing
                                business online.
                            </p>
                        </div>

                        <Link
                            to="/sell"
                            className="stores-cta-button"
                        >
                            Become a seller →
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="marketplace-footer">
                <div className="marketplace-container marketplace-footer-grid">
                    <div>
                        <Link
                            to="/"
                            className="marketplace-logo"
                        >
                            Kelvoh<span>Market</span>
                        </Link>

                        <p>
                            A modern marketplace connecting
                            customers with trusted clothing
                            sellers.
                        </p>
                    </div>

                    <div>
                        <h4>Marketplace</h4>
                        <Link to="/products">
                            Products
                        </Link>
                        <Link to="/categories">
                            Categories
                        </Link>
                        <Link to="/stores">
                            Stores
                        </Link>
                    </div>

                    <div>
                        <h4>Customer</h4>
                        <Link to="/orders">Orders</Link>
                        <Link to="/wishlist">
                            Wishlist
                        </Link>
                        <Link to="/cart">Cart</Link>
                    </div>

                    <div>
                        <h4>Sell with us</h4>
                        <Link to="/sell">
                            Become a seller
                        </Link>
                        <Link to="/seller">
                            Seller dashboard
                        </Link>
                    </div>
                </div>

                <div className="marketplace-footer-bottom">
                    © {new Date().getFullYear()}{" "}
                    KelvohMarket. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Stores;