import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const initialForm = {
    name: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    discount_price: "",
    status: "DRAFT",
    featured: false,
    new_arrival: false,
};

const getCategories = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.categories)) return data.categories;
    return [];
};

export default function SellerEditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError("");

            try {
                const [productResponse, categoriesResponse] =
                    await Promise.all([
                        api.get(`/products/${id}/`),
                        api.get("/categories/"),
                    ]);

                const product = productResponse.data;

                setCategories(
                    getCategories(categoriesResponse.data)
                );

                setForm({
                    name: product.name || "",
                    brand: product.brand || "",
                    category:
                        typeof product.category === "object"
                            ? product.category?.id || ""
                            : product.category || "",
                    description: product.description || "",
                    price: product.price ?? "",
                    discount_price:
                        product.discount_price ?? "",
                    status: product.status || "DRAFT",
                    featured: Boolean(product.featured),
                    new_arrival: Boolean(product.new_arrival),
                });
            } catch (err) {
                console.error(
                    "Failed to load product:",
                    err
                );

                if (err.response?.status === 401) {
                    setError(
                        "You need to sign in as a seller to edit products."
                    );
                } else if (err.response?.status === 403) {
                    setError(
                        "You do not have permission to edit this product."
                    );
                } else if (err.response?.status === 404) {
                    setError(
                        "The product could not be found."
                    );
                } else {
                    setError(
                        err.response?.data?.detail ||
                            "Unable to load the product. Please try again."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const validateForm = () => {
        if (!form.name.trim()) {
            return "Product name is required.";
        }

        if (!form.category) {
            return "Please select a category.";
        }

        if (!form.price || Number(form.price) <= 0) {
            return "Please enter a valid product price.";
        }

        if (
            form.discount_price &&
            Number(form.discount_price) >= Number(form.price)
        ) {
            return (
                "Discount price must be lower than the original price."
            );
        }

        return "";
    };

    const formatBackendError = (data) => {
        if (!data) {
            return "Unable to update the product.";
        }

        if (typeof data === "string") {
            return data;
        }

        if (data.detail) {
            return data.detail;
        }

        const messages = Object.entries(data)
            .map(([field, value]) => {
                const message = Array.isArray(value)
                    ? value.join(" ")
                    : String(value);

                return `${field}: ${message}`;
            })
            .join(" ");

        return (
            messages ||
            "Unable to update the product."
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name: form.name.trim(),
                brand: form.brand.trim(),
                category: Number(form.category),
                description: form.description.trim(),
                price: form.price,
                discount_price: form.discount_price
                    ? form.discount_price
                    : null,
                status: form.status,
                featured: form.featured,
                new_arrival: form.new_arrival,
            };

            await api.patch(
                `/products/${id}/`,
                payload
            );

            setSuccess(
                "Product updated successfully."
            );

            setTimeout(() => {
                navigate(
                    `/seller/products/${id}/variants`
                );
            }, 700);
        } catch (err) {
            console.error(
                "Failed to update product:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please sign in again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    err.response?.data?.detail ||
                        "You do not have permission to edit this product."
                );
            } else {
                setError(
                    formatBackendError(
                        err.response?.data
                    )
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="marketplace-page seller-add-product-page">
                <header className="marketplace-header">
                    <div className="marketplace-header-inner">
                        <Link
                            to="/"
                            className="marketplace-logo"
                        >
                            <span className="marketplace-logo-mark">
                                C
                            </span>
                            <span>
                                Clothing Market
                            </span>
                        </Link>
                    </div>
                </header>

                <main className="marketplace-main">
                    <section className="marketplace-loading">
                        <div className="marketplace-spinner"></div>
                        <p>
                            Loading product...
                        </p>
                    </section>
                </main>
            </div>
        );
    }

    if (error && !form.name) {
        return (
            <div className="marketplace-page seller-add-product-page">
                <header className="marketplace-header">
                    <div className="marketplace-header-inner">
                        <Link
                            to="/"
                            className="marketplace-logo"
                        >
                            <span className="marketplace-logo-mark">
                                C
                            </span>
                            <span>
                                Clothing Market
                            </span>
                        </Link>
                    </div>
                </header>

                <main className="marketplace-main">
                    <div className="marketplace-error-box">
                        <strong>
                            Unable to load product
                        </strong>

                        <p>{error}</p>

                        <Link
                            to="/seller/products"
                            className="marketplace-primary-button"
                        >
                            Back to Products
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="marketplace-page seller-add-product-page">
            <header className="marketplace-header">
                <div className="marketplace-header-inner">
                    <Link
                        to="/"
                        className="marketplace-logo"
                    >
                        <span className="marketplace-logo-mark">
                            C
                        </span>
                        <span>
                            Clothing Market
                        </span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/">
                            Home
                        </Link>

                        <Link to="/products">
                            Products
                        </Link>

                        <Link to="/categories">
                            Categories
                        </Link>

                        <Link to="/stores">
                            Stores
                        </Link>
                    </nav>

                    <div className="marketplace-header-actions">
                        <Link
                            to="/wishlist"
                            className="marketplace-header-link"
                        >
                            Wishlist
                        </Link>

                        <Link
                            to="/cart"
                            className="marketplace-header-link"
                        >
                            Cart
                        </Link>

                        <Link
                            to="/seller/dashboard"
                            className="marketplace-header-button"
                        >
                            Seller Center
                        </Link>
                    </div>
                </div>
            </header>

            <main className="marketplace-main">
                <div className="seller-product-form-breadcrumb">
                    <Link to="/">
                        Home
                    </Link>

                    <span>/</span>

                    <Link to="/seller/dashboard">
                        Seller Center
                    </Link>

                    <span>/</span>

                    <Link to="/seller/products">
                        My Products
                    </Link>

                    <span>/</span>

                    <span>
                        Edit Product
                    </span>
                </div>

                <section className="seller-product-form-heading">
                    <div>
                        <h1>
                            Edit Product
                        </h1>

                        <p>
                            Update your product
                            information, pricing and
                            marketplace settings.
                        </p>
                    </div>

                    <Link
                        to="/seller/products"
                        className="marketplace-secondary-button"
                    >
                        Back to Products
                    </Link>
                </section>

                {error && (
                    <div className="seller-form-alert error">
                        <strong>
                            Update failed
                        </strong>

                        <span>
                            {error}
                        </span>
                    </div>
                )}

                {success && (
                    <div className="seller-form-alert success">
                        <strong>
                            Product updated
                        </strong>

                        <span>
                            {success}
                        </span>
                    </div>
                )}

                <form
                    className="seller-product-form"
                    onSubmit={handleSubmit}
                >
                    <section className="seller-product-form-card">
                        <div className="seller-product-form-card-heading">
                            <div>
                                <h2>
                                    Basic Information
                                </h2>

                                <p>
                                    Update the main
                                    information customers
                                    see.
                                </p>
                            </div>
                        </div>

                        <div className="seller-form-grid">
                            <div className="seller-form-field full">
                                <label htmlFor="name">
                                    Product Name *
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Men's Premium Cotton T-Shirt"
                                    required
                                />

                                <small>
                                    Use a clear and
                                    descriptive product
                                    name.
                                </small>
                            </div>

                            <div className="seller-form-field">
                                <label htmlFor="brand">
                                    Brand
                                </label>

                                <input
                                    id="brand"
                                    name="brand"
                                    type="text"
                                    value={form.brand}
                                    onChange={handleChange}
                                    placeholder="e.g. Oteyo Fashion"
                                />
                            </div>

                            <div className="seller-form-field">
                                <label htmlFor="category">
                                    Category *
                                </label>

                                <select
                                    id="category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map(
                                        (category) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="seller-form-field full">
                                <label htmlFor="description">
                                    Product Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={handleChange}
                                    placeholder="Describe the product, material, fit, style and other useful information..."
                                    rows="7"
                                />

                                <small>
                                    Keep the description
                                    useful and accurate.
                                </small>
                            </div>
                        </div>
                    </section>

                    <section className="seller-product-form-card">
                        <div className="seller-product-form-card-heading">
                            <div>
                                <h2>
                                    Pricing
                                </h2>

                                <p>
                                    Update the normal and
                                    discounted selling
                                    price.
                                </p>
                            </div>
                        </div>

                        <div className="seller-form-grid">
                            <div className="seller-form-field">
                                <label htmlFor="price">
                                    Original Price (KES) *
                                </label>

                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="2500"
                                    required
                                />
                            </div>

                            <div className="seller-form-field">
                                <label htmlFor="discount_price">
                                    Discount Price (KES)
                                </label>

                                <input
                                    id="discount_price"
                                    name="discount_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        form.discount_price
                                    }
                                    onChange={handleChange}
                                    placeholder="1999"
                                />

                                <small>
                                    Leave empty if there is
                                    no discount.
                                </small>
                            </div>
                        </div>
                    </section>

                    <section className="seller-product-form-card">
                        <div className="seller-product-form-card-heading">
                            <div>
                                <h2>
                                    Listing Settings
                                </h2>

                                <p>
                                    Control the product's
                                    marketplace visibility.
                                </p>
                            </div>
                        </div>

                        <div className="seller-form-grid">
                            <div className="seller-form-field">
                                <label htmlFor="status">
                                    Product Status
                                </label>

                                <select
                                    id="status"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="DRAFT">
                                        Draft
                                    </option>

                                    <option value="ACTIVE">
                                        Active
                                    </option>

                                    <option value="ARCHIVED">
                                        Archived
                                    </option>
                                </select>

                                <small>
                                    Use Draft while preparing
                                    the listing and Active
                                    when it is ready for
                                    customers.
                                </small>
                            </div>

                            <div className="seller-form-options">
                                <label className="seller-checkbox">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={
                                            form.featured
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <span>
                                        <strong>
                                            Featured Product
                                        </strong>

                                        <small>
                                            Highlight this
                                            product in
                                            featured sections.
                                        </small>
                                    </span>
                                </label>

                                <label className="seller-checkbox">
                                    <input
                                        type="checkbox"
                                        name="new_arrival"
                                        checked={
                                            form.new_arrival
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <span>
                                        <strong>
                                            New Arrival
                                        </strong>

                                        <small>
                                            Mark this product
                                            as a new arrival.
                                        </small>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>

                    <section className="seller-product-next-step">
                        <div>
                            <strong>
                                Manage product variants
                            </strong>

                            <p>
                                After saving, you can manage
                                sizes, colors, SKUs and
                                variant stock.
                            </p>
                        </div>

                        <div className="seller-product-next-step-icon">
                            →
                        </div>
                    </section>

                    <div className="seller-product-form-actions">
                        <Link
                            to="/seller/products"
                            className="marketplace-secondary-button"
                        >
                            Cancel
                        </Link>

                        <Link
                            to={`/products/${id}`}
                            className="marketplace-secondary-button"
                        >
                            View Product
                        </Link>

                        <button
                            type="submit"
                            className="marketplace-primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving Changes..."
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
            </main>

            <footer className="marketplace-footer">
                <div className="marketplace-footer-inner">
                    <div>
                        <strong>
                            Clothing Market
                        </strong>

                        <p>
                            A modern marketplace connecting
                            clothing buyers with trusted
                            sellers.
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

                        <Link to="/seller/dashboard">
                            Seller Center
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}