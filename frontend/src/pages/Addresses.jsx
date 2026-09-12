import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/marketplace.css";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconPin = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const IconPlus = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
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

const IconPhone = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
);

const IconHome = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
    </svg>
);

const IconNote = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
    </svg>
);

/* =========================================================
   ADDRESSES
========================================================= */

export default function Addresses() {
    const [showForm, setShowForm] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        address: "",
        city: "",
        county: "",
        delivery_notes: "",
    });

    function handleChange(e) {
        setForm((previous) => ({
            ...previous,
            [e.target.name]: e.target.value,
        }));
    }

    function addAddress(e) {
        e.preventDefault();

        setAddresses((previous) => [
            ...previous,
            { id: Date.now(), ...form },
        ]);

        setForm({
            full_name: "",
            phone: "",
            address: "",
            city: "",
            county: "",
            delivery_notes: "",
        });

        setShowForm(false);
    }

    function removeAddress(id) {
        setAddresses((previous) =>
            previous.filter((address) => address.id !== id)
        );
    }

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
                        <label htmlFor="addr-search" className="nf-visually-hidden">
                            Search products
                        </label>
                        <input
                            id="addr-search"
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
                        <Link to="/profile" className="marketplace-login">
                            My Account
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
                    <Link to="/profile" className="active">Account</Link>
                </div>
            </nav>

            <main className="marketplace-container nf-addresses-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link to="/profile">Account</Link>
                    <span aria-hidden="true">/</span>
                    <span>Delivery Addresses</span>
                </nav>

                {/* ---- Heading ---- */}
                <header className="nf-page-heading">
                    <div>
                        <span className="section-eyebrow">MY ACCOUNT</span>
                        <h1>Delivery Addresses</h1>
                        <p>
                            Save your delivery information for faster
                            checkout.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="nf-btn-primary"
                        onClick={() => setShowForm((v) => !v)}
                        aria-expanded={showForm}
                    >
                        {showForm ? (
                            <>Cancel</>
                        ) : (
                            <>
                                <IconPlus /> Add Address
                            </>
                        )}
                    </button>
                </header>

                {/* ---- Add form ---- */}
                {showForm && (
                    <form
                        className="nf-address-form"
                        onSubmit={addAddress}
                        aria-label="New delivery address"
                    >
                        <div className="nf-address-form-head">
                            <span className="nf-form-icon">
                                <IconPin />
                            </span>
                            <div>
                                <h2>New delivery address</h2>
                                <p>
                                    Fill in the details below. You can edit or
                                    remove saved addresses any time.
                                </p>
                            </div>
                        </div>

                        <div className="nf-form-grid">
                            <label>
                                Full name
                                <input
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    required
                                />
                            </label>

                            <label>
                                Phone
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="e.g. 0712345678"
                                    required
                                />
                            </label>

                            <label className="nf-form-full">
                                Address
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    autoComplete="street-address"
                                    placeholder="Street, building or estate"
                                    required
                                />
                            </label>

                            <label>
                                City
                                <input
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    autoComplete="address-level2"
                                    required
                                />
                            </label>

                            <label>
                                County
                                <input
                                    name="county"
                                    value={form.county}
                                    onChange={handleChange}
                                    autoComplete="address-level1"
                                    required
                                />
                            </label>

                            <label className="nf-form-full">
                                Delivery notes <span>(optional)</span>
                                <input
                                    name="delivery_notes"
                                    value={form.delivery_notes}
                                    onChange={handleChange}
                                    placeholder="Gate code, landmark, preferred time…"
                                />
                            </label>
                        </div>

                        <div className="nf-form-actions">
                            <button
                                type="button"
                                className="nf-btn-ghost"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="nf-btn-primary">
                                Save Address
                            </button>
                        </div>
                    </form>
                )}

                {/* ---- List / empty ---- */}
                {addresses.length === 0 ? (
                    <section className="nf-empty-state" aria-live="polite">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconPin />
                        </div>
                        <h2>No saved addresses yet</h2>
                        <p>
                            Add a delivery address to make checkout faster and
                            smoother.
                        </p>
                        {!showForm && (
                            <button
                                type="button"
                                className="nf-btn-primary"
                                onClick={() => setShowForm(true)}
                            >
                                <IconPlus /> Add your first address
                            </button>
                        )}
                    </section>
                ) : (
                    <section
                        className="nf-address-grid"
                        aria-label="Saved delivery addresses"
                    >
                        {addresses.map((address, index) => (
                            <article
                                key={address.id}
                                className={`nf-address-card ${
                                    index === 0 ? "is-default" : ""
                                }`}
                            >
                                {index === 0 && (
                                    <span className="nf-default-badge">
                                        Default
                                    </span>
                                )}

                                <header className="nf-address-card-head">
                                    <div className="nf-address-avatar" aria-hidden="true">
                                        {address.full_name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <strong>{address.full_name}</strong>
                                        <span>
                                            <IconPhone /> {address.phone}
                                        </span>
                                    </div>
                                </header>

                                <div className="nf-address-body">
                                    <p>
                                        <IconHome /> {address.address}
                                    </p>
                                    <p>
                                        {address.city}
                                        {address.county
                                            ? `, ${address.county}`
                                            : ""}
                                    </p>

                                    {address.delivery_notes && (
                                        <p className="nf-address-notes">
                                            <IconNote /> {address.delivery_notes}
                                        </p>
                                    )}
                                </div>

                                <footer className="nf-address-card-foot">
                                    <button
                                        type="button"
                                        className="nf-btn-danger-ghost"
                                        onClick={() => removeAddress(address.id)}
                                        aria-label={`Remove address for ${address.full_name}`}
                                    >
                                        <IconTrash />
                                        <span>Remove</span>
                                    </button>
                                </footer>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}
