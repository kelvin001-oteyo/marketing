import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const MEDIA_BASE_URL = "http://127.0.0.1:8000";

function getImageUrl(image) {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${MEDIA_BASE_URL}${image}`;
}

export default function SellerStore() {
    const [store, setStore] = useState(null);

    const [form, setForm] = useState({
        store_name: "",
        description: "",
        location: "",
        phone: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadStore();
    }, []);

    async function loadStore() {
        try {
            setLoading(true);

            const response = await api.get(
                "/sellers/me/"
            );

            const data = response.data;

            setStore(data);

            setForm({
                store_name:
                    data.store_name || "",
                description:
                    data.description || "",
                location:
                    data.location || "",
                phone:
                    data.phone || "",
            });
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load your store."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        setForm((previous) => ({
            ...previous,
            [e.target.name]: e.target.value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await api.patch(
                "/sellers/me/",
                form
            );

            setStore(response.data);

            setSuccess(
                "Store information updated successfully."
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to update your store."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="marketplace-state">
                Loading store...
            </div>
        );
    }

    return (
        <div className="marketplace-page seller-store-page">
            <header className="marketplace-header">
                <div className="marketplace-container marketplace-header-inner">
                    <Link to="/" className="marketplace-logo">
                        Oteyo<span>Market</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/seller/dashboard">
                            Dashboard
                        </Link>
                        <Link to="/seller/products">
                            Products
                        </Link>
                        <Link to="/seller/inventory">
                            Inventory
                        </Link>
                        <Link to="/seller/orders">
                            Orders
                        </Link>
                        <Link
                            className="active"
                            to="/seller/store"
                        >
                            My Store
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="marketplace-container marketplace-main">
                <div className="marketplace-breadcrumb">
                    <Link to="/seller/dashboard">
                        Seller Center
                    </Link>
                    <span>/</span>
                    <span>My Store</span>
                </div>

                <section className="seller-page-heading">
                    <div>
                        <span className="seller-eyebrow">
                            STORE MANAGEMENT
                        </span>

                        <h1>My Store</h1>

                        <p>
                            Manage how your store appears to
                            customers.
                        </p>
                    </div>

                    {store && (
                        <Link
                            to={`/stores/${
                                store.store_slug ||
                                store.slug ||
                                store.id
                            }`}
                            className="marketplace-secondary-btn"
                        >
                            View Public Store
                        </Link>
                    )}
                </section>

                {error && (
                    <div className="marketplace-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="marketplace-success">
                        {success}
                    </div>
                )}

                {store && (
                    <section className="seller-store-preview">
                        <div
                            className="seller-store-preview-banner"
                            style={{
                                backgroundImage:
                                    store.banner
                                        ? `url(${getImageUrl(
                                              store.banner
                                          )})`
                                        : "none",
                            }}
                        >
                            <div className="seller-store-preview-overlay">
                                <div className="seller-store-logo">
                                    {store.logo ? (
                                        <img
                                            src={getImageUrl(
                                                store.logo
                                            )}
                                            alt={
                                                store.store_name
                                            }
                                        />
                                    ) : (
                                        <span>
                                            {(
                                                store.store_name ||
                                                "S"
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h2>
                                        {
                                            store.store_name
                                        }
                                    </h2>

                                    <p>
                                        {store.verified
                                            ? "Verified Seller"
                                            : "Seller Store"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <form
                    className="seller-product-form"
                    onSubmit={handleSubmit}
                >
                    <section className="seller-form-card">
                        <div className="seller-form-card-header">
                            <h2>Store Information</h2>

                            <p>
                                Keep your store information
                                accurate and professional.
                            </p>
                        </div>

                        <div className="seller-form-grid">
                            <label>
                                Store Name
                                <input
                                    name="store_name"
                                    value={
                                        form.store_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </label>

                            <label>
                                Phone
                                <input
                                    name="phone"
                                    value={
                                        form.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </label>

                            <label>
                                Location
                                <input
                                    name="location"
                                    value={
                                        form.location
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Kisumu, Kenya"
                                />
                            </label>

                            <label className="seller-full-width">
                                Store Description
                                <textarea
                                    name="description"
                                    rows="7"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Tell customers about your store..."
                                />
                            </label>
                        </div>
                    </section>

                    <div className="seller-form-submit">
                        <button
                            type="submit"
                            className="marketplace-primary-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Store Changes"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}