import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

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
                console.error(
                    "Failed to load marketplace:",
                    err
                );

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
       HELPERS
    ========================================================= */

    const getImageUrl = (image) => {
        if (!image) return "";

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        const apiBase =
            api.defaults.baseURL ||
            "http://127.0.0.1:8000/api/v1";

        const backendBase = apiBase.replace(
            "/api/v1",
            ""
        );

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

    const getCategoryImage = (category) => {
        return getImageUrl(category?.image || "");
    };

    const getProductPrice = (product) => {
        return (
            product.current_price ??
            product.discount_price ??
            product.price ??
            0
        );
    };

    const getOriginalPrice = (product) => {
        return product.price ?? 0;
    };

    const hasDiscount = (product) => {
        const current = Number(
            getProductPrice(product)
        );

        const original = Number(
            getOriginalPrice(product)
        );

        return original > current;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(Number(price || 0));
    };

    const isFeatured = (product) => {
        return (
            product.featured === true ||
            product.featured === "true"
        );
    };

    const isNewArrival = (product) => {
        return (
            product.new_arrival === true ||
            product.new_arrival === "true"
        );
    };

    const discountedProducts = useMemo(() => {
        return products
            .filter((product) => hasDiscount(product))
            .slice(0, 8);
    }, [products]);

    const featuredProducts = useMemo(() => {
        const featured = products.filter(isFeatured);

        if (featured.length > 0) {
            return featured.slice(0, 8);
        }

        return products.slice(0, 8);
    }, [products]);

    const newArrivals = useMemo(() => {
        const arrivals = products.filter(isNewArrival);

        if (arrivals.length > 0) {
            return arrivals.slice(0, 8);
        }

        return [...products]
            .sort((a, b) => {
                const dateA = new Date(
                    a.created_at || 0
                ).getTime();

                const dateB = new Date(
                    b.created_at || 0
                ).getTime();

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

        navigate(
            `/search?q=${encodeURIComponent(value)}`
        );
    };

    /* =========================================================
       PRODUCT CARD
    ========================================================= */

    const ProductCard = ({ product }) => {
        const image = getProductImage(product);

        return (
            <Link
                to={`/products/${product.id}`}
                className="marketplace-product-card"
            >
                <div className="product-image">

                    {hasDiscount(product) && (
                        <span className="product-sale">
                            SALE
                        </span>
                    )}

                    {isNewArrival(product) && (
                        <span className="product-new">
                            NEW
                        </span>
                    )}

                    {image ? (
                        <img
                            src={image}
                            alt={
                                product.name ||
                                "Clothing product"
                            }
                            loading="lazy"
                        />
                    ) : (
                        <div className="product-image-placeholder">
                            <span>
                                {product.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "C"}
                            </span>
                        </div>
                    )}
                </div>

                <div className="product-card-content">

                    <span className="product-brand">
                        {product.brand || "Fashion"}
                    </span>

                    <h3>
                        {product.name}
                    </h3>

                    <div className="product-rating">
                        <span>★</span>

                        <span>
                            {product.rating ?? "0.0"}
                        </span>

                        <small>
                            (
                            {product.review_count ?? 0}
                            )
                        </small>
                    </div>

                    <div className="product-price">

                        <strong>
                            {formatPrice(
                                getProductPrice(product)
                            )}
                        </strong>

                        {hasDiscount(product) && (
                            <del>
                                {formatPrice(
                                    getOriginalPrice(
                                        product
                                    )
                                )}
                            </del>
                        )}

                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="marketplace">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="marketplace-header">
                <div className="marketplace-header-inner">

                    <Link to="/" className="marketplace-logo">
    <span className="marketplace-logo-mark">
        NF
    </span>
    <span>
        Nila
        <strong>
            Fashion
        </strong>
    </span>
</Link>


                    <form
                        className="marketplace-search"
                        onSubmit={handleSearch}
                    >
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search products, brands and more..."
                        />

                        <button type="submit">
                            Search
                        </button>
                    </form>

                    <div className="marketplace-header-actions">

                        <Link to="/wishlist">
                            Wishlist
                        </Link>

                        <Link to="/cart">
                            Cart
                        </Link>

                        <Link
                            to="/login"
                            className="marketplace-login"
                        >
                            Sign In
                        </Link>

                    </div>
                </div>
            </header>


            {/* =====================================================
                NAVIGATION
            ====================================================== */}

            <nav className="marketplace-nav">
                <div className="marketplace-nav-inner">

                    <Link
                        to="/"
                        className="active"
                    >
                        Home
                    </Link>

                    <Link to="/products">
                        All Products
                    </Link>

                    <Link to="/categories">
                        Categories
                    </Link>

                    <Link to="/stores">
                        Stores
                    </Link>

                    <Link to="/products?new=true">
                        New Arrivals
                    </Link>

                    <Link to="/products?featured=true">
                        Featured
                    </Link>

                    <Link to="/products?sale=true">
                        Deals
                    </Link>

                </div>
            </nav>


            {/* =====================================================
                HERO
            ====================================================== */}

            <main>

                <section className="marketplace-hero">

                    <div className="marketplace-hero-content">

                        <span className="hero-eyebrow">
                            THE MODERN CLOTHING MARKETPLACE
                        </span>

                        <h1>
                            Discover your style.
                            <br />
                            <span>
                                Shop with confidence.
                            </span>
                        </h1>

                        <p>
                            Discover fashion from sellers
                            across the marketplace. Find
                            the styles you love, compare
                            products and shop securely.
                        </p>

                        <div className="hero-actions">

                            <Link
                                to="/products"
                                className="hero-primary-btn"
                            >
                                Start Shopping
                            </Link>

                            <Link
                                to="/categories"
                                className="hero-secondary-btn"
                            >
                                Explore Categories
                            </Link>

                        </div>

                        <div className="hero-trust">

                            <div>
                                <strong>
                                    {products.length > 0
                                        ? `${products.length}+`
                                        : "1000+"}
                                </strong>

                                <span>
                                    Products
                                </span>
                            </div>

                            <div>
                                <strong>
                                    {categories.length > 0
                                        ? `${categories.length}+`
                                        : "20+"}
                                </strong>

                                <span>
                                    Categories
                                </span>
                            </div>

                            <div>
                                <strong>
                                    24/7
                                </strong>

                                <span>
                                    Marketplace
                                </span>
                            </div>

                        </div>

                    </div>


                    {/* HERO VISUAL */}

                    <div className="marketplace-hero-visual">

                        {products[0] && (
                            <Link
                                to={`/products/${products[0].id}`}
                                className="hero-fashion-card hero-card-one"
                            >
                                <span>
                                    FEATURED
                                </span>

                                {getProductImage(
                                    products[0]
                                ) ? (
                                    <img
                                        src={getProductImage(
                                            products[0]
                                        )}
                                        alt={
                                            products[0].name
                                        }
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
                                {getProductImage(
                                    products[1]
                                ) ? (
                                    <img
                                        src={getProductImage(
                                            products[1]
                                        )}
                                        alt={
                                            products[1].name
                                        }
                                    />
                                ) : (
                                    <div className="fashion-placeholder">
                                        Style
                                    </div>
                                )}
                            </Link>
                        )}

                        <div className="hero-floating-card">

                            <span>
                                SECURE SHOPPING
                            </span>

                            <strong>
                                Pay securely with M-Pesa
                            </strong>

                            <small>
                                Fast and convenient
                                payments at checkout.
                            </small>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    PAYMENT / TRUST STRIP
                ================================================== */}

                <section className="marketplace-trust-strip">

                    <div className="trust-item">

                        <div className="trust-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                Secure Shopping
                            </strong>

                            <span>
                                Shop with confidence
                            </span>
                        </div>

                    </div>

                    <div className="trust-item">

                        <div className="trust-icon">
                            KSh
                        </div>

                        <div>
                            <strong>
                                M-Pesa Payments
                            </strong>

                            <span>
                                Convenient checkout
                            </span>
                        </div>

                    </div>

                    <div className="trust-item">

                        <div className="trust-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                Trusted Sellers
                            </strong>

                            <span>
                                Discover marketplace stores
                            </span>
                        </div>

                    </div>

                    <div className="trust-item">

                        <div className="trust-icon">
                            →
                        </div>

                        <div>
                            <strong>
                                Fast Ordering
                            </strong>

                            <span>
                                Simple checkout experience
                            </span>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    CATEGORIES
                ================================================== */}

                <section className="marketplace-section">

                    <div className="section-heading">

                        <div>

                            <span className="section-eyebrow">
                                EXPLORE
                            </span>

                            <h2>
                                Shop by category
                            </h2>

                            <p>
                                Find fashion that fits your
                                style.
                            </p>

                        </div>

                        <Link to="/categories">
                            View all →
                        </Link>

                    </div>


                    {loading ? (

                        <div className="marketplace-loading">
                            Loading categories...
                        </div>

                    ) : categories.length === 0 ? (

                        <div className="marketplace-empty">
                            Categories will appear here
                            once they are added from the
                            admin dashboard.
                        </div>

                    ) : (

                        <div className="category-grid">

                            {categories
                                .filter(
                                    (category) =>
                                        category.is_active !==
                                            false
                                )
                                .slice(0, 8)
                                .map((category) => {

                                    const image =
                                        getCategoryImage(
                                            category
                                        );

                                    return (
                                        <Link
                                            key={
                                                category.id
                                            }
                                            to={`/categories/${category.slug || category.id}`}
                                            className="category-card"
                                        >

                                            <div className="category-image">

                                                {image ? (

                                                    <img
                                                        src={image}
                                                        alt={
                                                            category.name
                                                        }
                                                        loading="lazy"
                                                    />

                                                ) : (

                                                    <span>
                                                        {category.name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                            "C"}
                                                    </span>

                                                )}

                                            </div>

                                            <div className="category-card-content">

                                                <h3>
                                                    {
                                                        category.name
                                                    }
                                                </h3>

                                                <span>
                                                    Shop now →
                                                </span>

                                            </div>

                                        </Link>
                                    );
                                })}

                        </div>

                    )}

                </section>


                {/* =================================================
                    FEATURED PRODUCTS
                ================================================== */}

                <section className="marketplace-section">

                    <div className="section-heading">

                        <div>

                            <span className="section-eyebrow">
                                HANDPICKED
                            </span>

                            <h2>
                                Featured products
                            </h2>

                            <p>
                                Discover products selected
                                for the marketplace.
                            </p>

                        </div>

                        <Link to="/products?featured=true">
                            View all →
                        </Link>

                    </div>


                    {loading ? (

                        <div className="marketplace-loading">
                            Loading products...
                        </div>

                    ) : featuredProducts.length === 0 ? (

                        <div className="marketplace-empty">
                            Products will appear here once
                            sellers add them through the
                            marketplace.
                        </div>

                    ) : (

                        <div className="product-grid">

                            {featuredProducts.map(
                                (product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    NEW ARRIVALS
                ================================================== */}

                {newArrivals.length > 0 && (
                    <section className="marketplace-section">

                        <div className="section-heading">

                            <div>

                                <span className="section-eyebrow">
                                    JUST IN
                                </span>

                                <h2>
                                    New arrivals
                                </h2>

                                <p>
                                    Fresh styles recently
                                    added to the marketplace.
                                </p>

                            </div>

                            <Link to="/products?new=true">
                                Explore new arrivals →
                            </Link>

                        </div>

                        <div className="product-grid">

                            {newArrivals.map(
                                (product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                )
                            )}

                        </div>

                    </section>
                )}


                {/* =================================================
                    DEALS
                ================================================== */}

                {discountedProducts.length > 0 && (
                    <section className="marketplace-section marketplace-deals-section">

                        <div className="section-heading">

                            <div>

                                <span className="section-eyebrow">
                                    SPECIAL OFFERS
                                </span>

                                <h2>
                                    Deals worth checking out
                                </h2>

                                <p>
                                    Save more on selected
                                    marketplace products.
                                </p>

                            </div>

                            <Link to="/products?sale=true">
                                View all deals →
                            </Link>

                        </div>

                        <div className="product-grid">

                            {discountedProducts.map(
                                (product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                )
                            )}

                        </div>

                    </section>
                )}


                {/* =================================================
                    SELLER CTA
                ================================================== */}

                <section className="seller-cta">

                    <div>

                        <span className="section-eyebrow">
                            SELL ON OUR MARKETPLACE
                        </span>

                        <h2>
                            Turn your products
                            into a business.
                        </h2>

                        <p>
                            Create your store, add your
                            products and connect with
                            customers looking for fashion.
                        </p>

                    </div>

                    <Link
                        to="/sell"
                        className="seller-cta-button"
                    >
                        Become a Seller →
                    </Link>

                </section>


                {/* =================================================
                    M-PESA PAYMENT SECTION
                ================================================== */}

                <section className="mpesa-home-section">

                    <div className="mpesa-home-content">

                        <span className="section-eyebrow">
                            SIMPLE & SECURE CHECKOUT
                        </span>

                        <h2>
                            Shop now. Pay with M-Pesa.
                        </h2>

                        <p>
                            Add your favourite products
                            to your cart and complete your
                            order using M-Pesa directly
                            from checkout.
                        </p>

                        <Link
                            to="/products"
                            className="mpesa-home-button"
                        >
                            Start Shopping →
                        </Link>

                    </div>

                    <div className="mpesa-home-card">

                        <div className="mpesa-badge">
                            M-PESA
                        </div>

                        <strong>
                            Secure payment
                        </strong>

                        <span>
                            Your payment request is sent
                            directly to your phone at
                            checkout.
                        </span>

                    </div>

                </section>

            </main>


            {/* =====================================================
                FOOTER
            ====================================================== */}

            <footer className="marketplace-footer">

                <div className="marketplace-footer-grid">

                    <div>

                        <Link
                            to="/"
                            className="marketplace-logo footer-logo"
                        >

                            <span className="marketplace-logo-mark">
                                CM
                            </span>

                            <span>
                                Clothing
                                <strong>
                                    Marketplace
                                </strong>
                            </span>

                        </Link>

                        <p>
                            A modern marketplace for
                            discovering clothing,
                            fashion and trusted sellers.
                        </p>

                    </div>


                    <div>

                        <h3>
                            Marketplace
                        </h3>

                        <Link to="/products">
                            Products
                        </Link>

                        <Link to="/categories">
                            Categories
                        </Link>

                        <Link to="/stores">
                            Stores
                        </Link>

                        <Link to="/search">
                            Search
                        </Link>

                    </div>


                    <div>

                        <h3>
                            Customer
                        </h3>

                        <Link to="/cart">
                            Cart
                        </Link>

                        <Link to="/wishlist">
                            Wishlist
                        </Link>

                        <Link to="/orders">
                            My Orders
                        </Link>

                        <Link to="/profile">
                            My Profile
                        </Link>

                    </div>


                    <div>

                        <h3>
                            Sell
                        </h3>

                        <Link to="/sell">
                            Become a Seller
                        </Link>

                        <Link to="/seller">
                            Seller Center
                        </Link>

                        <Link to="/contact">
                            Contact Us
                        </Link>

                    </div>

                </div>


                <div className="marketplace-footer-bottom">

                    <span>
                        © 2026 Clothing Marketplace.
                        All rights reserved.
                    </span>

                    <span>
                        Secure checkout • M-Pesa
                        supported
                    </span>

                </div>

            </footer>

        </div>
    );
}

export default Home;
