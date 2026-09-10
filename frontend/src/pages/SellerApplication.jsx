import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

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

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
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

            const response = await api.post(
                "/sellers/application/",
                {
                    store_name: form.store_name.trim(),
                    description: form.description.trim(),
                    location: form.location.trim(),
                    phone: form.phone.trim(),
                }
            );

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
            console.error(
                "Seller application failed:",
                err
            );

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
                    const firstError = Object.values(data)
                        .flat()
                        .find(Boolean);

                    setError(
                        firstError ||
                            "We could not submit your application."
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

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <div className="marketplace-header-inner">
                    <Link
                        to="/"
                        className="marketplace-logo"
                    >
                        Oteyo<span>Store</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/">Home</Link>
                        <Link to="/products">
                            Products
                        </Link>
                        <Link to="/categories">
                            Categories
                        </Link>
                        <Link to="/stores">
                            Stores
                        </Link>
                        <Link to="/wishlist">
                            Wishlist
                        </Link>
                        <Link to="/cart">
                            Cart
                        </Link>
                        <Link to="/orders">
                            Orders
                        </Link>
                    </nav>

                    <div className="marketplace-header-actions">
                        <Link
                            to="/sell"
                            className="marketplace-seller-link"
                        >
                            Sell on OteyoStore
                        </Link>

                        <Link
                            to="/cart"
                            className="marketplace-cart-button"
                        >
                            Cart
                        </Link>
                    </div>
                </div>
            </header>

            <main className="marketplace-main">
                <section className="seller-application-hero">
                    <div className="seller-application-hero-content">
                        <span className="marketplace-eyebrow">
                            SELL ON OTEYOSTORE
                        </span>

                        <h1>
                            Turn your products into a
                            growing online business.
                        </h1>

                        <p>
                            Create your store, reach more
                            customers and manage your
                            products from one marketplace.
                        </p>

                        <div className="seller-benefits">
                            <div>
                                <strong>
                                    Reach customers
                                </strong>

                                <span>
                                    Showcase your products
                                    to shoppers.
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Manage your store
                                </strong>

                                <span>
                                    Control products,
                                    inventory and orders.
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Grow your business
                                </strong>

                                <span>
                                    Build a trusted
                                    marketplace presence.
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="seller-application-layout">
                    <div className="seller-application-info">
                        <span className="marketplace-eyebrow">
                            GET STARTED
                        </span>

                        <h2>
                            Apply to become a seller
                        </h2>

                        <p>
                            Tell us about your store and
                            business. Your application will
                            be reviewed before your seller
                            account is activated.
                        </p>

                        <div className="seller-steps">
                            <div className="seller-step">
                                <span>01</span>

                                <div>
                                    <strong>
                                        Submit your
                                        application
                                    </strong>

                                    <p>
                                        Provide your basic
                                        store information.
                                    </p>
                                </div>
                            </div>

                            <div className="seller-step">
                                <span>02</span>

                                <div>
                                    <strong>
                                        Application review
                                    </strong>

                                    <p>
                                        The marketplace team
                                        reviews your
                                        application.
                                    </p>
                                </div>
                            </div>

                            <div className="seller-step">
                                <span>03</span>

                                <div>
                                    <strong>
                                        Start selling
                                    </strong>

                                    <p>
                                        Once approved, you can
                                        manage your store and
                                        products.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="seller-application-card">
                        <div className="seller-form-heading">
                            <h2>
                                Store application
                            </h2>

                            <p>
                                Enter accurate information
                                about your business.
                            </p>
                        </div>

                        {error && (
                            <div className="marketplace-form-alert marketplace-form-alert-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="marketplace-form-alert marketplace-form-alert-success">
                                {success}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="seller-application-form"
                        >
                            <div className="marketplace-form-group">
                                <label htmlFor="store_name">
                                    Store Name
                                </label>

                                <input
                                    id="store_name"
                                    name="store_name"
                                    type="text"
                                    value={
                                        form.store_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Kelvin Fashion Store"
                                    maxLength={150}
                                    required
                                />
                            </div>

                            <div className="marketplace-form-group">
                                <label htmlFor="phone">
                                    Phone Number
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 0712 345 678"
                                    maxLength={20}
                                    required
                                />
                            </div>

                            <div className="marketplace-form-group">
                                <label htmlFor="location">
                                    Business Location
                                </label>

                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={
                                        form.location
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Kisumu, Kenya"
                                    maxLength={255}
                                    required
                                />
                            </div>

                            <div className="marketplace-form-group">
                                <label htmlFor="description">
                                    Store Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Tell customers what your store sells..."
                                    rows={5}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="marketplace-primary-button seller-submit-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Submitting..."
                                    : "Submit Seller Application"}
                            </button>
                        </form>

                        <div className="seller-form-footer">
                            <span>
                                Already have a store?
                            </span>

                            <Link to="/stores">
                                Browse Seller Stores
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="marketplace-footer">
                <div className="marketplace-footer-inner">
                    <div>
                        <Link
                            to="/"
                            className="marketplace-logo"
                        >
                            Oteyo<span>Store</span>
                        </Link>

                        <p>
                            A modern marketplace connecting
                            customers with trusted sellers.
                        </p>
                    </div>

                    <div className="marketplace-footer-links">
                        <Link to="/products">
                            Products
                        </Link>

                        <Link to="/categories">
                            Categories
                        </Link>

                        <Link to="/stores">
                            Stores
                        </Link>

                        <Link to="/orders">
                            Orders
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}