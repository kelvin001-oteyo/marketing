import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

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

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/products/${id}/`);
            const data = response.data;

            setProduct(data);

            const firstImage =
                data.images?.[0]?.image ||
                data.image ||
                "https://via.placeholder.com/700x700?text=No+Image";

            setActiveImage(firstImage);

            if (data.category) {
                try {
                    const relatedResponse = await api.get(
                        `/products/?category=${data.category}&page_size=8`
                    );

                    const relatedData = relatedResponse.data;

                    const products = Array.isArray(relatedData)
                        ? relatedData
                        : relatedData.results || [];

                    setRelatedProducts(
                        products.filter(
                            (item) => String(item.id) !== String(data.id)
                        )
                    );
                } catch {
                    setRelatedProducts([]);
                }
            }
        } catch (err) {
            console.error("Failed to load product:", err);
            setError(
                err.response?.data?.detail ||
                    "Unable to load this product."
            );
        } finally {
            setLoading(false);
        }
    };

    const images = useMemo(() => {
        if (!product) return [];

        if (product.images?.length) {
            return product.images.map((item) => item.image);
        }

        if (product.image) {
            return [product.image];
        }

        return [
            "https://via.placeholder.com/700x700?text=No+Image"
        ];
    }, [product]);

    const variants = product?.variants || [];

    const sizes = useMemo(() => {
        return [
            ...new Set(
                variants
                    .map((variant) => variant.size)
                    .filter(Boolean)
            )
        ];
    }, [variants]);

    const colors = useMemo(() => {
        return [
            ...new Set(
                variants
                    .map((variant) => variant.color)
                    .filter(Boolean)
            )
        ];
    }, [variants]);

    const selectedVariant = useMemo(() => {
        if (!variants.length) return null;

        return (
            variants.find((variant) => {
                const sizeMatches =
                    !selectedSize || variant.size === selectedSize;

                const colorMatches =
                    !selectedColor || variant.color === selectedColor;

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
        selectedVariant?.original_price ??
        product?.price ??
        currentPrice;

    const discountPercentage =
        originalPrice > currentPrice
            ? Math.round(
                  ((originalPrice - currentPrice) / originalPrice) * 100
              )
            : 0;

    const availableStock =
        selectedVariant?.stock_quantity ??
        product?.stock_quantity ??
        0;

    const isOutOfStock =
        product?.status === "OUT_OF_STOCK" ||
        (variants.length > 0 && availableStock <= 0);

    const formatPrice = (value) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(Number(value || 0));
    };

    const handleQuantityChange = (amount) => {
        setQuantity((current) => {
            const next = current + amount;

            if (next < 1) return 1;

            if (availableStock > 0 && next > availableStock) {
                return availableStock;
            }

            return next;
        });
    };

    const handleAddToCart = async () => {
        if (isOutOfStock) return;

        try {
            setAddingToCart(true);

            const payload = {
                product_id: product.id,
                quantity,
            };

            if (selectedVariant?.id) {
                payload.variant_id = selectedVariant.id;
            }

            await api.post("/cart/items/", payload);

            alert("Product added to cart successfully.");
        } catch (err) {
            console.error("Add to cart failed:", err);

            if (err.response?.status === 401) {
                alert(
                    "Please sign in before adding products to your cart."
                );
                return;
            }

            alert(
                err.response?.data?.detail ||
                    "Unable to add this product to cart."
            );
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (isOutOfStock) return;

        try {
            setAddingToCart(true);

            const payload = {
                product_id: product.id,
                quantity,
            };

            if (selectedVariant?.id) {
                payload.variant_id = selectedVariant.id;
            }

            await api.post("/cart/items/", payload);

            navigate("/checkout");
        } catch (err) {
            console.error("Buy now failed:", err);

            if (err.response?.status === 401) {
                alert(
                    "Please sign in before purchasing this product."
                );
                return;
            }

            alert(
                err.response?.data?.detail ||
                    "Unable to continue with this purchase."
            );
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="marketplace-page">
                <div className="marketplace-container">
                    <div className="marketplace-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading product...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="marketplace-page">
                <div className="marketplace-container">
                    <div className="marketplace-error">
                        <h2>Product unavailable</h2>
                        <p>{error || "Product not found."}</p>
                        <Link
                            to="/products"
                            className="marketplace-primary-button"
                        >
                            Back to products
                        </Link>
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
                    <Link to="/" className="marketplace-logo">
                        Kelvoh<span>Market</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/">Home</Link>
                        <Link to="/products">Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                        <Link to="/sell">Sell</Link>
                    </nav>

                    <div className="marketplace-actions">
                        <Link to="/wishlist" className="marketplace-action">
                            ♡
                        </Link>

                        <Link to="/cart" className="marketplace-action">
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

            {/* BREADCRUMBS */}
            <div className="marketplace-container">
                <div className="marketplace-breadcrumbs">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/products">Products</Link>
                    <span>/</span>
                    <span>{product.name}</span>
                </div>
            </div>

            {/* PRODUCT */}
            <main className="marketplace-container">
                <section className="product-details-layout">
                    {/* IMAGE GALLERY */}
                    <div className="product-gallery">
                        <div className="product-main-image">
                            <img
                                src={activeImage}
                                alt={product.name}
                            />

                            {discountPercentage > 0 && (
                                <span className="product-discount-badge">
                                    -{discountPercentage}%
                                </span>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="product-thumbnail-list">
                                {images.map((image, index) => (
                                    <button
                                        key={`${image}-${index}`}
                                        type="button"
                                        className={`product-thumbnail ${
                                            activeImage === image
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setActiveImage(image)
                                        }
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${
                                                index + 1
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* PRODUCT INFORMATION */}
                    <div className="product-details-content">
                        <div className="product-brand">
                            {product.brand || "Fashion"}
                        </div>

                        <h1>{product.name}</h1>

                        <div className="product-rating-row">
                            <div className="product-stars">
                                ★★★★★
                            </div>

                            <span>
                                {product.rating || "0.0"}
                            </span>

                            <span className="rating-divider">|</span>

                            <span>
                                {product.review_count || 0} reviews
                            </span>
                        </div>

                        <div className="product-price-box">
                            <span className="product-current-price">
                                {formatPrice(currentPrice)}
                            </span>

                            {Number(originalPrice) >
                                Number(currentPrice) && (
                                <span className="product-original-price">
                                    {formatPrice(originalPrice)}
                                </span>
                            )}

                            {discountPercentage > 0 && (
                                <span className="product-discount-text">
                                    Save {discountPercentage}%
                                </span>
                            )}
                        </div>

                        <div className="product-description">
                            <h3>About this product</h3>
                            <p>
                                {product.description ||
                                    "High-quality clothing item available from our marketplace seller."}
                            </p>
                        </div>

                        {/* SIZE */}
                        {sizes.length > 0 && (
                            <div className="product-option-group">
                                <div className="product-option-header">
                                    <strong>Size</strong>
                                    <span>
                                        {selectedSize || "Select size"}
                                    </span>
                                </div>

                                <div className="product-option-list">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            className={`product-option-button ${
                                                selectedSize === size
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setSelectedSize(size)
                                            }
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* COLOR */}
                        {colors.length > 0 && (
                            <div className="product-option-group">
                                <div className="product-option-header">
                                    <strong>Color</strong>
                                    <span>
                                        {selectedColor || "Select color"}
                                    </span>
                                </div>

                                <div className="product-option-list">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`product-option-button ${
                                                selectedColor === color
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setSelectedColor(color)
                                            }
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STOCK */}
                        <div className="product-stock-section">
                            {isOutOfStock ? (
                                <span className="stock-out">
                                    Out of stock
                                </span>
                            ) : availableStock > 0 ? (
                                <span className="stock-available">
                                    In stock
                                    {availableStock <= 10 &&
                                        ` — only ${availableStock} left`}
                                </span>
                            ) : (
                                <span className="stock-available">
                                    Available
                                </span>
                            )}
                        </div>

                        {/* QUANTITY */}
                        <div className="product-purchase-row">
                            <div className="quantity-control">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuantityChange(-1)
                                    }
                                    disabled={quantity <= 1}
                                >
                                    −
                                </button>

                                <span>{quantity}</span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuantityChange(1)
                                    }
                                    disabled={
                                        availableStock > 0 &&
                                        quantity >= availableStock
                                    }
                                >
                                    +
                                </button>
                            </div>

                            <button
                                type="button"
                                className="product-wishlist-button"
                                onClick={() =>
                                    alert(
                                        "Wishlist functionality will be connected next."
                                    )
                                }
                            >
                                ♡
                            </button>
                        </div>

                        {/* ACTIONS */}
                        <div className="product-action-buttons">
                            <button
                                type="button"
                                className="product-buy-button"
                                disabled={
                                    isOutOfStock || addingToCart
                                }
                                onClick={handleBuyNow}
                            >
                                {addingToCart
                                    ? "Processing..."
                                    : "Buy Now"}
                            </button>

                            <button
                                type="button"
                                className="product-cart-button"
                                disabled={
                                    isOutOfStock || addingToCart
                                }
                                onClick={handleAddToCart}
                            >
                                {addingToCart
                                    ? "Adding..."
                                    : "Add to Cart"}
                            </button>
                        </div>

                        {/* SELLER */}
                        <div className="product-seller-card">
                            <div className="seller-avatar">
                                {(
                                    product.seller_name ||
                                    product.seller?.store_name ||
                                    "S"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="seller-info">
                                <span className="seller-label">
                                    Sold by
                                </span>

                                <strong>
                                    {product.seller_name ||
                                        product.seller?.store_name ||
                                        "Marketplace Seller"}
                                </strong>

                                <span className="seller-location">
                                    {product.seller_location ||
                                        product.seller?.location ||
                                        "Kenya"}
                                </span>
                            </div>

                            <Link
                                to={
                                    product.seller_slug
                                        ? `/stores/${product.seller_slug}`
                                        : "/stores"
                                }
                                className="view-store-button"
                            >
                                View Store
                            </Link>
                        </div>
                    </div>
                </section>

                {/* PRODUCT INFORMATION TABS */}
                <section className="product-information-section">
                    <div className="product-section-heading">
                        <h2>Product information</h2>
                    </div>

                    <div className="product-information-grid">
                        <div>
                            <span>Brand</span>
                            <strong>
                                {product.brand || "Not specified"}
                            </strong>
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
                            <span>Product status</span>
                            <strong>
                                {product.status || "Active"}
                            </strong>
                        </div>

                        <div>
                            <span>Rating</span>
                            <strong>
                                {product.rating || "0.0"} / 5
                            </strong>
                        </div>
                    </div>
                </section>

                {/* REVIEWS */}
                <section className="product-reviews-section">
                    <div className="product-section-heading">
                        <h2>Customer reviews</h2>

                        <span>
                            {product.review_count || 0} reviews
                        </span>
                    </div>

                    <div className="product-review-summary">
                        <div className="review-score">
                            <strong>
                                {product.rating || "0.0"}
                            </strong>

                            <div className="product-stars">
                                ★★★★★
                            </div>

                            <span>
                                Based on{" "}
                                {product.review_count || 0} reviews
                            </span>
                        </div>

                        <div className="review-bars">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <div
                                    className="review-bar-row"
                                    key={rating}
                                >
                                    <span>{rating} ★</span>
                                    <div className="review-bar">
                                        <div
                                            className="review-bar-fill"
                                            style={{
                                                width:
                                                    rating === 5
                                                        ? "80%"
                                                        : "20%",
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reviews-empty-state">
                        <h3>No reviews yet</h3>
                        <p>
                            Be the first customer to review this
                            product.
                        </p>
                    </div>
                </section>

                {/* RELATED PRODUCTS */}
                {relatedProducts.length > 0 && (
                    <section className="related-products-section">
                        <div className="product-section-heading">
                            <h2>You may also like</h2>

                            <Link to="/products">
                                View all
                            </Link>
                        </div>

                        <div className="marketplace-product-grid">
                            {relatedProducts
                                .slice(0, 4)
                                .map((item) => {
                                    const image =
                                        item.images?.[0]?.image ||
                                        item.image ||
                                        "https://via.placeholder.com/400x400?text=No+Image";

                                    const price =
                                        item.current_price ??
                                        item.discount_price ??
                                        item.price ??
                                        0;

                                    return (
                                        <Link
                                            to={`/products/${item.id}`}
                                            className="marketplace-product-card"
                                            key={item.id}
                                        >
                                            <div className="product-card-image">
                                                <img
                                                    src={image}
                                                    alt={item.name}
                                                />
                                            </div>

                                            <div className="product-card-body">
                                                <h3>
                                                    {item.name}
                                                </h3>

                                                <div className="product-card-rating">
                                                    ★★★★★{" "}
                                                    <span>
                                                        (
                                                        {item.review_count ||
                                                            0}
                                                        )
                                                    </span>
                                                </div>

                                                <div className="product-card-price">
                                                    {formatPrice(price)}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    </section>
                )}
            </main>

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
                        <Link to="/wishlist">Wishlist</Link>
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
                    © {new Date().getFullYear()} KelvohMarket.
                    All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default ProductDetails;