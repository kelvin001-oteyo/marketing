import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconCart = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

const IconTrash = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
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

/* =========================================================
   CART
========================================================= */

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
        return cart.items || cart.cart_items || cart.results || [];
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
        if (cart?.shipping !== undefined) return Number(cart.shipping || 0);
        if (cart?.shipping_cost !== undefined) return Number(cart.shipping_cost || 0);
        return subtotal >= 5000 ? 0 : 300;
    }, [cart, subtotal]);

    const total = useMemo(() => {
        if (cart?.total !== undefined && cart?.total !== null) {
            return Number(cart.total);
        }
        return subtotal + shipping;
    }, [cart, subtotal, shipping]);

    const FREE_SHIPPING_THRESHOLD = 5000;
    const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const freeShippingProgress = Math.min(
        100,
        (subtotal / FREE_SHIPPING_THRESHOLD) * 100
    );

    /* ---------- helpers (unchanged) ---------- */

    const getProduct = (item) => item.product || item.variant?.product || {};
    const getVariant = (item) => item.variant || {};

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
        return item.name || product.name || "Product";
    };

    const getItemId = (item) => item.id || item.cart_item_id;

    const formatPrice = (value) =>
        `KSh ${Number(value || 0).toLocaleString()}`;

    /* ---------- mutations (unchanged) ---------- */

    const updateQuantity = async (item, newQuantity) => {
        if (newQuantity < 1) {
            removeItem(item);
            return;
        }

        const itemId = getItemId(item);
        if (!itemId) return;

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
        if (!itemId) return;

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

    /* =========================================================
       HEADER (shared between loading + main)
    ========================================================= */

    const Header = () => (
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
                    <label htmlFor="cart-search" className="nf-visually-hidden">
                        Search products
                    </label>
                    <input
                        id="cart-search"
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
                    <Link to="/cart" className="nf-header-link is-active">
                        <span aria-hidden="true">🛍</span>
                        <span>Cart</span>
                        {cartItems.length > 0 && (
                            <span className="nf-cart-count" aria-hidden="true">
                                {cartItems.length}
                            </span>
                        )}
                    </Link>
                    <Link to="/login" className="marketplace-login">
                        Sign In
                    </Link>
                </div>
            </div>
        </header>
    );

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <Header />

                <nav className="marketplace-nav" aria-label="Primary">
                    <div className="marketplace-nav-inner">
                        <Link to="/">Home</Link>
                        <Link to="/products">All Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                        <Link to="/cart" className="active">Cart</Link>
                    </div>
                </nav>

                <main className="cart-page">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading your cart…</p>
                    </div>
                </main>
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
                    <Link to="/categories">Categories</Link>
                    <Link to="/stores">Stores</Link>
                    <Link to="/products?new=true">New Arrivals</Link>
                    <Link to="/products?featured=true">Featured</Link>
                    <Link to="/cart" className="active">Cart</Link>
                </div>
            </nav>

            <main className="cart-page nf-cart-page">
                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <span>Shopping Cart</span>
                </nav>

                {/* ---- Title row ---- */}
                <div className="cart-title-row">
                    <div>
                        <span className="section-eyebrow">YOUR BAG</span>
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
                    <div
                        className="marketplace-alert marketplace-alert-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {cartItems.length === 0 ? (
                    /* ================= EMPTY ================= */
                    <section className="empty-cart nf-empty-cart">
                        <div className="empty-cart-icon" aria-hidden="true">
                            <IconCart />
                        </div>

                        <h2>Your cart is empty</h2>
                        <p>
                            You haven't added any products to your cart yet.
                            Start shopping and your selected items will
                            appear here.
                        </p>

                        <Link
                            to="/products"
                            className="marketplace-primary-button"
                        >
                            Start Shopping
                        </Link>
                    </section>
                ) : (
                    /* ================= ITEMS + SUMMARY ================= */
                    <div className="cart-layout">

                        {/* ---- Items ---- */}
                        <section className="cart-items-section">
                            <div className="cart-items-header">
                                <h2>
                                    Cart Items{" "}
                                    <span className="nf-count-pill">
                                        {cartItems.length}
                                    </span>
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
                                    const quantity = Number(item.quantity || 1);
                                    const itemTotal = price * quantity;
                                    const isBusy = updatingId === itemId;

                                    return (
                                        <article
                                            key={itemId || `${name}-${quantity}`}
                                            className={`cart-item nf-cart-item ${isBusy ? "is-busy" : ""}`}
                                        >
                                            <Link
                                                to={
                                                    product.id
                                                        ? `/products/${product.id}`
                                                        : "/products"
                                                }
                                                className="cart-item-image nf-cart-image"
                                                aria-label={name}
                                            >
                                                {image ? (
                                                    <img src={image} alt={name} loading="lazy" />
                                                ) : (
                                                    <div className="cart-image-placeholder">
                                                        No Image
                                                    </div>
                                                )}
                                            </Link>

                                            <div className="cart-item-content">
                                                <div className="cart-item-main">
                                                    <div>
                                                        <h3>
                                                            <Link
                                                                to={
                                                                    product.id
                                                                        ? `/products/${product.id}`
                                                                        : "/products"
                                                                }
                                                                className="nf-item-link"
                                                            >
                                                                {name}
                                                            </Link>
                                                        </h3>

                                                        {product.brand && (
                                                            <p className="cart-item-brand">
                                                                {product.brand}
                                                            </p>
                                                        )}

                                                        <div className="cart-item-variant">
                                                            {variant.size && (
                                                                <span>Size: {variant.size}</span>
                                                            )}
                                                            {variant.color && (
                                                                <span>Color: {variant.color}</span>
                                                            )}
                                                            {variant.sku && (
                                                                <span>SKU: {variant.sku}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="cart-remove-button nf-remove-icon"
                                                        onClick={() => removeItem(item)}
                                                        disabled={isBusy}
                                                        aria-label={`Remove ${name} from cart`}
                                                    >
                                                        <IconTrash />
                                                        <span className="nf-remove-label">
                                                            Remove
                                                        </span>
                                                    </button>
                                                </div>

                                                <div className="cart-item-bottom">
                                                    <div
                                                        className="cart-quantity-control nf-qty"
                                                        role="group"
                                                        aria-label={`Quantity of ${name}`}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(item, quantity - 1)
                                                            }
                                                            disabled={isBusy}
                                                            aria-label="Decrease quantity"
                                                        >
                                                            −
                                                        </button>
                                                        <span aria-live="polite">{quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(item, quantity + 1)
                                                            }
                                                            disabled={isBusy}
                                                            aria-label="Increase quantity"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <div className="cart-item-pricing">
                                                        <span className="cart-unit-price">
                                                            {formatPrice(price)} each
                                                        </span>
                                                        <strong>
                                                            {formatPrice(itemTotal)}
                                                        </strong>
                                                    </div>
                                                </div>

                                                {isBusy && (
                                                    <div className="nf-item-busy" role="status">
                                                        Updating…
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            <div className="cart-continue-shopping">
                                <Link to="/products">
                                    <span aria-hidden="true">←</span> Continue
                                    Shopping
                                </Link>
                            </div>
                        </section>

                        {/* ---- Summary ---- */}
                        <aside className="cart-summary">
                            <div className="cart-summary-card">

                                {/* Free-shipping progress */}
                                {amountToFreeShipping > 0 ? (
                                    <div className="nf-ship-progress">
                                        <p>
                                            Add{" "}
                                            <strong>
                                                {formatPrice(amountToFreeShipping)}
                                            </strong>{" "}
                                            more for <strong>FREE shipping</strong>.
                                        </p>
                                        <div
                                            className="nf-ship-bar"
                                            role="progressbar"
                                            aria-valuemin={0}
                                            aria-valuemax={FREE_SHIPPING_THRESHOLD}
                                            aria-valuenow={subtotal}
                                        >
                                            <span
                                                style={{ width: `${freeShippingProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="nf-ship-progress is-unlocked">
                                        <IconTruck />
                                        <span>
                                            You've unlocked <strong>free shipping</strong>.
                                        </span>
                                    </div>
                                )}

                                <h2>Order Summary</h2>

                                <div className="cart-summary-row">
                                    <span>Subtotal</span>
                                    <strong>{formatPrice(subtotal)}</strong>
                                </div>

                                <div className="cart-summary-row">
                                    <span>Shipping</span>
                                    <strong>
                                        {shipping === 0
                                            ? "FREE"
                                            : formatPrice(shipping)}
                                    </strong>
                                </div>

                                <div className="cart-summary-divider" />

                                <div className="cart-summary-total">
                                    <span>Total</span>
                                    <strong>{formatPrice(total)}</strong>
                                </div>

                                <button
                                    type="button"
                                    className="cart-checkout-button nf-checkout-btn"
                                    onClick={handleCheckout}
                                >
                                    Proceed to Checkout{" "}
                                    <span aria-hidden="true">→</span>
                                </button>

                                <div className="cart-secure-note nf-secure-note">
                                    <IconShield />
                                    <div>
                                        <strong>Secure Checkout</strong>
                                        <small>M-Pesa · Your data is protected.</small>
                                    </div>
                                </div>
                            </div>

                            <div className="cart-help-card">
                                <h3>Need help?</h3>
                                <p>
                                    Questions about an item or your order?
                                    Contact our support team.
                                </p>
                                <Link to="/contact">
                                    Contact Support{" "}
                                    <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </aside>
                    </div>
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
                            Discover products from trusted sellers and shop
                            with confidence.
                        </p>
                    </div>

                    <div>
                        <h3>Shop</h3>
                        <Link to="/products">Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                    </div>

                    <div>
                        <h3>Customer</h3>
                        <Link to="/orders">My Orders</Link>
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/cart">Cart</Link>
                    </div>

                    <div>
                        <h3>Support</h3>
                        <Link to="/contact">Contact</Link>
                        <Link to="/help">Help Center</Link>
                        <Link to="/returns">Returns</Link>
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

export default Cart;
