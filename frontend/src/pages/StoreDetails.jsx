import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const FALLBACK_PRODUCT_IMAGE =
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=80";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconPin = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const IconPhone = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
);

const IconSearch = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const IconStore = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v11H3z" />
        <path d="M9 20v-6h6v6" />
    </svg>
);

const IconWarning = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

const IconHeart = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
);

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product, formatPrice }) {
    const image =
        product.images?.[0]?.image ||
        product.image ||
        FALLBACK_PRODUCT_IMAGE;

    const currentPrice =
        product.current_price ??
        product.discount_price ??
        product.price ??
        0;

    const originalPrice = product.price ?? currentPrice;

    const discount =
        Number(originalPrice) > Number(currentPrice)
            ? Math.round(
                  ((Number(originalPrice) - Number(currentPrice)) /
                      Number(originalPrice)) *
                      100
              )
            : 0;

    const name = product.name || "Product";
    const rating = Number(product.rating || 0);

    return (
        <Link
            to={`/products/${product.id}`}
            className="marketplace-product-card nf-product-card"
            aria-label={name}
        >
            <div className="product-image">
                {discount > 0 && (
                    <span className="product-sale">-{discount}%</span>
                )}

                <button
                    type="button"
                    className="nf-wishlist-btn"
                    aria-label={`Add ${name} to wishlist`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <IconHeart />
                </button>

                <img src={image} alt={name} loading="lazy" />
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
                    <span>{rating > 0 ? rating.toFixed(1) : "New"}</span>
                    <small>({product.review_count || 0})</small>
                </div>

                <div className="product-price">
                    <strong>{formatPrice(currentPrice)}</strong>
                    {Number(originalPrice) > Number(currentPrice) && (
                        <del>{formatPrice(originalPrice)}</del>
                    )}
                </div>
            </div>
        </Link>
    );
}

/* =========================================================
   STORE DETAILS
========================================================= */

const StoreDetails = () => {
    const { slug } = useParams();

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        fetchStore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    useEffect(() => {
        if (store) fetchStoreProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store]);

    const fetchStore = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/sellers/${slug}/`);
            setStore(response.data);
        } catch (err) {
            console.error("Failed to load store:", err);
            setError(
                err.response?.data?.detail || "Unable to load this store."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchStoreProducts = async () => {
        try {
            setProductsLoading(true);

            const sellerId = store.id;

            const response = await api.get(
                `/products/?seller=${sellerId}&page_size=100`
            );

            const data = response.data;

            setProducts(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            console.error("Failed to load store products:", err);
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    /* ---------- helpers (unchanged) ---------- */

    const getBanner = () =>
        store?.banner ||
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85";

    const getLogo = () =>
        store?.logo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            store?.store_name || "Store"
        )}&background=172033&color=ffffff&size=300`;

    const formatPrice = (value) =>
        new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(Number(value || 0));

    const filteredProducts = useMemo(() => {
        let result = [...products];
        const query = search.trim().toLowerCase();

        if (query) {
            result = result.filter((product) =>
                product.name?.toLowerCase().includes(query)
            );
        }

        if (sort === "price-low") {
            result.sort(
                (a, b) =>
                    Number(a.current_price ?? a.discount_price ?? a.price ?? 0) -
                    Number(b.current_price ?? b.discount_price ?? b.price ?? 0)
            );
        }
        if (sort === "price-high") {
            result.sort(
                (a, b) =>
                    Number(b.current_price ?? b.discount_price ?? b.price ?? 0) -
                    Number(a.current_price ?? a.discount_price ?? a.price ?? 0)
            );
        }
        if (sort === "rating") {
            result.sort(
                (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
            );
        }

        return result;
    }, [products, search, sort]);

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <Header minimal />
                <main className="nf-sd-store-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading store…</p>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error || !store) {
        return (
            <div className="marketplace">
                <Header minimal />

                <main className="nf-sd-store-main">
                    <div className="nf-sd-store-empty" role="alert">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconWarning />
                        </div>
                        <h2>Store unavailable</h2>
                        <p>{error || "This store could not be found."}</p>
                        <div className="nf-empty-actions">
                            <Link to="/stores" className="nf-btn-primary">
                                Back to stores
                            </Link>
                            <Link to="/products" className="nf-btn-ghost">
                                Browse Products
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

    const productCount =
        store.product_count ?? store.products_count ?? products.length;

    const joinedYear = store.created_at
        ? new Date(store.created_at).getFullYear()
        : "—";

    return (
        <div className="marketplace">
            <Header />

            <main className="nf-sd-store-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link to="/stores">Stores</Link>
                    <span aria-hidden="true">/</span>
                    <span>{store.store_name}</span>
                </nav>

                {/* ---- Banner ---- */}
                <section className="nf-sd-store-banner" aria-labelledby="nf-sd-store-title">
                    <div className="nf-sd-store-banner-img">
                        <img src={getBanner()} alt={`${store.store_name} banner`} />
                        <span className="nf-sd-store-banner-overlay" aria-hidden="true" />
                    </div>

                    <div className="nf-sd-store-banner-content">
                        <div className="nf-sd-store-banner-logo" aria-hidden="true">
                            <img src={getLogo()} alt={store.store_name} />
                        </div>

                        <div className="nf-sd-store-banner-text">
                            <div className="nf-sd-store-name-row">
                                <h1 id="nf-sd-store-title">{store.store_name}</h1>
                                {store.verified && (
                                    <span className="nf-sd-store-verified-badge">
                                        <IconCheck /> Verified
                                    </span>
                                )}
                            </div>

                            {store.location && (
                                <p className="nf-sd-store-location">
                                    <IconPin /> {store.location}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* ---- Stats ---- */}
                <section className="nf-sd-store-stats" aria-label="Store statistics">
                    <div>
                        <strong>{Number(store.rating || 0).toFixed(1)}</strong>
                        <span>Store rating</span>
                    </div>
                    <div>
                        <strong>{productCount}</strong>
                        <span>Products</span>
                    </div>
                    <div>
                        <strong>{store.verified ? "Verified" : "Active"}</strong>
                        <span>Seller status</span>
                    </div>
                    <div>
                        <strong>{joinedYear}</strong>
                        <span>Joined</span>
                    </div>
                </section>

                {/* ---- About ---- */}
                <section className="nf-sd-store-about" aria-labelledby="nf-sd-store-about-title">
                    <div className="nf-sd-store-about-content">
                        <span className="section-eyebrow">ABOUT THE STORE</span>
                        <h2 id="nf-sd-store-about-title">{store.store_name}</h2>
                        <p>
                            {store.description ||
                                "Welcome to our marketplace store. Discover quality clothing and fashion products from our collection."}
                        </p>

                        <div className="nf-sd-store-meta">
                            {store.location && (
                                <div>
                                    <span>Location</span>
                                    <strong>
                                        <IconPin /> {store.location}
                                    </strong>
                                </div>
                            )}
                            {store.phone && (
                                <div>
                                    <span>Contact</span>
                                    <strong>
                                        <IconPhone /> {store.phone}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="nf-sd-store-trust">
                        <div className="nf-sd-store-trust-icon" aria-hidden="true">
                            {store.verified ? <IconShield /> : <IconStore />}
                        </div>
                        <div>
                            <strong>
                                {store.verified ? "Verified seller" : "Marketplace seller"}
                            </strong>
                            <p>
                                {store.verified
                                    ? "This seller has been verified by the marketplace."
                                    : "This seller is currently active on the marketplace."}
                            </p>
                        </div>
                    </aside>
                </section>

                {/* ---- Products ---- */}
                <section className="nf-sd-store-products" aria-labelledby="nf-sd-store-products-title">
                    <header className="nf-sd-store-products-head">
                        <div>
                            <span className="section-eyebrow">STORE COLLECTION</span>
                            <h2 id="nf-sd-store-products-title">
                                Products from {store.store_name}
                            </h2>
                        </div>

                        <div className="nf-sd-store-products-controls">
                            <div className="nf-sd-store-search">
                                <span aria-hidden="true"><IconSearch /></span>
                                <label htmlFor="store-products-search" className="nf-visually-hidden">
                                    Search products in this store
                                </label>
                                <input
                                    id="store-products-search"
                                    type="search"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <label htmlFor="store-products-sort" className="nf-visually-hidden">
                                Sort products
                            </label>
                            <select
                                id="store-products-sort"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="newest">Newest</option>
                                <option value="price-low">Price: Low to high</option>
                                <option value="price-high">Price: High to low</option>
                                <option value="rating">Top rated</option>
                            </select>
                        </div>
                    </header>

                    {productsLoading ? (
                        <div className="nf-products-skeleton" aria-hidden="true">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div className="nf-skeleton-card" key={i}>
                                    <div className="nf-skeleton-image" />
                                    <div className="nf-skeleton-line" />
                                    <div className="nf-skeleton-line short" />
                                    <div className="nf-skeleton-line tiny" />
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="nf-sd-store-products-empty">
                            <div className="nf-empty-icon" aria-hidden="true">
                                <IconStore />
                            </div>
                            <h3>
                                {search ? "No matching products" : "No products yet"}
                            </h3>
                            <p>
                                {search
                                    ? "Try another search term."
                                    : "This seller has not listed any products yet."}
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
                        </div>
                    ) : (
                        <div className="nf-products-grid">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    formatPrice={formatPrice}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

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
                            <label htmlFor="stored-header-search" className="nf-visually-hidden">
                                Search products
                            </label>
                            <input
                                id="stored-header-search"
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

export default StoreDetails;
