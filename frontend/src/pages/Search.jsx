import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const MEDIA_BASE_URL = "http://127.0.0.1:8000";

/* =========================================================
   HELPERS (unchanged)
========================================================= */

function imageUrl(image) {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${MEDIA_BASE_URL}${image}`;
}

function getProducts(data) {
    if (Array.isArray(data)) return data;
    return data?.results || data?.products || [];
}

/* =========================================================
   INLINE ICONS
========================================================= */

const IconSearch = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const IconClose = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

const IconHeart = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
);

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
    </svg>
);

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product }) {
    const image =
        product.primary_image ||
        product.image ||
        product.images?.[0]?.image;

    const price =
        product.current_price ||
        product.discount_price ||
        product.price;

    const hasDiscount =
        product.discount_price &&
        Number(product.price) > Number(product.discount_price);

    const rating = Number(product.rating || 0);
    const reviewCount = Number(product.review_count || 0);
    const name = product.name || "Product";

    return (
        <Link
            to={`/products/${product.id}`}
            className="marketplace-product-card nf-product-card"
            aria-label={name}
        >
            <div className="product-image">
                {hasDiscount && (
                    <span className="product-sale">SALE</span>
                )}

                <button
                    type="button"
                    className="nf-wishlist-btn"
                    aria-label={`Add ${name} to wishlist`}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                >
                    <IconHeart />
                </button>

                {image ? (
                    <img
                        src={imageUrl(image)}
                        alt={name}
                        loading="lazy"
                    />
                ) : (
                    <div className="product-image-placeholder">
                        <span>{name.charAt(0).toUpperCase()}</span>
                    </div>
                )}
            </div>

            <div className="product-card-content">
                <span className="product-brand">
                    {product.brand || "Nila Fashion"}
                </span>

                <h3>{name}</h3>

                <div
                    className="product-rating"
                    aria-label={`Rated ${rating.toFixed(1)} out of 5`}
                >
                    <span aria-hidden="true">★</span>
                    <span>{rating.toFixed(1)}</span>
                    <small>({reviewCount})</small>
                </div>

                <div className="product-price">
                    <strong>
                        KSh {Number(price || 0).toLocaleString()}
                    </strong>
                    {hasDiscount && (
                        <del>
                            KSh {Number(product.price).toLocaleString()}
                        </del>
                    )}
                </div>
            </div>
        </Link>
    );
}

/* =========================================================
   SEARCH
========================================================= */

export default function Search() {
    const [params, setParams] = useSearchParams();

    const query = params.get("q") || "";

    const [search, setSearch] = useState(query);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setSearch(query);
        performSearch(query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    async function performSearch(searchQuery) {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/products/?search=${encodeURIComponent(
                    searchQuery
                )}&page_size=100`
            );

            setProducts(getProducts(response.data));
        } catch (err) {
            console.error(err);
            setError("Unable to search products.");
        } finally {
            setLoading(false);
        }
    }

    function submitSearch(e) {
        e.preventDefault();
        const value = search.trim();
        if (!value) return;
        setParams({ q: value });
    }

    function clearSearch() {
        setSearch("");
        setParams({});
    }

    return (
        <div className="marketplace">

            {/* ================= HEADER ================= */}
            <header className="marketplace-header">
                <div className="marketplace-header-inner">
                    <Link to="/" className="marketplace-logo" aria-label="Nila Fashion home">
                        <span className="marketplace-logo-mark">NF</span>
                        <span>Nila<strong>Fashion</strong></span>
                    </Link>

                    <form
                        className="marketplace-search"
                        role="search"
                        onSubmit={submitSearch}
                    >
                        <label htmlFor="search-header-input" className="nf-visually-hidden">
                            Search products
                        </label>
                        <input
                            id="search-header-input"
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products, brands and more..."
                            autoComplete="off"
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
                </div>
            </header>

            {/* ================= NAV ================= */}
            <nav className="marketplace-nav" aria-label="Primary">
                <div className="marketplace-nav-inner">
                    <Link to="/">Home</Link>
                    <Link to="/products">All Products</Link>
                    <Link to="/categories">Categories</Link>
                    <Link to="/stores">Stores</Link>
                    <Link to="/products?new=true">New Arrivals</Link>
                    <Link to="/products?featured=true">Featured</Link>
                    <Link to="/products?sale=true">Deals</Link>
                </div>
            </nav>

            <main className="nf-search-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <span>Search</span>
                </nav>

                {/* ---- Heading ---- */}
                <header className="nf-search-heading">
                    <div>
                        <span className="section-eyebrow">MARKETPLACE SEARCH</span>
                        <h1>
                            {query
                                ? <>Results for "<em>{query}</em>"</>
                                : "Search products"}
                        </h1>
                        <p>
                            Find products and compare available options.
                        </p>
                    </div>

                    {query && (
                        <button
                            type="button"
                            className="nf-clear-search"
                            onClick={clearSearch}
                        >
                            <IconClose /> Clear
                        </button>
                    )}
                </header>

                {/* ---- Results count ---- */}
                {!loading && !error && products.length > 0 && (
                    <div className="nf-search-count" aria-live="polite">
                        <strong>{products.length}</strong>{" "}
                        {products.length === 1 ? "result" : "results"} for{" "}
                        <em>"{query}"</em>
                    </div>
                )}

                {/* ================= LOADING ================= */}
                {loading && (
                    <div
                        className="nf-products-skeleton"
                        aria-hidden="true"
                    >
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div className="nf-skeleton-card" key={i}>
                                <div className="nf-skeleton-image" />
                                <div className="nf-skeleton-line" />
                                <div className="nf-skeleton-line short" />
                                <div className="nf-skeleton-line tiny" />
                            </div>
                        ))}
                    </div>
                )}

                {/* ================= ERROR ================= */}
                {!loading && error && (
                    <section className="nf-search-empty" role="alert">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconSearch />
                        </div>
                        <h2>Search unavailable</h2>
                        <p>{error}</p>
                        <div className="nf-empty-actions">
                            <button
                                type="button"
                                className="nf-btn-primary"
                                onClick={() => performSearch(query)}
                            >
                                Try again
                            </button>
                            <Link to="/products" className="nf-btn-ghost">
                                Browse Products
                            </Link>
                        </div>
                    </section>
                )}

                {/* ================= EMPTY ================= */}
                {!loading && !error && products.length === 0 && (
                    <section className="nf-search-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconSearch />
                        </div>
                        <h2>No products found</h2>
                        <p>
                            {query
                                ? <>We couldn't find anything matching "<strong>{query}</strong>". Try a different search term or browse our products.</>
                                : "Enter a search term above to find products."}
                        </p>
                        <div className="nf-empty-actions">
                            <Link to="/products" className="nf-btn-primary">
                                Browse Products <IconArrow />
                            </Link>
                            <Link to="/categories" className="nf-btn-ghost">
                                Explore Categories
                            </Link>
                        </div>
                    </section>
                )}

                {/* ================= GRID ================= */}
                {!loading && !error && products.length > 0 && (
                    <section
                        className="nf-search-grid"
                        aria-label={`Search results for ${query}`}
                    >
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </section>
                )}
            </main>

            {/* ---- Footer ---- */}
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
        </div>
    );
}
