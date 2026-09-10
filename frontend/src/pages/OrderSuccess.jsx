import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/marketplace.css";

function OrderSuccess() {
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const orderId = params.get("order");

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
                        <Link to="/cart">Cart</Link>
                    </nav>

                    <div className="marketplace-header-actions">
                        <Link
                            to="/products"
                            className="marketplace-login-button"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </header>

            <main className="marketplace-container order-success-page">
                <div className="order-success-card">
                    <div className="order-success-icon">
                        ✓
                    </div>

                    <span className="order-success-label">
                        ORDER CONFIRMED
                    </span>

                    <h1>Thank you for your order!</h1>

                    <p className="order-success-message">
                        Your order has been received successfully. We are
                        preparing it for processing and delivery.
                    </p>

                    {orderId && (
                        <div className="order-success-number">
                            <span>Order Number</span>
                            <strong>#{orderId}</strong>
                        </div>
                    )}

                    <div className="order-success-status">
                        <div className="success-status-icon">
                            ✓
                        </div>

                        <div>
                            <strong>Order received</strong>
                            <span>
                                Your order is now waiting for processing.
                            </span>
                        </div>
                    </div>

                    <div className="order-success-actions">
                        {orderId ? (
                            <Link
                                to={`/orders/${orderId}`}
                                className="order-success-primary-button"
                            >
                                View Order
                            </Link>
                        ) : (
                            <Link
                                to="/orders"
                                className="order-success-primary-button"
                            >
                                View My Orders
                            </Link>
                        )}

                        <Link
                            to="/products"
                            className="order-success-secondary-button"
                        >
                            Continue Shopping
                        </Link>
                    </div>

                    <div className="order-success-info">
                        <div>
                            <strong>What's next?</strong>

                            <p>
                                You can track your order status from your
                                Orders page once processing begins.
                            </p>
                        </div>
                    </div>
                </div>
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

export default OrderSuccess;