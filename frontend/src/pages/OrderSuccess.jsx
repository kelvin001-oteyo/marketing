import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/marketplace.css";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconCheck = () => (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
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

const IconTruck = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h11v9H3z" />
        <path d="M14 9h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
    </svg>
);

const IconBell = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

/* =========================================================
   ORDER SUCCESS
========================================================= */

function OrderSuccess() {
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const orderId = params.get("order");

    // Triggers the checkmark draw animation on mount
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    const nextSteps = [
        {
            icon: <IconCheck />,
            title: "Order received",
            desc: "We've received your order and confirmed your payment.",
            state: "done",
        },
        {
            icon: <IconBell />,
            title: "Being prepared",
            desc: "The seller will confirm and pack your order.",
            state: "active",
        },
        {
            icon: <IconTruck />,
            title: "On the way",
            desc: "We'll notify you once your order is out for delivery.",
            state: "pending",
        },
        {
            icon: <IconShield />,
            title: "Delivered",
            desc: "Track delivery and confirm receipt from your Orders page.",
            state: "pending",
        },
    ];

    return (
        <div className="marketplace">

            {/* ================= HEADER ================= */}
            <header className="marketplace-header">
                <div className="marketplace-header-inner">
                    <Link to="/" className="marketplace-logo" aria-label="Nila Fashion home">
                        <span className="marketplace-logo-mark">NF</span>
                        <span>Nila<strong>Fashion</strong></span>
                    </Link>

                    <div className="marketplace-header-actions">
                        <Link to="/wishlist" className="nf-header-link">
                            <span aria-hidden="true">♡</span>
                            <span>Wishlist</span>
                        </Link>
                        <Link to="/cart" className="nf-header-link">
                            <span aria-hidden="true">🛍</span>
                            <span>Cart</span>
                        </Link>
                        <Link to="/orders" className="marketplace-login">
                            My Orders
                        </Link>
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
                    <Link to="/orders">Orders</Link>
                    <Link to="/wishlist">Wishlist</Link>
                </div>
            </nav>

            <main className="nf-os-main">
                <section
                    className={`nf-os-card ${mounted ? "is-mounted" : ""}`}
                    aria-labelledby="nf-os-title"
                >
                    {/* ---- Success badge ---- */}
                    <div className="nf-os-badge" aria-hidden="true">
                        <span className="nf-os-badge-ring" />
                        <span className="nf-os-badge-icon">
                            <IconCheck />
                        </span>
                    </div>

                    <span className="nf-os-eyebrow">ORDER CONFIRMED</span>

                    <h1 id="nf-os-title">Thank you for your order!</h1>

                    <p className="nf-os-message">
                        Your order has been received successfully. We're
                        preparing it for processing and delivery.
                    </p>

                    {/* ---- Order number pill ---- */}
                    {orderId && (
                        <div className="nf-os-order-pill">
                            <span>Order number</span>
                            <strong>#{orderId}</strong>
                        </div>
                    )}

                    {/* ---- Actions ---- */}
                    <div className="nf-os-actions">
                        {orderId ? (
                            <Link
                                to={`/orders/${orderId}`}
                                className="nf-os-btn nf-os-btn-primary"
                            >
                                View Order <IconArrow />
                            </Link>
                        ) : (
                            <Link
                                to="/orders"
                                className="nf-os-btn nf-os-btn-primary"
                            >
                                View My Orders <IconArrow />
                            </Link>
                        )}

                        <Link
                            to="/products"
                            className="nf-os-btn nf-os-btn-outline"
                        >
                            <IconCart /> Continue Shopping
                        </Link>
                    </div>

                    {/* ---- Next steps ---- */}
                    <div className="nf-os-steps">
                        <h2>What happens next?</h2>

                        <ol className="nf-os-steps-list">
                            {nextSteps.map((step, index) => (
                                <li
                                    key={index}
                                    className={`nf-os-step is-${step.state}`}
                                >
                                    <span className="nf-os-step-icon" aria-hidden="true">
                                        {step.icon}
                                    </span>
                                    <div className="nf-os-step-info">
                                        <strong>{step.title}</strong>
                                        <p>{step.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* ---- Help note ---- */}
                    <div className="nf-os-note">
                        <IconShield />
                        <div>
                            <strong>Need help with this order?</strong>
                            <p>
                                Keep your order number handy and{" "}
                                <Link to="/contact">contact our support team</Link>.
                                We typically reply within 24 hours.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* ================= FOOTER ================= */}
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

export default OrderSuccess;
