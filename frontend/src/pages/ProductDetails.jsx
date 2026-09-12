import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=80";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconHeart = ({ filled = false }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
);

const IconCart = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
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

const IconStore = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v11H3z" />
        <path d="M9 20v-6h6v6" />
    </svg>
);

const IconTruck = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h11v9H3z" />
        <path d="M14 9h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

/* =========================================================
   PRODUCT DETAILS
========================================================= */

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState("");
    const [addingToCart, setAddingToCart] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [toast, setToast] = useState(null); // { type: "success"|"error"|"info", message }

    /* ---------- toast auto-dismiss ---------- */
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        fetchProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/products/${id}/`);
            const data = response.data;

            setProduct(data);

            const firstImage =
                data.images?.[0]?.image || data.image || FALLBACK_IMAGE;

            setActiveImage(firstImage);

            if (data.category) {
                try {
                    const relatedResponse = await api.get(
                        `/products/?category=${data.category}&page_size=8`
                    );
                    const relatedData = relatedResponse.data;

                    const list = Array.isArray(relatedData)
                        ? relatedData
                        : relatedData.results || [];

                    setRelatedProducts(
                        list.filter((item) => String(item.id) !== String(data.id))
                    );
                } catch {
                    setRelatedProducts([]);
                }
            }
        } catch (err) {
            console.error("Failed to load product:", err);
            setError(
                err.response?.data?.detail || "Unable to load this product."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------- derived (unchanged) ---------- */

    const images = useMemo(() => {
        if (!product) return [];
        if (product.images?.length) return product.images.map((i) => i.image);
        if (product.image) return [product.image];
        return [FALLBACK_IMAGE];
    }, [product]);

    const variants = product?.variants || [];

    const sizes = useMemo(
        () => [...new Set(variants.map((v) => v.size).filter(Boolean))],
        [variants]
    );

    const colors = useMemo(
        () => [...new Set(variants.map((v) => v.color).filter(Boolean))],
        [variants]
    );

    const selectedVariant = useMemo(() => {
        if (!variants.length) return null;
        return (
            variants.find((variant) => {
                const sizeMatches = !selectedSize || variant.size === selectedSize;
                const colorMatches = !selectedColor || variant.color === selectedColor;
                return sizeMatches && colorMatches;
            }) || null
        );
    }, [variants, selectedSize, selectedColor]);

    const currentPrice =
        selectedVariant?.current_price ??
        selectedVariant?.price ??
        product?.current_price ??
        product?.discount_price ??
        product?.price ??
        0;

    const originalPrice =
        selectedVariant?.original_price ?? product?.price ?? currentPrice;

    const discountPercentage =
        originalPrice > currentPrice
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0;

    const availableStock =
        selectedVariant?.stock_quantity ?? product?.stock_quantity ?? 0;

    const isOutOfStock =
        product?.status === "OUT_OF_STOCK" ||
        (variants.length > 0 && availableStock <= 0);

    const formatPrice = (value) =>
        new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(Number(value || 0));

    const productImageFor = (item) =>
        item?.images?.[0]?.image || item?.image || FALLBACK_IMAGE;

    /* ---------- actions ---------- */

    const handleQuantityChange = (amount) => {
        setQuantity((current) => {
            const next = current + amount;
            if (next < 1) return 1;
            if (availableStock > 0 && next > availableStock) return availableStock;
            return next;
        });
    };

    const handleAddToCart = async () => {
        if (isOutOfStock) return;

        try {
            setAddingToCart(true);

            const payload = { product_id: product.id, quantity };
            if (selectedVariant?.id) payload.variant_id = selectedVariant.id;

            await api.post("/cart/items/", payload);

            setToast({
                type: "success",
                message: "Product added to cart successfully.",
            });
        } catch (err) {
            console.error("Add to cart failed:", err);

            if (err.response?.status === 401) {
                setToast({
                    type: "error",
                    message: "Please sign in before adding products to your cart.",
                });
                return;
            }

            setToast({
                type: "error",
                message:
                    err.response?.data?.detail ||
                    "Unable to add this product to cart.",
            });
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (isOutOfStock) return;

        try {
            setAddingToCart(true);

            const payload = { product_id: product.id, quantity };
            if (selectedVariant?.id) payload.variant_id = selectedVariant.id;

            await api.post("/cart/items/", payload);
            navigate("/checkout");
        } catch (err) {
            console.error("Buy now failed:", err);

            if (err.response?.status === 401) {
                setToast({
                    type: "error",
                    message: "Please sign in before purchasing this product.",
                });
                return;
            }

            setToast({
                type: "error",
                message:
                    err.response?.data?.detail ||
                    "Unable to continue with this purchase.",
            });
        } finally {
            setAddingToCart(false);
        }
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <Header minimal />
                <main className="nf-pd-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading product…</p>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error || !product) {
        return (
            <div className="marketplace">
                <Header minimal />

                <main className="nf-pd-main">
                    <div className="nf-pd-empty" role="alert">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconWarning />
                        </div>
                        <h2>Product unavailable</h2>
                        <p>{error || "Product not found."}</p>
                        <div className="nf-empty-actions">
                            <Link to="/products" className="nf-btn-primary">
                                Back to products
                            </Link>
                            <Link to="/" className="nf-btn-ghost">
                                Go home
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

    const rating = Number(product.rating || 0);
    const reviewCount = Number(product.review_count || 0);

    return (
        <div className="marketplace">
            <Header />

            <main className="nf-pd-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link to="/products">Products</Link>
                    <span aria-hidden="true">/</span>
                    <span>{product.name}</span>
                </nav>

                {/* ---- Two-column layout ---- */}
                <section className="nf-pd-layout">

                    {/* ============ GALLERY ============ */}
                    <div className="nf-pd-gallery">
                        <div className="nf-pd-main-image">
                            <img
                                src={activeImage}
                                alt={product.name}
                            />

                            {discountPercentage > 0 && (
                                <span className="nf-pd-discount">
                                    -{discountPercentage}%
                                </span>
                            )}

                            <button
                                type="button"
                                className={`nf-pd-wishlist ${wishlisted ? "is-on" : ""}`}
                                onClick={() => setWishlisted((v) => !v)}
                                aria-label={
                                    wishlisted
                                        ? "Remove from wishlist"
                                        : "Add to wishlist"
                                }
                                aria-pressed={wishlisted}
                            >
                                <IconHeart filled={wishlisted} />
                            </button>
                        </div>

                        {images.length > 1 && (
                            <div className="nf-pd-thumbs" role="tablist" aria-label="Product images">
                                {images.map((image, index) => (
                                    <button
                                        key={`${image}-${index}`}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeImage === image}
                                        className={`nf-pd-thumb ${activeImage === image ? "is-active" : ""}`}
                                        onClick={() => setActiveImage(image)}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} view ${index + 1}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ============ INFO ============ */}
                    <div className="nf-pd-info">
                        <span className="nf-pd-brand">
                            {product.brand || "Nila Fashion"}
                        </span>

                        <h1>{product.name}</h1>

                        <div
                            className="nf-pd-rating"
                            aria-label={`Rated ${rating} out of 5 from ${reviewCount} reviews`}
                        >
                            <span className="nf-pd-stars" aria-hidden="true">
                                {"★".repeat(5)}
                            </span>
                            <span className="nf-pd-rating-value">
                                {rating.toFixed(1)}
                            </span>
                            <span className="nf-pd-rating-sep">·</span>
                            <span className="nf-pd-rating-count">
                                {reviewCount} review{reviewCount === 1 ? "" : "s"}
                            </span>
                        </div>

                        {/* ---- Price block ---- */}
                        <div className="nf-pd-price">
                            <span className="nf-pd-price-current">
                                {formatPrice(currentPrice)}
                            </span>

                            {Number(originalPrice) > Number(currentPrice) && (
                                <span className="nf-pd-price-original">
                                    {formatPrice(originalPrice)}
                                </span>
                            )}

                            {discountPercentage > 0 && (
                                <span className="nf-pd-price-save">
                                    Save {discountPercentage}%
                                </span>
                            )}
                        </div>

                        {/* ---- Description ---- */}
                        <div className="nf-pd-desc">
                            <h2>About this product</h2>
                            <p>
                                {product.description ||
                                    "High-quality clothing item available from our marketplace seller."}
                            </p>
                        </div>

                        {/* ---- Size ---- */}
                        {sizes.length > 0 && (
                            <div className="nf-pd-option">
                                <div className="nf-pd-option-head">
                                    <strong>Size</strong>
                                    <span>{selectedSize || "Select size"}</span>
                                </div>
                                <div className="nf-pd-option-list">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            className={`nf-pd-chip ${selectedSize === size ? "is-selected" : ""}`}
                                            onClick={() => setSelectedSize(size)}
                                            aria-pressed={selectedSize === size}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ---- Color ---- */}
                        {colors.length > 0 && (
                            <div className="nf-pd-option">
                                <div className="nf-pd-option-head">
                                    <strong>Color</strong>
                                    <span>{selectedColor || "Select color"}</span>
                                </div>
                                <div className="nf-pd-option-list">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`nf-pd-chip ${selectedColor === color ? "is-selected" : ""}`}
                                            onClick={() => setSelectedColor(color)}
                                            aria-pressed={selectedColor === color}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ---- Stock ---- */}
                        <div className="nf-pd-stock" aria-live="polite">
                            {isOutOfStock ? (
                                <span className="nf-stock-badge is-out">
                                    <IconWarning /> Out of stock
                                </span>
                            ) : availableStock > 0 && availableStock <= 10 ? (
                                <span className="nf-stock-badge is-low">
                                    Only {availableStock} left in stock
                                </span>
                            ) : (
                                <span className="nf-stock-badge is-in">
                                    <IconCheck /> In stock
                                </span>
                            )}
                        </div>

                        {/* ---- Purchase row ---- */}
                        <div className="nf-pd-purchase">
                            <div className="nf-pd-qty" role="group" aria-label="Quantity">
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                <span aria-live="polite">{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={availableStock > 0 && quantity >= availableStock}
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>

                            <div className="nf-pd-actions">
                                <button
                                    type="button"
                                    className="nf-pd-btn nf-pd-btn-primary"
                                    disabled={isOutOfStock || addingToCart}
                                    onClick={handleBuyNow}
                                >
                                    {addingToCart ? "Processing…" : "Buy Now"}
                                </button>

                                <button
                                    type="button"
                                    className="nf-pd-btn nf-pd-btn-outline"
                                    disabled={isOutOfStock || addingToCart}
                                    onClick={handleAddToCart}
                                >
                                    <IconCart />
                                    {addingToCart ? "Adding…" : "Add to Cart"}
                                </button>
                            </div>
                        </div>

                        {/* ---- Trust badges ---- */}
                        <ul className="nf-pd-trust">
                            <li>
                                <IconTruck /> Fast nationwide delivery
                            </li>
                            <li>
                                <IconShield /> Secure M-Pesa checkout
                            </li>
                            <li>
                                <IconStore /> Sold by verified sellers
                            </li>
                        </ul>

                        {/* ---- Seller card ---- */}
                        <div className="nf-pd-seller">
                            <div className="nf-pd-seller-avatar" aria-hidden="true">
                                {(
                                    product.seller_name ||
                                    product.seller?.store_name ||
                                    "S"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="nf-pd-seller-info">
                                <span>Sold by</span>
                                <strong>
                                    {product.seller_name ||
                                        product.seller?.store_name ||
                                        "Marketplace Seller"}
                                </strong>
                                <small>
                                    {product.seller_location ||
                                        product.seller?.location ||
                                        "Kenya"}
                                </small>
                            </div>

                            <Link
                                to={
                                    product.seller_slug
                                        ? `/stores/${product.seller_slug}`
                                        : "/stores"
                                }
                                className="nf-pd-seller-link"
                            >
                                View Store <IconArrow />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ---- Information grid ---- */}
                <section className="nf-pd-section" aria-labelledby="nf-pd-info-title">
                    <header className="nf-pd-section-head">
                        <h2 id="nf-pd-info-title">Product information</h2>
                    </header>

                    <div className="nf-pd-info-grid">
                        <div>
                            <span>Brand</span>
                            <strong>{product.brand || "Not specified"}</strong>
                        </div>
                        <div>
                            <span>Category</span>
                            <strong>
                                {product.category_name ||
                                    product.category?.name ||
                                    "Clothing"}
                            </strong>
                        </div>
                        <div>
                            <span>Status</span>
                            <strong>{product.status || "Active"}</strong>
                        </div>
                        <div>
                            <span>Rating</span>
                            <strong>{rating.toFixed(1)} / 5</strong>
                        </div>
                    </div>
                </section>

                {/* ---- Reviews ---- */}
                <section className="nf-pd-section" aria-labelledby="nf-pd-reviews-title">
                    <header className="nf-pd-section-head">
                        <h2 id="nf-pd-reviews-title">Customer reviews</h2>
                        <span className="nf-pd-count">
                            {reviewCount} review{reviewCount === 1 ? "" : "s"}
                        </span>
                    </header>

                    <div className="nf-pd-reviews">
                        <div className="nf-pd-review-score">
                            <strong>{rating.toFixed(1)}</strong>
                            <span className="nf-pd-stars" aria-hidden="true">
                                {"★".repeat(5)}
                            </span>
                            <small>
                                Based on {reviewCount} review
                                {reviewCount === 1 ? "" : "s"}
                            </small>
                        </div>

                        <div className="nf-pd-review-bars">
                            {[5, 4, 3, 2, 1].map((value) => (
                                <div className="nf-pd-review-row" key={value}>
                                    <span>{value} ★</span>
                                    <div className="nf-pd-review-bar">
                                        <div
                                            className="nf-pd-review-fill"
                                            style={{
                                                width: value === 5 ? "80%" : "20%",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {reviewCount === 0 && (
                        <div className="nf-pd-reviews-empty">
                            <h3>No reviews yet</h3>
                            <p>Be the first customer to review this product.</p>
                        </div>
                    )}
                </section>

                {/* ---- Related ---- */}
                {relatedProducts.length > 0 && (
                    <section className="nf-pd-section" aria-labelledby="nf-pd-related-title">
                        <header className="nf-pd-section-head">
                            <h2 id="nf-pd-related-title">You may also like</h2>
                            <Link to="/products" className="nf-pd-view-all">
                                View all <IconArrow />
                            </Link>
                        </header>

                        <div className="nf-products-grid">
                            {relatedProducts.slice(0, 4).map((item) => {
                                const image = productImageFor(item);
                                const price =
                                    item.current_price ??
                                    item.discount_price ??
                                    item.price ??
                                    0;

                                return (
                                    <Link
                                        to={`/products/${item.id}`}
                                        className="marketplace-product-card nf-product-card"
                                        key={item.id}
                                    >
                                        <div className="product-image">
                                            <img
                                                src={image}
                                                alt={item.name}
                                                loading="lazy"
                                            />
                                        </div>

                                        <div className="product-card-content">
                                            <h3>{item.name}</h3>
                                            <div className="product-rating">
                                                <span aria-hidden="true">★</span>
                                                <span>
                                                    {Number(item.rating || 0).toFixed(1)}
                                                </span>
                                                <small>
                                                    ({item.review_count || 0})
                                                </small>
                                            </div>
                                            <div className="product-price">
                                                <strong>{formatPrice(price)}</strong>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            {/* ---- Toast ---- */}
            {toast && (
                <div
                    className={`nf-toast nf-toast-${toast.type}`}
                    role={toast.type === "error" ? "alert" : "status"}
                >
                    <span className="nf-toast-icon" aria-hidden="true">
                        {toast.type === "error" ? <IconWarning /> : <IconCheck />}
                    </span>
                    <span className="nf-toast-msg">{toast.message}</span>
                </div>
            )}

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
                            <label htmlFor="pd-search" className="nf-visually-hidden">
                                Search products
                            </label>
                            <input
                                id="pd-search"
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

export default ProductDetails;
