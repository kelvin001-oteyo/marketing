import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconStore = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M3 9h18v11H3z" />
        <path d="M9 20v-6h6v6" />
    </svg>
);

const IconUsers = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
    </svg>
);

const IconGrowth = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-6" />
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

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
    </svg>
);

/* =========================================================
   SELLER APPLICATION
========================================================= */

export default function SellerApplication() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        store_name: "",
        description: "",
        location: "",
        phone: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* ---------- auto-dismiss success ---------- */
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 6000);
        return () => clearTimeout(timer);
    }, [success]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!form.store_name.trim()) {
            setError("Please enter your store name.");
            return;
        }
        if (!form.phone.trim()) {
            setError("Please enter your phone number.");
            return;
        }
        if (!form.location.trim()) {
            setError("Please enter your business location.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/sellers/application/", {
                store_name: form.store_name.trim(),
                description: form.description.trim(),
                location: form.location.trim(),
                phone: form.phone.trim(),
            });

            setSuccess(
                response.data?.detail ||
                    response.data?.message ||
                    "Your seller application has been submitted successfully."
            );

            setForm({
                store_name: "",
                description: "",
                location: "",
                phone: "",
            });
        } catch (err) {
            console.error("Seller application failed:", err);

            if (err.response?.status === 401) {
                setError(
                    "Please sign in before submitting a seller application."
                );
            } else {
                const data = err.response?.data;

                if (typeof data === "string") {
                    setError(data);
                } else if (data?.detail) {
                    setError(data.detail);
                } else if (data) {
                    const firstError = Object.values(data).flat().find(Boolean);
                    setError(
                        firstError || "We could not submit your application."
                    );
                } else {
                    setError(
                        "We could not submit your application. Please try again."
                    );
                }
            }
        } finally {
            setLoading(false);
        }
    }

    const descriptionCount = form.description.length;

    return (
        <div className="marketplace">
            <Header />

            <main className="nf-sa-main">

                {/* ================= HERO ================= */}
                <section className="nf-sa-hero" aria-labelledby="nf-sa-hero-title">
                    <div className="nf-sa-hero-bg" aria-hidden="true" />
                    <div className="nf-sa-hero-overlay" aria-hidden="true" />

                    <div className="nf-sa-hero-inner">
                        <div className="nf-sa-hero-text">
                            <span className="section-eyebrow">SELL ON NILA FASHION</span>
                            <h1 id="nf-sa-hero-title">
                                Turn your products into a growing online
                                business.
                            </h1>
                            <p>
                                Create your store, reach more customers and
                                manage your products from one marketplace.
                            </p>

                            <div className="nf-sa-benefits">
                                <div>
                                    <span className="nf-sa-benefit-icon">
                                        <IconUsers />
                                    </span>
                                    <strong>Reach customers</strong>
                                    <span>Showcase your products to shoppers.</span>
                                </div>
                                <div>
                                    <span className="nf-sa-benefit-icon">
                                        <IconStore />
                                    </span>
                                    <strong>Manage your store</strong>
                                    <span>Control products, inventory and orders.</span>
                                </div>
                                <div>
                                    <span className="nf-sa-benefit-icon">
                                        <IconGrowth />
                                    </span>
                                    <strong>Grow your business</strong>
                                    <span>Build a trusted marketplace presence.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= LAYOUT ================= */}
                <section className="nf-sa-layout">

                    {/* ---- Info column ---- */}
                    <aside className="nf-sa-info" aria-labelledby="nf-sa-steps-title">
                        <span className="section-eyebrow">GET STARTED</span>
                        <h2 id="nf-sa-steps-title">Apply to become a seller</h2>
                        <p>
                            Tell us about your store and business. Your
                            application will be reviewed before your seller
                            account is activated.
                        </p>

                        <ol className="nf-sa-steps">
                            <li className="nf-sa-step">
                                <span className="nf-sa-step-num">01</span>
                                <div>
                                    <strong>Submit your application</strong>
                                    <p>Provide your basic store information.</p>
                                </div>
                            </li>
                            <li className="nf-sa-step">
                                <span className="nf-sa-step-num">02</span>
                                <div>
                                    <strong>Application review</strong>
                                    <p>
                                        The marketplace team reviews your
                                        application.
                                    </p>
                                </div>
                            </li>
                            <li className="nf-sa-step">
                                <span className="nf-sa-step-num">03</span>
                                <div>
                                    <strong>Start selling</strong>
                                    <p>
                                        Once approved, you can manage your
                                        store and products.
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </aside>

                    {/* ---- Form column ---- */}
                    <section className="nf-sa-card" aria-labelledby="nf-sa-form-title">
                        <header className="nf-sa-card-head">
                            <span className="section-eyebrow">APPLICATION</span>
                            <h2 id="nf-sa-form-title">Store application</h2>
                            <p>Enter accurate information about your business.</p>
                        </header>

                        {error && (
                            <div className="nf-sa-banner nf-sa-banner-error" role="alert">
                                <IconWarning />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="nf-sa-banner nf-sa-banner-success" role="status">
                                <IconCheck />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="nf-sa-form" noValidate>
                            <label className="nf-sa-field">
                                Store name <span className="nf-sa-req">*</span>
                                <input
                                    name="store_name"
                                    type="text"
                                    value={form.store_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Nila Threads"
                                    maxLength={150}
                                    autoComplete="organization"
                                    required
                                />
                            </label>

                            <label className="nf-sa-field">
                                Phone number <span className="nf-sa-req">*</span>
                                <input
                                    name="phone"
                                    type="tel"
                                    inputMode="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. 0712 345 678"
                                    maxLength={20}
                                    autoComplete="tel"
                                    required
                                />
                            </label>

                            <label className="nf-sa-field">
                                Business location <span className="nf-sa-req">*</span>
                                <input
                                    name="location"
                                    type="text"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Kisumu, Kenya"
                                    maxLength={255}
                                    autoComplete="address-level2"
                                    required
                                />
                            </label>

                            <label className="nf-sa-field">
                                Store description
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Tell customers what your store sells…"
                                    rows={5}
                                />
                                <small className="nf-sa-counter">
                                    {descriptionCount} characters
                                </small>
                            </label>

                            <button
                                type="submit"
                                className="nf-sa-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Submitting…"
                                    : "Submit Seller Application"}
                            </button>
                        </form>

                        <footer className="nf-sa-card-foot">
                            <span>Already have a store?</span>
                            <Link to="/stores">
                                Browse Seller Stores <IconArrow />
                            </Link>
                        </footer>
                    </section>
                </section>
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
                    <label htmlFor="sa-header-search" className="nf-visually-hidden">
                        Search products
                    </label>
                    <input
                        id="sa-header-search"
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
                        A modern marketplace connecting customers with
                        trusted sellers.
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
                    <Link to="/seller/dashboard">Seller dashboard</Link>
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
