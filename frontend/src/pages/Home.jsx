import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   INLINE ICONS (no new dependencies)
========================================================= */

const IconShield = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const IconPhone = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M11 18h2" />
    </svg>
);

const IconStore = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v11H3z" />
        <path d="M9 20v-6h6v6" />
    </svg>
);

const IconTruck = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h11v9H3z" />
        <path d="M14 9h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
    </svg>
);

const IconHeart = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
);

/* =========================================================
   REUSABLE SUBCOMPONENTS
========================================================= */

function SectionHeading({ id, eyebrow, title, description, linkTo, linkLabel }) {
    return (
        <div className="section-heading">
            <div>
                <span className="section-eyebrow">{eyebrow}</span>
                <h2 id={id}>{title}</h2>
                {description && <p>{description}</p>}
            </div>
            {linkTo && (
                <Link to={linkTo}>
                    {linkLabel || "View all"} <span aria-hidden="true">→</span>
                </Link>
            )}
        </div>
    );
}

function ProductCard({ product, helpers }) {
    const {
        getProductImage,
        getProductPrice,
        getOriginalPrice,
        hasDiscount,
        isNewArrival,
        formatPrice,
    } = helpers;

    const image = getProductImage(product);
    const name = product.name || "Product";

    return (
        <Link
            to={`/products/${product.id}`}
            className="marketplace-product-card nf-product-card"
            aria-label={name}
        >
            <div className="product-image">
                {hasDiscount(product) && (
                    <span className="product-sale">SALE</span>
                )}
                {isNewArrival(product) && (
                    <span className="product-new">NEW</span>
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
                    <img src={image} alt={name} loading="lazy" />
                ) : (
                    <div className="product-image-placeholder">
                        <span>{name.charAt(0).toUpperCase() || "N"}</span>
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
                    aria-label={`Rated ${product.rating ?? 0} out of 5`}
                >
                    <span aria-hidden="true">★</span>
                    <span>{product.rating ?? "0.0"}</span>
                    <small>({product.review_count ?? 0})</small>
                </div>

                <div className="product-price">
                    <strong>{formatPrice(getProductPrice(product))}</strong>
                    {hasDiscount(product) && (
                        <del>{formatPrice(getOriginalPrice(product))}</del>
                    )}
                </div>
            </div>
        </Link>
    );
}

function ProductSection({ id, eyebrow, title, description, linkTo, linkLabel, products, loading, helpers, emptyMessage }) {
    return (
        <section className="marketplace-section" aria-labelledby={id}>
            <SectionHeading
                id={id}
                eyebrow={eyebrow}
                title={title}
                description={description}
                linkTo={linkTo}
                linkLabel={linkLabel}
            />

            {loading ? (
                <div className="marketplace-loading">Loading products...</div>
            ) : products.length === 0 ? (
                <div className="marketplace-empty">{emptyMessage}</div>
            ) : (
                <div className="product-grid">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            helpers={helpers}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

/* =========================================================
   HOME
========================================================= */

function Home() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getArray = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    };

    useEffect(() => {
        const loadMarketplace = async () => {
            try {
                setLoading(true);
                setError("");

                const [productsResponse, categoriesResponse] =
                    await Promise.all([
                        api.get("/products/"),
                        api.get("/categories/"),
                    ]);

                setProducts(getArray(productsResponse.data));
                setCategories(getArray(categoriesResponse.data));
            } catch (err) {
                console.error("Failed to load marketplace:", err);
                setError(
                    "We could not load marketplace content right now."
                );
            } finally {
                setLoading(false);
            }
        };

        loadMarketplace();
    }, []);

    /* =========================================================
       HELPERS (unchanged behaviour)
    ========================================================= */

    const getImageUrl = (image) => {
        if (!image) return "";

        if (image.startsWith("http://") || image.startsWith("https://")) {
            return image;
        }

        const apiBase =
            api.defaults.baseURL || "http://127.0.0.1:8000/api/v1";

        const backendBase = apiBase.replace("/api/v1", "");

        return `${backendBase}${image.startsWith("/") ? "" : "/"}${image}`;
    };

    const getProductImage = (product) => {
        const image =
            product.image ||
            product.thumbnail ||
            product.main_image ||
            product.images?.[0]?.image ||
            product.product_images?.[0]?.image ||
            "";

        return getImageUrl(image);
    };

    const getCategoryImage = (category) => getImageUrl(category?.image || "");

    const getProductPrice = (product) =>
        product.current_price ??
        product.discount_price ??
        product.price ??
        0;

    const getOriginalPrice = (product) => product.price ?? 0;

    const hasDiscount = (product) => {
        const current = Number(getProductPrice(product));
        const original = Number(getOriginalPrice(product));
        return original > current;
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(Number(price || 0));

    const isFeatured = (product) =>
        product.featured === true || product.featured === "true";

    const isNewArrival = (product) =>
        product.new_arrival === true || product.new_arrival === "true";

    const discountedProducts = useMemo(() => {
        return products.filter(hasDiscount).slice(0, 8);
    }, [products]);

    const featuredProducts = useMemo(() => {
        const featured = products.filter(isFeatured);
        if (featured.length > 0) return featured.slice(0, 8);
        return products.slice(0, 8);
    }, [products]);

    const newArrivals = useMemo(() => {
        const arrivals = products.filter(isNewArrival);
        if (arrivals.length > 0) return arrivals.slice(0, 8);

        return [...products]
            .sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            })
            .slice(0, 8);
    }, [products]);

    const handleSearch = (event) => {
        event.preventDefault();
        const value = searchTerm.trim();

        if (!value) {
            navigate("/search");
            return;
        }

        navigate(`/search?q=${encodeURIComponent(value)}`);
    };

    const helpers = {
        getProductImage,
        getProductPrice,
        getOriginalPrice,
        hasDiscount,
        isNewArrival,
        formatPrice,
    };

    const productCountLabel =
        products.length > 0 ? `${products.length}+` : "—";

    const categoryCountLabel =
        categories.length > 0 ? `${categories.length}+` : "—";

    return (
        <div className="marketplace">

            {/* ================= HEADER ================= */}
            <header className="marketplace-header">
                <div className="marketplace-header-inner">

                    <Link to="/" className="marketplace-logo" aria-label="Nila Fashion home">
                        <span className="marketplace-logo-mark">NF</span>
                        <span>
                            Nila<strong>Fashion</strong>
                        </span>
                    </Link>

                    <form
                        className="marketplace-search"
                        onSubmit={handleSearch}
                        role="search"
                    >
                        <label htmlFor="marketplace-search-input" className="nf-visually-hidden">
                            Search products
                        </label>
                        <input
                            id="marketplace-search-input"
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
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
                </div>
            </header>

            {/* ================= NAV ================= */}
            <nav className="marketplace-nav" aria-label="Primary">
                <div className="marketplace-nav-inner">
                    <Link to="/" className="active">Home</Link>
                    <Link to="/products">All Products</Link>
                    <Link to="/categories">Categories</Link>
                    <Link to="/stores">Stores</Link>
                    <Link to="/products?new=true">New Arrivals</Link>
                    <Link to="/products?featured=true">Featured</Link>
                    <Link to="/products?sale=true">Deals</Link>
                </div>
            </nav>

            <main>

                {/* ================= HERO ================= */}
                <section className="nf-hero" aria-labelledby="nf-hero-title">
                    <div className="nf-hero-bg" aria-hidden="true" />
                    <div className="nf-hero-overlay" aria-hidden="true" />

                    <div className="nf-hero-inner">
                        <div className="marketplace-hero-content">
                            <span className="hero-eyebrow">
                                THE MODERN CLOTHING MARKETPLACE
                            </span>

                            <h1 id="nf-hero-title">
                                Discover your style.
                                <br />
                                <span>Shop with confidence.</span>
                            </h1>

                            <p>
                                Discover fashion from sellers across the
                                marketplace. Find the styles you love, compare
                                products and shop securely.
                            </p>

                            <div className="hero-actions">
                                <Link to="/products" className="hero-primary-btn">
                                    Start Shopping
                                </Link>
                                <Link to="/categories" className="hero-secondary-btn">
                                    Explore Categories
                                </Link>
                            </div>

                            <div className="hero-trust">
                                <div>
                                    <strong>{productCountLabel}</strong>
                                    <span>Products</span>
                                </div>
                                <div>
                                    <strong>{categoryCountLabel}</strong>
                                    <span>Categories</span>
                                </div>
                                <div>
                                    <strong>24/7</strong>
                                    <span>Marketplace</span>
                                </div>
                            </div>
                        </div>

                        <div className="marketplace-hero-visual">
                            {products[0] && (
                                <Link
                                    to={`/products/${products[0].id}`}
                                    className="hero-fashion-card hero-card-one"
                                >
                                    <span>FEATURED</span>
                                    {getProductImage(products[0]) ? (
                                        <img
                                            src={getProductImage(products[0])}
                                            alt={products[0].name || "Featured product"}
                                        />
                                    ) : (
                                        <div className="fashion-placeholder">
                                            Fashion
                                        </div>
                                    )}
                                </Link>
                            )}

                            {products[1] && (
                                <Link
                                    to={`/products/${products[1].id}`}
                                    className="hero-fashion-card hero-card-two"
                                >
                                    {getProductImage(products[1]) ? (
                                        <img
                                            src={getProductImage(products[1])}
                                            alt={products[1].name || "Featured product"}
                                        />
                                    ) : (
                                        <div className="fashion-placeholder">
                                            Style
                                        </div>
                                    )}
                                </Link>
                            )}

                            <div className="hero-floating-card">
                                <span>SECURE SHOPPING</span>
                                <strong>Pay securely with M-Pesa</strong>
                                <small>
                                    Fast and convenient payments at checkout.
                                </small>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= TRUST STRIP ================= */}
                <section className="marketplace-trust-strip nf-trust-strip" aria-label="Marketplace guarantees">
                    <div className="trust-item">
                        <div className="trust-icon" aria-hidden="true">
                            <IconShield />
                        </div>
                        <div>
                            <strong>Secure Shopping</strong>
                            <span>Shop with confidence</span>
                        </div>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon" aria-hidden="true">
                            <IconPhone />
                        </div>
                        <div>
                            <strong>M-Pesa Payments</strong>
                            <span>Convenient checkout</span>
                        </div>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon" aria-hidden="true">
                            <IconStore />
                        </div>
                        <div>
                            <strong>Trusted Sellers</strong>
                            <span>Discover marketplace stores</span>
                        </div>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon" aria-hidden="true">
                            <IconTruck />
                        </div>
                        <div>
                            <strong>Fast Ordering</strong>
                            <span>Simple checkout experience</span>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="marketplace-error nf-error" role="alert">
                        {error}
                    </div>
                )}

                {/* ================= CATEGORIES ================= */}
                <section className="marketplace-section" aria-labelledby="nf-categories-title">
                    <SectionHeading
                        id="nf-categories-title"
                        eyebrow="EXPLORE"
                        title="Shop by category"
                        description="Find fashion that fits your style."
                        linkTo="/categories"
                        linkLabel="View all"
                    />

                    {loading ? (
                        <div className="marketplace-loading">
                            Loading categories...
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="marketplace-empty">
                            Categories will appear here once they are added
                            from the admin dashboard.
                        </div>
                    ) : (
                        <div className="category-grid nf-category-grid">
                            {categories
                                .filter((category) => category.is_active !== false)
                                .slice(0, 8)
                                .map((category) => {
                                    const image = getCategoryImage(category);
                                    return (
                                        <Link
                                            key={category.id}
                                            to={`/categories/${category.slug || category.id}`}
                                            className="nf-category-card"
                                        >
                                            <div className="nf-category-image">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={category.name || "Category"}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <span aria-hidden="true">
                                                        {category.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "N"}
                                                    </span>
                                                )}
                                                <span className="nf-category-overlay" aria-hidden="true" />
                                            </div>

                                            <div className="nf-category-body">
                                                <h3>{category.name}</h3>
                                                <span>
                                                    Shop now{" "}
                                                    <span aria-hidden="true">→</span>
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    )}
                </section>

                {/* ================= FEATURED ================= */}
                <ProductSection
                    id="nf-featured-title"
                    eyebrow="HANDPICKED"
                    title="Featured products"
                    description="Discover products selected for the marketplace."
                    linkTo="/products?featured=true"
                    linkLabel="View all"
                    products={featuredProducts}
                    loading={loading}
                    helpers={helpers}
                    emptyMessage="Products will appear here once sellers add them through the marketplace."
                />

                {/* ================= NEW ARRIVALS ================= */}
                {newArrivals.length > 0 && (
                    <ProductSection
                        id="nf-new-title"
                        eyebrow="JUST IN"
                        title="New arrivals"
                        description="Fresh styles recently added to the marketplace."
                        linkTo="/products?new=true"
                        linkLabel="Explore new arrivals"
                        products={newArrivals}
                        loading={false}
                        helpers={helpers}
                        emptyMessage="New products will appear here soon."
                    />
                )}

                {/* ================= DEALS ================= */}
                {discountedProducts.length > 0 && (
                    <section
                        className="marketplace-section marketplace-deals-section nf-deals-section"
                        aria-labelledby="nf-deals-title"
                    >
                        <SectionHeading
                            id="nf-deals-title"
                            eyebrow="SPECIAL OFFERS"
                            title="Deals worth checking out"
                            description="Save more on selected marketplace products."
                            linkTo="/products?sale=true"
                            linkLabel="View all deals"
                        />

                        <div className="product-grid">
                            {discountedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    helpers={helpers}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* ================= SELLER CTA ================= */}
                <section className="nf-seller-cta" aria-labelledby="nf-seller-title">
                    <div className="nf-seller-cta-bg" aria-hidden="true" />
                    <div className="nf-seller-cta-overlay" aria-hidden="true" />

                    <div className="nf-seller-cta-inner">
                        <div>
                            <span className="section-eyebrow">
                                SELL ON OUR MARKETPLACE
                            </span>
                            <h2 id="nf-seller-title">
                                Turn your products into a business.
                            </h2>
                            <p>
                                Create your store, add your products and
                                connect with customers looking for fashion.
                            </p>
                        </div>

                        <Link to="/sell" className="seller-cta-button">
                            Become a Seller <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </section>

                {/* ================= M-PESA ================= */}
                <section className="nf-mpesa-section" aria-labelledby="nf-mpesa-title">
                    <div className="nf-mpesa-bg" aria-hidden="true" />

                    <div className="nf-mpesa-inner">
                        <div className="mpesa-home-content">
                            <span className="section-eyebrow">
                                SIMPLE &amp; SECURE CHECKOUT
                            </span>
                            <h2 id="nf-mpesa-title">
                                Shop now. Pay with M-Pesa.
                            </h2>
                            <p>
                                Add your favourite products to your cart and
                                complete your order using M-Pesa directly from
                                checkout.
                            </p>
                            <Link to="/products" className="mpesa-home-button">
                                Start Shopping <span aria-hidden="true">→</span>
                            </Link>
                        </div>

                        <div className="mpesa-home-card">
                            <div className="mpesa-badge">M-PESA</div>
                            <strong>Secure payment</strong>
                            <span>
                                Your payment request is sent directly to your
                                phone at checkout.
                            </span>
                        </div>
                    </div>
                </section>

            </main>

            {/* ================= FOOTER ================= */}
            <footer className="marketplace-footer">
                <div className="marketplace-footer-grid">

                    <div>
                        <Link to="/" className="marketplace-logo footer-logo" aria-label="Nila Fashion home">
                            <span className="marketplace-logo-mark">NF</span>
                            <span>
                                Nila<strong>Fashion</strong>
                            </span>
                        </Link>
                        <p>
                            A modern marketplace for discovering clothing,
                            fashion and trusted sellers.
                        </p>
                    </div>

                    <div>
                        <h3>Marketplace</h3>
                        <Link to="/products">Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                        <Link to="/search">Search</Link>
                    </div>

                    <div>
                        <h3>Customer</h3>
                        <Link to="/cart">Cart</Link>
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/orders">My Orders</Link>
                        <Link to="/profile">My Profile</Link>
                    </div>

                    <div>
                        <h3>Sell</h3>
                        <Link to="/sell">Become a Seller</Link>
                        <Link to="/seller">Seller Center</Link>
                        <Link to="/contact">Contact Us</Link>
                    </div>

                </div>

                <div className="marketplace-footer-bottom">
                    <span>© 2026 Nila Fashion. All rights reserved.</span>
                    <span>Secure checkout • M-Pesa supported</span>
                </div>
            </footer>

        </div>
    );
}

export default Home;
