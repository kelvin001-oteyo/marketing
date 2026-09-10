import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const getArray = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    };

    useEffect(() => {
        const loadMarketplace = async () => {
            try {
                const [productsResponse, categoriesResponse] =
                    await Promise.all([
                        api.get("/products/"),
                        api.get("/categories/"),
                    ]);

                setProducts(getArray(productsResponse.data));
                setCategories(getArray(categoriesResponse.data));
            } catch (error) {
                console.error(
                    "Failed to load marketplace:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        loadMarketplace();
    }, []);

    const getProductImage = (product) => {
        return (
            product.image ||
            product.thumbnail ||
            product.main_image ||
            product.images?.[0]?.image ||
            product.product_images?.[0]?.image ||
            ""
        );
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
        const price = Number(getProductPrice(product));
        const original = Number(getOriginalPrice(product));

        return original > price;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(Number(price || 0));
    };

    return (
        <div className="marketplace">

            {/* Header */}
            <header className="marketplace-header">
                <div className="marketplace-header-inner">

                    <Link
                        to="/"
                        className="marketplace-logo"
                    >
                        <span className="marketplace-logo-mark">
                            CM
                        </span>

                        <span>
                            Clothing
                            <strong>Marketplace</strong>
                        </span>
                    </Link>

                    <div className="marketplace-search">
                        <input
                            type="text"
                            placeholder="Search for products, brands and more..."
                        />

                        <button type="button">
                            Search
                        </button>
                    </div>

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

            {/* Navigation */}
            <nav className="marketplace-nav">
                <div className="marketplace-nav-inner">

                    <Link to="/">
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

            {/* Hero */}
            <main>

                <section className="marketplace-hero">
                    <div className="marketplace-hero-content">

                        <span className="hero-eyebrow">
                            THE NEW WAY TO SHOP FASHION
                        </span>

                        <h1>
                            Discover fashion.
                            <br />
                            <span>Buy with confidence.</span>
                        </h1>

                        <p>
                            Discover clothing from trusted sellers,
                            explore new styles and find products that
                            match your personality.
                        </p>

                        <div className="hero-actions">
                            <Link
                                to="/products"
                                className="hero-primary-btn"
                            >
                                Explore Products
                            </Link>

                            <Link
                                to="/categories"
                                className="hero-secondary-btn"
                            >
                                Browse Categories
                            </Link>
                        </div>

                        <div className="hero-trust">
                            <div>
                                <strong>1000+</strong>
                                <span>Products</span>
                            </div>

                            <div>
                                <strong>100+</strong>
                                <span>Trusted Sellers</span>
                            </div>

                            <div>
                                <strong>24/7</strong>
                                <span>Marketplace</span>
                            </div>
                        </div>
                    </div>

                    <div className="marketplace-hero-visual">
                        <div className="hero-fashion-card hero-card-one">
                            <span>NEW</span>
                            <div className="fashion-placeholder">
                                Fashion
                            </div>
                        </div>

                        <div className="hero-fashion-card hero-card-two">
                            <div className="fashion-placeholder">
                                Style
                            </div>
                        </div>

                        <div className="hero-floating-card">
                            <span>Trending now</span>
                            <strong>Explore the latest styles</strong>
                        </div>
                    </div>
                </section>

                {/* Categories */}
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
                                Find exactly what you're looking for.
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
                            Categories will appear here once they are
                            added from the admin dashboard.
                        </div>
                    ) : (
                        <div className="category-grid">
                            {categories.slice(0, 8).map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/products?category=${category.id}`}
                                    className="category-card"
                                >
                                    <div className="category-image">
                                        {category.image ? (
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                            />
                                        ) : (
                                            <span>
                                                {category.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="category-card-content">
                                        <h3>
                                            {category.name}
                                        </h3>

                                        <span>
                                            Shop now →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Featured Products */}
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
                                Products selected by our marketplace.
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
                    ) : products.length === 0 ? (
                        <div className="marketplace-empty">
                            No products available yet. Add products
                            from the admin dashboard.
                        </div>
                    ) : (
                        <div className="product-grid">
                            {products
                                .filter(
                                    (product) =>
                                        product.featured === true ||
                                        product.featured === "true"
                                )
                                .slice(0, 8)
                                .map((product) => {
                                    const image =
                                        getProductImage(product);

                                    return (
                                        <Link
                                            key={product.id}
                                            to={`/products/${product.id}`}
                                            className="marketplace-product-card"
                                        >
                                            <div className="product-image">

                                                {hasDiscount(product) && (
                                                    <span className="product-sale">
                                                        SALE
                                                    </span>
                                                )}

                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={
                                                            product.name
                                                        }
                                                    />
                                                ) : (
                                                    <div className="product-image-placeholder">
                                                        <span>
                                                            {product.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="product-card-content">

                                                <span className="product-brand">
                                                    {product.brand ||
                                                        "Fashion"}
                                                </span>

                                                <h3>
                                                    {product.name}
                                                </h3>

                                                <div className="product-rating">
                                                    <span>
                                                        ★
                                                    </span>

                                                    <span>
                                                        {product.rating ??
                                                            "0.0"}
                                                    </span>

                                                    <small>
                                                        (
                                                        {product.review_count ??
                                                            0}
                                                        )
                                                    </small>
                                                </div>

                                                <div className="product-price">
                                                    <strong>
                                                        {formatPrice(
                                                            getProductPrice(
                                                                product
                                                            )
                                                        )}
                                                    </strong>

                                                    {hasDiscount(
                                                        product
                                                    ) && (
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
                                })}
                        </div>
                    )}
                </section>

                {/* Seller CTA */}
                <section className="seller-cta">

                    <div>
                        <span className="section-eyebrow">
                            SELL ON OUR MARKETPLACE
                        </span>

                        <h2>
                            Have products to sell?
                        </h2>

                        <p>
                            Join our marketplace and connect your
                            products with customers looking for
                            great fashion.
                        </p>
                    </div>

                    <Link
                        to="/sell"
                        className="seller-cta-button"
                    >
                        Become a Seller →
                    </Link>
                </section>

            </main>

            {/* Footer */}
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
                                <strong>Marketplace</strong>
                            </span>
                        </Link>

                        <p>
                            Your destination for discovering
                            clothing, fashion and trusted sellers.
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
                    </div>

                </div>

                <div className="marketplace-footer-bottom">
                    <span>
                        © 2026 Clothing Marketplace. All rights
                        reserved.
                    </span>

                    <span>
                        Built for modern fashion commerce.
                    </span>
                </div>

            </footer>
        </div>
    );
}

export default Home;