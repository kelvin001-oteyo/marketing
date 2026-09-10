import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/cart/");
            setCart(response.data);
        } catch (err) {
            console.error("Failed to load cart:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to load your cart."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const cartItems = useMemo(() => {
        if (!cart) return [];

        if (Array.isArray(cart)) return cart;

        return (
            cart.items ||
            cart.cart_items ||
            cart.results ||
            []
        );
    }, [cart]);

    const subtotal = useMemo(() => {
        if (cart?.subtotal !== undefined && cart?.subtotal !== null) {
            return Number(cart.subtotal);
        }

        return cartItems.reduce((total, item) => {
            const quantity = Number(item.quantity || 1);

            const price = Number(
                item.price ||
                item.current_price ||
                item.variant?.current_price ||
                item.product?.current_price ||
                item.product?.price ||
                0
            );

            return total + price * quantity;
        }, 0);
    }, [cart, cartItems]);

    const shipping = useMemo(() => {
        if (cart?.shipping !== undefined) {
            return Number(cart.shipping || 0);
        }

        if (cart?.shipping_cost !== undefined) {
            return Number(cart.shipping_cost || 0);
        }

        return subtotal >= 5000 ? 0 : 300;
    }, [cart, subtotal]);

    const total = useMemo(() => {
        if (cart?.total !== undefined && cart?.total !== null) {
            return Number(cart.total);
        }

        return subtotal + shipping;
    }, [cart, subtotal, shipping]);

    const getProduct = (item) => {
        return item.product || item.variant?.product || {};
    };

    const getVariant = (item) => {
        return item.variant || {};
    };

    const getItemPrice = (item) => {
        const product = getProduct(item);
        const variant = getVariant(item);

        return Number(
            item.price ||
            item.current_price ||
            variant.current_price ||
            variant.price ||
            product.current_price ||
            product.discount_price ||
            product.price ||
            0
        );
    };

    const getItemImage = (item) => {
        const product = getProduct(item);
        const variant = getVariant(item);

        return (
            item.image ||
            variant.image ||
            product.image ||
            product.primary_image ||
            product.images?.[0]?.image ||
            ""
        );
    };

    const getItemName = (item) => {
        const product = getProduct(item);

        return (
            item.name ||
            product.name ||
            "Product"
        );
    };

    const getItemId = (item) => {
        return item.id || item.cart_item_id;
    };

    const updateQuantity = async (item, newQuantity) => {
        if (newQuantity < 1) {
            removeItem(item);
            return;
        }

        const itemId = getItemId(item);

        if (!itemId) {
            return;
        }

        try {
            setUpdatingId(itemId);
            setError("");

            await api.patch(`/cart/items/${itemId}/`, {
                quantity: newQuantity,
            });

            await fetchCart();
        } catch (err) {
            console.error("Failed to update quantity:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to update cart quantity."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const removeItem = async (item) => {
        const itemId = getItemId(item);

        if (!itemId) {
            return;
        }

        try {
            setUpdatingId(itemId);
            setError("");

            await api.delete(`/cart/items/${itemId}/`);

            await fetchCart();
        } catch (err) {
            console.error("Failed to remove item:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to remove item from cart."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const clearCart = async () => {
        if (cartItems.length === 0) return;

        const confirmed = window.confirm(
            "Are you sure you want to remove all items from your cart?"
        );

        if (!confirmed) return;

        try {
            setLoading(true);
            setError("");

            await api.delete("/cart/clear/");

            await fetchCart();
        } catch (err) {
            console.error("Failed to clear cart:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to clear your cart."
            );

            setLoading(false);
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;

        navigate("/checkout");
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
                            <Link to="/cart" className="active">
                                Cart
                            </Link>
                        </nav>
                    </div>
                </header>

                <main className="marketplace-container cart-page">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner"></div>
                        <p>Loading your cart...</p>
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
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/cart" className="active">
                            Cart
                        </Link>
                    </nav>

                    <div className="marketplace-header-actions">
                        <Link to="/cart" className="cart-header-button">
                            Cart
                            <span>{cartItems.length}</span>
                        </Link>

                        <Link to="/login" className="marketplace-login-button">
                            Sign in
                        </Link>
                    </div>
                </div>
            </header>

            <main className="marketplace-container cart-page">
                <div className="cart-breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <span>Shopping Cart</span>
                </div>

                <div className="cart-title-row">
                    <div>
                        <h1>Shopping Cart</h1>
                        <p>
                            Review your items before completing your order.
                        </p>
                    </div>

                    {cartItems.length > 0 && (
                        <button
                            type="button"
                            className="cart-clear-button"
                            onClick={clearCart}
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {error && (
                    <div className="marketplace-alert marketplace-alert-error">
                        {error}
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <section className="empty-cart">
                        <div className="empty-cart-icon">
                            🛒
                        </div>

                        <h2>Your cart is empty</h2>

                        <p>
                            You haven't added any products to your cart yet.
                            Start shopping and your selected items will appear
                            here.
                        </p>

                        <Link
                            to="/products"
                            className="marketplace-primary-button"
                        >
                            Start Shopping
                        </Link>
                    </section>
                ) : (
                    <div className="cart-layout">
                        <section className="cart-items-section">
                            <div className="cart-items-header">
                                <h2>
                                    Cart Items ({cartItems.length})
                                </h2>
                            </div>

                            <div className="cart-items-list">
                                {cartItems.map((item) => {
                                    const itemId = getItemId(item);
                                    const product = getProduct(item);
                                    const variant = getVariant(item);
                                    const image = getItemImage(item);
                                    const name = getItemName(item);
                                    const price = getItemPrice(item);
                                    const quantity = Number(
                                        item.quantity || 1
                                    );

                                    const itemTotal = price * quantity;

                                    return (
                                        <article
                                            key={itemId || `${name}-${Math.random()}`}
                                            className="cart-item"
                                        >
                                            <div className="cart-item-image">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={name}
                                                    />
                                                ) : (
                                                    <div className="cart-image-placeholder">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="cart-item-content">
                                                <div className="cart-item-main">
                                                    <div>
                                                        <h3>{name}</h3>

                                                        {product.brand && (
                                                            <p className="cart-item-brand">
                                                                {product.brand}
                                                            </p>
                                                        )}

                                                        <div className="cart-item-variant">
                                                            {variant.size && (
                                                                <span>
                                                                    Size:{" "}
                                                                    {variant.size}
                                                                </span>
                                                            )}

                                                            {variant.color && (
                                                                <span>
                                                                    Color:{" "}
                                                                    {variant.color}
                                                                </span>
                                                            )}

                                                            {variant.sku && (
                                                                <span>
                                                                    SKU:{" "}
                                                                    {variant.sku}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="cart-remove-button"
                                                        onClick={() =>
                                                            removeItem(item)
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                            itemId
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="cart-item-bottom">
                                                    <div className="cart-quantity-control">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item,
                                                                    quantity - 1
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                itemId
                                                            }
                                                        >
                                                            −
                                                        </button>

                                                        <span>
                                                            {quantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item,
                                                                    quantity + 1
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                itemId
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <div className="cart-item-pricing">
                                                        <span className="cart-unit-price">
                                                            KSh{" "}
                                                            {price.toLocaleString()}
                                                        </span>

                                                        <strong>
                                                            KSh{" "}
                                                            {itemTotal.toLocaleString()}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            <div className="cart-continue-shopping">
                                <Link to="/products">
                                    ← Continue Shopping
                                </Link>
                            </div>
                        </section>

                        <aside className="cart-summary">
                            <div className="cart-summary-card">
                                <h2>Order Summary</h2>

                                <div className="cart-summary-row">
                                    <span>Subtotal</span>
                                    <strong>
                                        KSh {subtotal.toLocaleString()}
                                    </strong>
                                </div>

                                <div className="cart-summary-row">
                                    <span>Shipping</span>
                                    <strong>
                                        {shipping === 0
                                            ? "FREE"
                                            : `KSh ${shipping.toLocaleString()}`}
                                    </strong>
                                </div>

                                <div className="cart-summary-divider"></div>

                                <div className="cart-summary-total">
                                    <span>Total</span>
                                    <strong>
                                        KSh {total.toLocaleString()}
                                    </strong>
                                </div>

                                {subtotal < 5000 && (
                                    <div className="cart-shipping-note">
                                        Add KSh{" "}
                                        {(5000 - subtotal).toLocaleString()}{" "}
                                        more to qualify for free shipping.
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="cart-checkout-button"
                                    onClick={handleCheckout}
                                >
                                    Proceed to Checkout
                                </button>

                                <div className="cart-secure-note">
                                    <span>Secure Checkout</span>
                                    <small>
                                        Your order details are protected.
                                    </small>
                                </div>
                            </div>

                            <div className="cart-help-card">
                                <h3>Need help?</h3>
                                <p>
                                    Questions about an item or your order?
                                    Contact our support team.
                                </p>

                                <Link to="/contact">
                                    Contact Support
                                </Link>
                            </div>
                        </aside>
                    </div>
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

export default Cart;