import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

const IconSearch = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
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

    const name = product.name || "Product";

    return (
        <Link
            to={`/products/${product.id}`}
            className="marketplace-product-card nf-product-card nf-category-product-card"
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
                {product.brand && (
                    <span className="product-brand">{product.brand}</span>
                )}

                <h3>{name}</h3>

                {product.rating !== undefined && product.rating !== null && (
                    <div
                        className="product-rating"
                        aria-label={`Rated ${product.rating} out of 5`}
                    >
                        <span aria-hidden="true">★</span>
                        <span>{Number(product.rating).toFixed(1)}</span>
                        {product.review_count != null && (
                            <small>({product.review_count})</small>
                        )}
                    </div>
                )}

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
   CATEGORY PRODUCTS
========================================================= */

export default function CategoryProducts() {
    const { slug } = useParams();

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCategory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    async function loadCategory() {
        try {
            setLoading(true);
            setError("");

            const categoryResponse = await api.get(`/categories/${slug}/`);
            const categoryData = categoryResponse.data;

            setCategory(categoryData);

            const productResponse = await api.get(
                `/products/?category=${categoryData.id}&page_size=100`
            );

            setProducts(getProducts(productResponse.data));
        } catch (err) {
            console.error(err);

            setError(
                err.response?.status === 404
                    ? "Category not found."
                    : "Unable to load category."
            );
        } finally {
            setLoading(false);
        }
    }

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <Header />
                <main className="nf-catproducts-main">
                    <div className="nf-catproducts-skeleton">
                        <div className="nf-skeleton-hero" />
                        <div className="nf-products-skeleton">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div className="nf-skeleton-card" key={i}>
                                    <div className="nf-skeleton-image" />
                                    <div className="nf-skeleton-line" />
                                    <div className="nf-skeleton-line short" />
                                    <div className="nf-skeleton-line tiny" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {
        return (
            <div className="marketplace">
                <Header />

                <nav className="marketplace-nav" aria-label="Primary">
                    <div className="marketplace-nav-inner">
                        <Link to="/">Home</Link>
                        <Link to="/products">All Products</Link>
                        <Link to="/categories" className="active">Categories</Link>
                        <Link to="/stores">Stores</Link>
                    </div>
                </nav>

                <main className="nf-catproducts-main">
                    <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/">Home</Link>
                        <span aria-hidden="true">/</span>
                        <Link to="/categories">Categories</Link>
                        <span aria-hidden="true">/</span>
                        <span>{slug}</span>
                    </nav>

                    <div className="nf-catproducts-empty" role="alert">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconSearch />
                        </div>
                        <h2>{error}</h2>
                        <p>
                            The category you're looking for is unavailable or
                            may have been removed.
                        </p>
                        <div className="nf-empty-actions">
                            <Link to="/categories" className="nf-btn-primary">
                                Browse Categories <IconArrow />
                            </Link>
                            <Link to="/products" className="nf-btn-ghost">
                                View All Products
                            </Link>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    /* =========================================================
       MAIN
    ========================================================= */

    return (
        <div className="marketplace">
            <Header />

            <nav className="marketplace-nav" aria-label="Primary">
                <div className="marketplace-nav-inner">
                    <Link to="/">Home</Link>
                    <Link to="/products">All Products</Link>
                    <Link to="/categories" className="active">Categories</Link>
                    <Link to="/stores">Stores</Link>
                    <Link to="/products?new=true">New Arrivals</Link>
                    <Link to="/products?featured=true">Featured</Link>
                    <Link to="/products?sale=true">Deals</Link>
                </div>
            </nav>

            <main className="nf-catproducts-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link to="/categories">Categories</Link>
                    <span aria-hidden="true">/</span>
                    <span>{category?.name || "Category"}</span>
                </nav>

                {/* ---- Hero ---- */}
                <section
                    className="nf-catproducts-hero"
                    aria-labelledby="nf-catproducts-title"
                >
                    {category?.image && (
                        <>
                            <div
                                className="nf-catproducts-hero-bg"
                                style={{
                                    backgroundImage: `url(${imageUrl(category.image)})`,
                                }}
                                aria-hidden="true"
                            />
                            <div className="nf-catproducts-hero-overlay" aria-hidden="true" />
                        </>
                    )}

                    <div className="nf-catproducts-hero-inner">
                        <div>
                            <span className="section-eyebrow">CATEGORY</span>
                            <h1 id="nf-catproducts-title">
                                {category.name}
                            </h1>
                            <p>
                                {category.description ||
                                    `Explore products in ${category.name}.`}
                            </p>
                        </div>

                        <div className="nf-catproducts-count" aria-live="polite">
                            <strong>{products.length}</strong>
                            <span>
                                product{products.length === 1 ? "" : "s"}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ---- Products / empty ---- */}
                {products.length === 0 ? (
                    <section className="nf-catproducts-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconSearch />
                        </div>
                        <h2>No products available</h2>
                        <p>
                            This category currently has no products. Check back
                            soon or browse other categories.
                        </p>
                        <div className="nf-empty-actions">
                            <Link to="/categories" className="nf-btn-primary">
                                Browse Categories <IconArrow />
                            </Link>
                            <Link to="/products" className="nf-btn-ghost">
                                View All Products
                            </Link>
                        </div>
                    </section>
                ) : (
                    <section
                        className="nf-catproducts-grid"
                        aria-label={`Products in ${category.name}`}
                    >
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}

/* =========================================================
   HEADER (local)
========================================================= */

function Header() {
    return (
        <header className="marketplace-header">
            <div className="marketplace-header-inner">
                <Link to="/" className="marketplace-logo" aria-label="Nila Fashion home">
                    <span className="marketplace-logo-mark">NF</span>
                    <span>Nila<strong>Fashion</strong></span>
                </Link>

                <form
                    className="marketplace-search"
                    role="search"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <label htmlFor="catp-search" className="nf-visually-hidden">
                        Search products
                    </label>
                    <input
                        id="catp-search"
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
                        A modern marketplace connecting customers with trusted
                        clothing sellers.
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
