import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

function Wishlist() {
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [error, setError] = useState("");

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/wishlist/");
            setWishlist(response.data);
        } catch (err) {
            console.error("Failed to load wishlist:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to load your wishlist."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const wishlistItems = Array.isArray(wishlist)
        ? wishlist
        : wishlist?.items ||
          wishlist?.wishlist_items ||
          wishlist?.results ||
          [];

    const getProduct = (item) => {
        return item.product || item.variant?.product || item;
    };

    const getProductId = (item) => {
        const product = getProduct(item);

        return (
            product.id ||
            item.product_id ||
            item.product
        );
    };

    const getProductName = (item) => {
        const product = getProduct(item);

        return product.name || item.name || "Product";
    };

    const getProductImage = (item) => {
        const product = getProduct(item);

        return (
            product.image ||
            product.primary_image ||
            product.images?.[0]?.image ||
            ""
        );
    };

    const getProductPrice = (item) => {
        const product = getProduct(item);

        return Number(
            product.current_price ||
            product.discount_price ||
            product.price ||
            item.price ||
            0
        );
    };

    const getOriginalPrice = (item) => {
        const product = getProduct(item);

        const originalPrice = Number(product.price || 0);
        const currentPrice = getProductPrice(item);

        if (
            originalPrice > 0 &&
            currentPrice > 0 &&
            originalPrice > currentPrice
        ) {
            return originalPrice;
        }

        return null;
    };

    const removeFromWishlist = async (item) => {
        const itemId =
            item.id ||
            item.wishlist_item_id ||
            item.product_id ||
            getProductId(item);

        if (!itemId) {
            return;
        }

        try {
            setRemovingId(itemId);
            setError("");

            await api.delete(`/wishlist/${itemId}/`);

            setWishlist((previous) => {
                if (!previous) {
                    return previous;
                }

                if (Array.isArray(previous)) {
                    return previous.filter(
                        (wishlistItem) =>
                            (wishlistItem.id ||
                                wishlistItem.product_id ||
                                wishlistItem.wishlist_item_id) !== itemId
                    );
                }

                return {
                    ...previous,
                    items: (previous.items || []).filter(
                        (wishlistItem) =>
                            (wishlistItem.id ||
                                wishlistItem.product_id ||
                                wishlistItem.wishlist_item_id) !== itemId
                    ),
                };
            });

            await fetchWishlist();
        } catch (err) {
            console.error("Failed to remove wishlist item:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to remove item from wishlist."
            );
        } finally {
            setRemovingId(null);
        }
    };

    const addToCart = async (item) => {
        const product = getProduct(item);
        const productId = getProductId(item);

        if (!productId) {
            return;
        }

        try {
            setError("");

            await api.post("/cart/items/", {
                product: productId,
                quantity: 1,
            });

            window.alert(
                `${product.name || "Product"} has been added to your cart.`
            );
        } catch (err) {
            console.error("Failed to add item to cart:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to add this product to your cart."
            );
        }
    };

    if (loading) {
        return (
            <div className="marketplace-page">
                <header className="marketplace-header">
                    <div className="marketplace-container marketplace-header-inner">
                        <Link to="/" className="marketplace-logo">
                            OteyoStore
                        </Link>

                        <nav className="marketplace-nav">
                            <Link to="/">Home</Link>
                            <Link to="/products">Products</Link>
                            <Link to="/categories">Categories</Link>
                            <Link to="/stores">Stores</Link>
                            <Link to="/wishlist" className="active">
                                Wishlist
                            </Link>
                            <Link to="/cart">Cart</Link>
                        </nav>
                    </div>
                </header>

                <main className="marketplace-container wishlist-page">
                    <div className="wishlist-loading">
                        <div className="wishlist-loading-spinner"></div>
                        <p>Loading your wishlist...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <div className="marketplace-container marketplace-header-inner">
                    <Link to="/" className="marketplace-logo">
                        OteyoStore
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/">Home</Link>
                        <Link to="/products">Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                        <Link to="/orders">Orders</Link>
                        <Link to="/wishlist" className="active">
                            Wishlist
                        </Link>
                        <Link to="/cart">Cart</Link>
                    </nav>

                    <div className="marketplace-header-actions">
                        <Link
                            to="/wishlist"
                            className="wishlist-header-button"
                        >
                            Wishlist
                            <span>{wishlistItems.length}</span>
                        </Link>

                        <Link
                            to="/cart"
                            className="marketplace-login-button"
                        >
                            Cart
                        </Link>
                    </div>
                </div>
            </header>

            <main className="marketplace-container wishlist-page">
                <div className="wishlist-breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <span>Wishlist</span>
                </div>

                <div className="wishlist-title-row">
                    <div>
                        <h1>My Wishlist</h1>
                        <p>
                            Save products you love and come back to them
                            anytime.
                        </p>
                    </div>

                    <Link
                        to="/products"
                        className="wishlist-shop-button"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {error && (
                    <div className="marketplace-alert marketplace-alert-error">
                        {error}
                    </div>
                )}

                {wishlistItems.length === 0 ? (
                    <section className="empty-wishlist">
                        <div className="empty-wishlist-icon">
                            ♡
                        </div>

                        <h2>Your wishlist is empty</h2>

                        <p>
                            You haven't saved any products yet. Browse the
                            marketplace and add products you want to keep an
                            eye on.
                        </p>

                        <Link
                            to="/products"
                            className="marketplace-primary-button"
                        >
                            Explore Products
                        </Link>
                    </section>
                ) : (
                    <section className="wishlist-content">
                        <div className="wishlist-count">
                            {wishlistItems.length}{" "}
                            {wishlistItems.length === 1
                                ? "saved item"
                                : "saved items"}
                        </div>

                        <div className="wishlist-grid">
                            {wishlistItems.map((item, index) => {
                                const product = getProduct(item);
                                const productId = getProductId(item);
                                const image = getProductImage(item);
                                const name = getProductName(item);
                                const price = getProductPrice(item);
                                const originalPrice =
                                    getOriginalPrice(item);

                                const discount =
                                    originalPrice && price
                                        ? Math.round(
                                              ((originalPrice - price) /
                                                  originalPrice) *
                                                  100
                                          )
                                        : null;

                                const rating = Number(
                                    product.rating || 0
                                );

                                const itemKey =
                                    item.id ||
                                    item.wishlist_item_id ||
                                    productId ||
                                    index;

                                return (
                                    <article
                                        key={itemKey}
                                        className="wishlist-card"
                                    >
                                        <div className="wishlist-image-wrapper">
                                            <Link
                                                to={`/products/${productId}`}
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={name}
                                                        className="wishlist-image"
                                                    />
                                                ) : (
                                                    <div className="wishlist-image-placeholder">
                                                        No Image
                                                    </div>
                                                )}
                                            </Link>

                                            {discount && (
                                                <span className="wishlist-discount">
                                                    -{discount}%
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                className="wishlist-remove-icon"
                                                onClick={() =>
                                                    removeFromWishlist(item)
                                                }
                                                disabled={
                                                    removingId === itemKey
                                                }
                                                title="Remove from wishlist"
                                            >
                                                ♥
                                            </button>
                                        </div>

                                        <div className="wishlist-card-content">
                                            {product.brand && (
                                                <span className="wishlist-brand">
                                                    {product.brand}
                                                </span>
                                            )}

                                            <Link
                                                to={`/products/${productId}`}
                                                className="wishlist-product-name"
                                            >
                                                {name}
                                            </Link>

                                            <div className="wishlist-rating">
                                                <span className="wishlist-stars">
                                                    {"★".repeat(
                                                        Math.min(
                                                            Math.round(rating),
                                                            5
                                                        )
                                                    )}
                                                </span>

                                                <span>
                                                    {rating > 0
                                                        ? rating.toFixed(1)
                                                        : "New"}
                                                </span>
                                            </div>

                                            <div className="wishlist-price-row">
                                                <strong>
                                                    KSh{" "}
                                                    {price.toLocaleString()}
                                                </strong>

                                                {originalPrice && (
                                                    <span>
                                                        KSh{" "}
                                                        {originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="wishlist-actions">
                                                <button
                                                    type="button"
                                                    className="wishlist-cart-button"
                                                    onClick={() =>
                                                        addToCart(item)
                                                    }
                                                >
                                                    Add to Cart
                                                </button>

                                                <Link
                                                    to={`/products/${productId}`}
                                                    className="wishlist-view-button"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            <footer className="marketplace-footer">
                <div className="marketplace-container marketplace-footer-grid">
                    <div>
                        <h3>OteyoStore</h3>
                        <p>
                            Discover products from trusted sellers and shop
                            with confidence.
                        </p>
                    </div>

                    <div>
                        <h4>Shop</h4>
                        <Link to="/products">Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                    </div>

                    <div>
                        <h4>Customer</h4>
                        <Link to="/orders">My Orders</Link>
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/cart">Cart</Link>
                    </div>
                </div>

                <div className="marketplace-footer-bottom">
                    <div className="marketplace-container">
                        © {new Date().getFullYear()} OteyoStore. All rights
                        reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Wishlist;