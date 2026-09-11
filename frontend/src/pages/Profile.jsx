import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/marketplace.css";

export default function Profile() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <div className="marketplace-container marketplace-header-inner">
                    <Link to="/" className="marketplace-logo">
                        Oteyo<span>Market</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/products">Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                        <Link to="/cart">Cart</Link>
                    </nav>
                </div>
            </header>

            <main className="marketplace-container marketplace-main">
                <section className="profile-page">
                    <div className="profile-icon">👤</div>

                    <span className="seller-eyebrow">MY ACCOUNT</span>

                    {isAuthenticated ? (
                        <>
                            <h1>
                                Welcome, {user.first_name || user.username}
                            </h1>
                            <p>
                                Role: {user.role} · Manage your orders,
                                addresses and marketplace activity below.
                            </p>

                            <div className="profile-actions">
                                {user.role === "ADMIN" && (
                                    <Link to="/admin" className="marketplace-primary-btn">
                                        Go to Admin Dashboard
                                    </Link>
                                )}
                                <button
                                    className="marketplace-secondary-btn"
                                    onClick={logout}
                                >
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1>Your Profile</h1>
                            <p>
                                Sign in to manage your account,
                                orders, addresses and marketplace
                                activity.
                            </p>

                            <div className="profile-actions">
                                <Link to="/login" className="marketplace-primary-btn">
                                    Sign In
                                </Link>
                                <Link to="/products" className="marketplace-secondary-btn">
                                    Continue Shopping
                                </Link>
                            </div>
                        </>
                    )}

                    <div className="profile-links">
                        <Link to="/orders">My Orders</Link>
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/addresses">Delivery Addresses</Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
