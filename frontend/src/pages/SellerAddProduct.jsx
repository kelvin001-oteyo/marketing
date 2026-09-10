import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

function getCategories(data) {
    if (Array.isArray(data)) return data;
    return data?.results || data?.categories || [];
}

export default function SellerAddProduct() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] =
        useState(true);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        name: "",
        brand: "",
        category: "",
        description: "",
        price: "",
        discount_price: "",
        status: "ACTIVE",
        featured: false,
        new_arrival: true,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            const response = await api.get(
                "/categories/?page_size=100"
            );

            setCategories(getCategories(response.data));
        } catch (err) {
            console.error(err);
            setError("Unable to load categories.");
        } finally {
            setLoadingCategories(false);
        }
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!form.name.trim()) {
            setError("Product name is required.");
            return;
        }

        if (!form.category) {
            setError("Please select a category.");
            return;
        }

        if (!form.price || Number(form.price) <= 0) {
            setError("Enter a valid product price.");
            return;
        }

        if (
            form.discount_price &&
            Number(form.discount_price) >= Number(form.price)
        ) {
            setError(
                "Discount price must be lower than the original price."
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: form.name.trim(),
                brand: form.brand.trim(),
                category: Number(form.category),
                description: form.description.trim(),
                price: form.price,
                discount_price:
                    form.discount_price || null,
                status: form.status,
                featured: form.featured,
                new_arrival: form.new_arrival,
            };

            const response = await api.post(
                "/products/",
                payload
            );

            setSuccess("Product created successfully.");

            const productId = response.data?.id;

            setTimeout(() => {
                if (productId) {
                    navigate(
                        `/seller/products/${productId}/variants`
                    );
                } else {
                    navigate("/seller/products");
                }
            }, 700);
        } catch (err) {
            console.error(err);

            const data = err.response?.data;

            setError(
                data?.detail ||
                data?.name?.[0] ||
                data?.category?.[0] ||
                "Unable to create product."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="marketplace-page seller-add-product-page">
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
                        <Link to="/seller/store">
                            My Store
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="marketplace-container marketplace-main">
                <div className="marketplace-breadcrumb">
                    <Link to="/seller/products">
                        Products
                    </Link>
                    <span>/</span>
                    <span>Add Product</span>
                </div>

                <section className="seller-page-heading">
                    <div>
                        <span className="seller-eyebrow">
                            SELLER CENTER
                        </span>
                        <h1>Add Product</h1>
                        <p>
                            Create a new product for your marketplace
                            store.
                        </p>
                    </div>

                    <Link
                        to="/seller/products"
                        className="marketplace-secondary-btn"
                    >
                        Cancel
                    </Link>
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

                <form
                    className="seller-product-form"
                    onSubmit={handleSubmit}
                >
                    <section className="seller-form-card">
                        <div className="seller-form-card-header">
                            <h2>Basic Information</h2>
                            <p>
                                Tell customers what you are selling.
                            </p>
                        </div>

                        <div className="seller-form-grid">
                            <label>
                                Product Name
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Men's Cotton T-Shirt"
                                />
                            </label>

                            <label>
                                Brand
                                <input
                                    name="brand"
                                    value={form.brand}
                                    onChange={handleChange}
                                    placeholder="Brand name"
                                />
                            </label>

                            <label>
                                Category
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    disabled={
                                        loadingCategories
                                    }
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
                            </label>

                            <label>
                                Status
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="ACTIVE">
                                        Active
                                    </option>
                                    <option value="DRAFT">
                                        Draft
                                    </option>
                                </select>
                            </label>

                            <label className="seller-full-width">
                                Description
                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={handleChange}
                                    rows="6"
                                    placeholder="Describe the product, materials, fit, quality and other important details..."
                                />
                            </label>
                        </div>
                    </section>

                    <section className="seller-form-card">
                        <div className="seller-form-card-header">
                            <h2>Pricing</h2>
                            <p>
                                Set the selling price and optional
                                discount.
                            </p>
                        </div>

                        <div className="seller-form-grid">
                            <label>
                                Original Price
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </label>

                            <label>
                                Discount Price
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="discount_price"
                                    value={
                                        form.discount_price
                                    }
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </label>
                        </div>
                    </section>

                    <section className="seller-form-card">
                        <div className="seller-form-card-header">
                            <h2>Marketplace Settings</h2>
                        </div>

                        <div className="seller-checkbox-grid">
                            <label className="seller-checkbox">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={
                                        form.featured
                                    }
                                    onChange={handleChange}
                                />
                                <span>
                                    <strong>
                                        Featured Product
                                    </strong>
                                    <small>
                                        Highlight this product in
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
                                    onChange={handleChange}
                                />
                                <span>
                                    <strong>
                                        New Arrival
                                    </strong>
                                    <small>
                                        Show this product as a new
                                        arrival.
                                    </small>
                                </span>
                            </label>
                        </div>
                    </section>

                    <div className="seller-form-submit">
                        <Link
                            to="/seller/products"
                            className="marketplace-secondary-btn"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="marketplace-primary-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Creating..."
                                : "Create Product"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}