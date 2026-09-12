import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/marketplace.css";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconUser = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22c0-4 4-6 8-6s8 2 8 6" />
    </svg>
);

const IconOrders = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2h12l1 5H5z" />
        <path d="M5 7v15h14V7" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
    </svg>
);

const IconHeart = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
);

const IconPin = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const IconStore = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v11H3z" />
        <path d="M9 20v-6h6v6" />
    </svg>
);

const IconSettings = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1.1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

/* =========================================================
   PROFILE
========================================================= */

export default function Profile() {
    const { user, isAuthenticated, logout } = useAuth();

    const displayName =
        (user && (user.first_name || user.username)) || "Guest";

    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "NF";

    const roleLabel = (user?.role || "").toString().toLowerCase();

    return (
        <div className="marketplace">

            {/* ================= HEADER ================= */}
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
                        <label htmlFor="profile-search" className="nf-visually-hidden">
                            Search products
                        </label>
                        <input
                            id="profile-search"
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
                        {isAuthenticated ? (
                            <button
                                type="button"
                                className="marketplace-login"
                                onClick={logout}
                            >
                                Sign Out
                            </button>
                        ) : (
                            <Link to="/login" className="marketplace-login">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* ================= NAV ================= */}
            <nav className="marketplace-nav" aria-label="Primary">
                <div className="marketplace-nav-inner">
                    <Link to="/">Home</Link>
                    <Link to="/products">All Products</Link>
                    <Link to="/categories">Categories</Link>
                    <Link to="/stores">Stores</Link>
                    <Link to="/products?new=true">New Arrivals</Link>
                    <Link to="/products?featured=true">Featured</Link>
                    <Link to="/products?sale=true">Deals</Link>
                </div>
            </nav>

            <main className="marketplace-container nf-profile-main">

                {/* ================= HERO ================= */}
                <section
                    className={`nf-profile-hero ${!isAuthenticated ? "is-guest" : ""}`}
                    aria-labelledby="profile-title"
                >
                    <div className="nf-profile-hero-bg" aria-hidden="true" />

                    <div className="nf-profile-hero-inner">
                        <div className="nf-profile-avatar" aria-hidden="true">
                            {isAuthenticated ? initials : <IconUser />}
                        </div>

                        <div className="nf-profile-hero-text">
                            <span className="nf-profile-eyebrow">MY ACCOUNT</span>

                            {isAuthenticated ? (
                                <>
                                    <h1 id="profile-title">
                                        Welcome back, {displayName}
                                    </h1>
                                    <p>
                                        {roleLabel === "admin"
                                            ? "Administrator access · manage orders, sellers and marketplace activity."
                                            : "Manage your orders, addresses and marketplace activity."}
                                    </p>

                                    <div className="nf-profile-badges">
                                        <span className={`nf-role-badge nf-role-${roleLabel || "user"}`}>
                                            <IconShield /> {user.role}
                                        </span>
                                        {user.email && (
                                            <span className="nf-meta-badge">{user.email}</span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1 id="profile-title">Your Profile</h1>
                                    <p>
                                        Sign in to manage your account, orders,
                                        addresses and marketplace activity.
                                    </p>

                                    <div className="nf-profile-hero-actions">
                                        <Link to="/login" className="marketplace-primary-btn">
                                            Sign In
                                        </Link>
                                        <Link to="/products" className="marketplace-secondary-btn">
                                            Continue Shopping
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* ================= BODY ================= */}
                <div className="nf-profile-layout">

                    {/* ------- Sidebar ------- */}
                    <aside className="nf-profile-sidebar" aria-label="Account navigation">
                        <h2 className="nf-profile-sidebar-title">Account</h2>

                        <nav className="nf-profile-sidebar-nav">
                            <Link to="/orders" className="nf-sidebar-link">
                                <span className="nf-sidebar-icon"><IconOrders /></span>
                                <span>
                                    <strong>My Orders</strong>
                                    <small>Track and view past purchases</small>
                                </span>
                            </Link>

                            <Link to="/wishlist" className="nf-sidebar-link">
                                <span className="nf-sidebar-icon"><IconHeart /></span>
                                <span>
                                    <strong>Wishlist</strong>
                                    <small>Products you saved for later</small>
                                </span>
                            </Link>

                            <Link to="/addresses" className="nf-sidebar-link">
                                <span className="nf-sidebar-icon"><IconPin /></span>
                                <span>
                                    <strong>Delivery Addresses</strong>
                                    <small>Manage where we deliver</small>
                                </span>
                            </Link>

                            {isAuthenticated && roleLabel === "admin" && (
                                <Link to="/admin" className="nf-sidebar-link">
                                    <span className="nf-sidebar-icon"><IconShield /></span>
                                    <span>
                                        <strong>Admin Dashboard</strong>
                                        <small>Manage the marketplace</small>
                                    </span>
                                </Link>
                            )}

                            {isAuthenticated && (
                                <Link to="/seller" className="nf-sidebar-link">
                                    <span className="nf-sidebar-icon"><IconStore /></span>
                                    <span>
                                        <strong>Seller Center</strong>
                                        <small>Manage your store</small>
                                    </span>
                                </Link>
                            )}

                            {isAuthenticated && (
                                <Link to="/profile/settings" className="nf-sidebar-link">
                                    <span className="nf-sidebar-icon"><IconSettings /></span>
                                    <span>
                                        <strong>Settings</strong>
                                        <small>Account and preferences</small>
                                    </span>
                                </Link>
                            )}
                        </nav>

                        {isAuthenticated && (
                            <button
                                type="button"
                                className="nf-sidebar-signout"
                                onClick={logout}
                            >
                                Sign Out
                            </button>
                        )}
                    </aside>

                    {/* ------- Main ------- */}
                    <section className="nf-profile-content" aria-label="Account overview">
                        {isAuthenticated ? (
                            <>
                                <div className="nf-profile-section-heading">
                                    <h2>Quick actions</h2>
                                    <p>Jump straight into the areas you use most.</p>
                                </div>

                                <div className="nf-quick-grid">
                                    <Link to="/orders" className="nf-quick-card">
                                        <span className="nf-quick-icon"><IconOrders /></span>
                                        <strong>My Orders</strong>
                                        <small>View orders and delivery status</small>
                                        <span className="nf-quick-arrow" aria-hidden="true">→</span>
                                    </Link>

                                    <Link to="/wishlist" className="nf-quick-card">
                                        <span className="nf-quick-icon"><IconHeart /></span>
                                        <strong>Wishlist</strong>
                                        <small>Your saved favourites</small>
                                        <span className="nf-quick-arrow" aria-hidden="true">→</span>
                                    </Link>

                                    <Link to="/addresses" className="nf-quick-card">
                                        <span className="nf-quick-icon"><IconPin /></span>
                                        <strong>Addresses</strong>
                                        <small>Delivery locations</small>
                                        <span className="nf-quick-arrow" aria-hidden="true">→</span>
                                    </Link>

                                    {roleLabel === "admin" ? (
                                        <Link to="/admin" className="nf-quick-card nf-quick-admin">
                                            <span className="nf-quick-icon"><IconShield /></span>
                                            <strong>Admin Dashboard</strong>
                                            <small>Manage the marketplace</small>
                                            <span className="nf-quick-arrow" aria-hidden="true">→</span>
                                        </Link>
                                    ) : (
                                        <Link to="/seller" className="nf-quick-card">
                                            <span className="nf-quick-icon"><IconStore /></span>
                                            <strong>Seller Center</strong>
                                            <small>Start selling on Nila Fashion</small>
                                            <span className="nf-quick-arrow" aria-hidden="true">→</span>
                                        </Link>
                                    )}
                                </div>

                                <div className="nf-profile-note">
                                    <IconShield />
                                    <div>
                                        <strong>Your account is secure</strong>
                                        <p>
                                            We use encrypted sessions and M-Pesa-secured
                                            checkout. Never share your password with anyone.
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="nf-profile-guest">
                                <h2>Sign in to unlock your account</h2>
                                <p>
                                    Track orders, save favourites, and check out faster
                                    with a Nila Fashion account.
                                </p>

                                <ul className="nf-guest-benefits">
                                    <li><span>✓</span> Track every order in real time</li>
                                    <li><span>✓</span> Save products to your wishlist</li>
                                    <li><span>✓</span> Faster M-Pesa checkout</li>
                                    <li><span>✓</span> Exclusive deals for members</li>
                                </ul>

                                <div className="nf-profile-guest-actions">
                                    <Link to="/login" className="marketplace-primary-btn">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="marketplace-secondary-btn">
                                        Create an account
                                    </Link>
                                </div>
                            </div>
                        )}
                    </section>

                </div>
            </main>
        </div>
    );
}
