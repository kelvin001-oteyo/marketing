import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const emptyVariant = {
    sku: "",
    size: "",
    color: "",
    price: "",
    stock_quantity: "",
    is_active: true,
};

const getVariants = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.variants)) return data.variants;
    if (Array.isArray(data?.items)) return data.items;
    return [];
};

const getImageUrl = (image) => {
    if (!image) return null;

    if (typeof image === "object") {
        image = image.image || image.url || image.src;
    }

    if (!image) return null;

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    return `http://127.0.0.1:8000${
        image.startsWith("/") ? "" : "/"
    }${image}`;
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
};

export default function SellerProductVariants() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);

    const [form, setForm] = useState(emptyVariant);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [productResponse, variantsResponse] =
                await Promise.all([
                    api.get(`/products/${id}/`),
                    api.get(`/products/${id}/variants/`),
                ]);

            setProduct(productResponse.data);
            setVariants(getVariants(variantsResponse.data));
        } catch (err) {
            console.error(
                "Failed to load product variants:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "You need to sign in as a seller to manage variants."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You do not have permission to manage variants for this product."
                );
            } else if (err.response?.status === 404) {
                setError(
                    "The product or its variants could not be found."
                );
            } else {
                setError(
                    err.response?.data?.detail ||
                        "Unable to load product variants."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const openAddForm = () => {
        setEditingVariant(null);
        setForm(emptyVariant);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (variant) => {
        setEditingVariant(variant);

        setForm({
            sku: variant.sku || "",
            size: variant.size || "",
            color: variant.color || "",
            price:
                variant.price === null ||
                variant.price === undefined
                    ? ""
                    : variant.price,
            stock_quantity:
                variant.stock_quantity ??
                variant.inventory?.quantity ??
                "",
            is_active:
                variant.is_active !== false,
        });

        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingVariant(null);
        setForm(emptyVariant);
    };

    const validateForm = () => {
        if (!form.sku.trim()) {
            return "SKU is required.";
        }

        if (!form.size.trim()) {
            return "Size is required.";
        }

        if (!form.color.trim()) {
            return "Color is required.";
        }

        if (
            form.price !== "" &&
            Number(form.price) < 0
        ) {
            return "Variant price cannot be negative.";
        }

        if (
            form.stock_quantity === "" ||
            Number(form.stock_quantity) < 0
        ) {
            return "Stock quantity must be zero or greater.";
        }

        return "";
    };

    const formatBackendError = (data) => {
        if (!data) {
            return "Unable to save the variant.";
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
            "Unable to save the variant."
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
                sku: form.sku.trim(),
                size: form.size.trim(),
                color: form.color.trim(),
                price:
                    form.price === ""
                        ? null
                        : form.price,
                stock_quantity: Number(
                    form.stock_quantity
                ),
                is_active: form.is_active,
            };

            if (editingVariant) {
                await api.patch(
                    `/products/${id}/variants/${editingVariant.id}/`,
                    payload
                );

                setSuccess(
                    "Variant updated successfully."
                );
            } else {
                await api.post(
                    `/products/${id}/variants/`,
                    payload
                );

                setSuccess(
                    "Variant created successfully."
                );
            }

            await loadData();

            setShowForm(false);
            setEditingVariant(null);
            setForm(emptyVariant);
        } catch (err) {
            console.error(
                "Failed to save variant:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please sign in again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    err.response?.data?.detail ||
                        "You do not have permission to modify this variant."
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

    const handleDelete = async (variant) => {
        const confirmed = window.confirm(
            `Delete variant "${variant.sku}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await api.delete(
                `/products/${id}/variants/${variant.id}/`
            );

            setVariants((current) =>
                current.filter(
                    (item) => item.id !== variant.id
                )
            );

            setSuccess(
                "Variant deleted successfully."
            );
        } catch (err) {
            console.error(
                "Failed to delete variant:",
                err
            );

            setError(
                err.response?.data?.detail ||
                    "Unable to delete this variant."
            );
        }
    };

    const filteredVariants = useMemo(() => {
        let result = [...variants];

        const searchValue =
            search.trim().toLowerCase();

        if (searchValue) {
            result = result.filter((variant) => {
                const sku =
                    variant.sku || "";
                const size =
                    variant.size || "";
                const color =
                    variant.color || "";

                return (
                    sku
                        .toLowerCase()
                        .includes(searchValue) ||
                    size
                        .toLowerCase()
                        .includes(searchValue) ||
                    color
                        .toLowerCase()
                        .includes(searchValue)
                );
            });
        }

        if (statusFilter === "ACTIVE") {
            result = result.filter(
                (variant) =>
                    variant.is_active !== false
            );
        }

        if (statusFilter === "INACTIVE") {
            result = result.filter(
                (variant) =>
                    variant.is_active === false
            );
        }

        if (statusFilter === "OUT_OF_STOCK") {
            result = result.filter((variant) => {
                const stock =
                    variant.stock_quantity ??
                    variant.inventory?.quantity ??
                    0;

                return Number(stock) <= 0;
            });
        }

        return result;
    }, [
        variants,
        search,
        statusFilter,
    ]);

    const activeVariants = variants.filter(
        (variant) =>
            variant.is_active !== false
    ).length;

    const inactiveVariants = variants.filter(
        (variant) =>
            variant.is_active === false
    ).length;

    const totalStock = variants.reduce(
        (total, variant) =>
            total +
            Number(
                variant.stock_quantity ??
                    variant.inventory?.quantity ??
                    0
            ),
        0
    );

    const outOfStock = variants.filter(
        (variant) =>
            Number(
                variant.stock_quantity ??
                    variant.inventory?.quantity ??
                    0
            ) <= 0
    ).length;

    if (loading) {
        return (
            <div className="marketplace-page seller-variants-page">
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
                            Loading product variants...
                        </p>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="marketplace-page seller-variants-page">
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
                        Variants
                    </span>
                </div>

                {product && (
                    <section className="seller-variant-product-header">
                        <div className="seller-variant-product-info">
                            <div className="seller-variant-product-image">
                                {product.image ? (
                                    <img
                                        src={getImageUrl(
                                            product.image
                                        )}
                                        alt={
                                            product.name
                                        }
                                    />
                                ) : (
                                    <span>
                                        Product
                                    </span>
                                )}
                            </div>

                            <div>
                                <span className="seller-variant-eyebrow">
                                    Product Variants
                                </span>

                                <h1>
                                    {product.name}
                                </h1>

                                <p>
                                    {product.brand ||
                                        "No brand specified"}
                                </p>
                            </div>
                        </div>

                        <div className="seller-variant-product-actions">
                            <Link
                                to={`/seller/products/${id}/edit`}
                                className="marketplace-secondary-button"
                            >
                                Edit Product
                            </Link>

                            <Link
                                to={`/products/${id}`}
                                className="marketplace-secondary-button"
                            >
                                View Product
                            </Link>

                            <button
                                type="button"
                                onClick={openAddForm}
                                className="marketplace-primary-button"
                            >
                                + Add Variant
                            </button>
                        </div>
                    </section>
                )}

                {error && (
                    <div className="seller-form-alert error">
                        <strong>
                            Action failed
                        </strong>

                        <span>
                            {error}
                        </span>
                    </div>
                )}

                {success && (
                    <div className="seller-form-alert success">
                        <strong>
                            Success
                        </strong>

                        <span>
                            {success}
                        </span>
                    </div>
                )}

                {showForm && (
                    <section className="seller-variant-form-card">
                        <div className="seller-product-form-card-heading">
                            <div>
                                <h2>
                                    {editingVariant
                                        ? "Edit Variant"
                                        : "Add Product Variant"}
                                </h2>

                                <p>
                                    Add the size, color,
                                    SKU, price and available
                                    stock for this variant.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="seller-variant-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="seller-variant-form"
                        >
                            <div className="seller-form-grid">
                                <div className="seller-form-field">
                                    <label htmlFor="sku">
                                        SKU *
                                    </label>

                                    <input
                                        id="sku"
                                        name="sku"
                                        type="text"
                                        value={form.sku}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. TSH-BLK-M-001"
                                        required
                                    />

                                    <small>
                                        Use a unique
                                        identifier for this
                                        variant.
                                    </small>
                                </div>

                                <div className="seller-form-field">
                                    <label htmlFor="size">
                                        Size *
                                    </label>

                                    <input
                                        id="size"
                                        name="size"
                                        type="text"
                                        value={form.size}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. M"
                                        required
                                    />
                                </div>

                                <div className="seller-form-field">
                                    <label htmlFor="color">
                                        Color *
                                    </label>

                                    <input
                                        id="color"
                                        name="color"
                                        type="text"
                                        value={form.color}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Black"
                                        required
                                    />
                                </div>

                                <div className="seller-form-field">
                                    <label htmlFor="price">
                                        Variant Price (KES)
                                    </label>

                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            form.price
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder={
                                            product?.price ||
                                            "Use product price"
                                        }
                                    />

                                    <small>
                                        Leave empty to use
                                        the main product
                                        price.
                                    </small>
                                </div>

                                <div className="seller-form-field">
                                    <label htmlFor="stock_quantity">
                                        Stock Quantity *
                                    </label>

                                    <input
                                        id="stock_quantity"
                                        name="stock_quantity"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            form.stock_quantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div className="seller-form-options">
                                    <label className="seller-checkbox">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={
                                                form.is_active
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        <span>
                                            <strong>
                                                Active Variant
                                            </strong>

                                            <small>
                                                Allow customers
                                                to select and
                                                purchase this
                                                variant.
                                            </small>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="seller-variant-form-actions">
                                <button
                                    type="button"
                                    className="marketplace-secondary-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="marketplace-primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingVariant
                                        ? "Save Changes"
                                        : "Create Variant"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="seller-variant-stats">
                    <div className="seller-variant-stat">
                        <span>
                            Total Variants
                        </span>

                        <strong>
                            {variants.length}
                        </strong>
                    </div>

                    <div className="seller-variant-stat">
                        <span>
                            Active
                        </span>

                        <strong>
                            {activeVariants}
                        </strong>
                    </div>

                    <div className="seller-variant-stat">
                        <span>
                            Inactive
                        </span>

                        <strong>
                            {inactiveVariants}
                        </strong>
                    </div>

                    <div className="seller-variant-stat">
                        <span>
                            Total Stock
                        </span>

                        <strong>
                            {totalStock}
                        </strong>
                    </div>

                    <div className="seller-variant-stat">
                        <span>
                            Out of Stock
                        </span>

                        <strong>
                            {outOfStock}
                        </strong>
                    </div>
                </section>

                <section className="seller-variant-toolbar">
                    <input
                        type="text"
                        placeholder="Search SKU, size or color..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All variants
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                        <option value="OUT_OF_STOCK">
                            Out of stock
                        </option>
                    </select>

                    <button
                        type="button"
                        onClick={openAddForm}
                        className="marketplace-primary-button"
                    >
                        + Add Variant
                    </button>
                </section>

                {variants.length === 0 ? (
                    <section className="seller-products-empty">
                        <div className="seller-products-empty-icon">
                            +
                        </div>

                        <h2>
                            No variants yet
                        </h2>

                        <p>
                            Add sizes, colors, SKUs and
                            stock so customers can choose
                            the exact version of this
                            product they want.
                        </p>

                        <button
                            type="button"
                            onClick={openAddForm}
                            className="marketplace-primary-button"
                        >
                            Add First Variant
                        </button>
                    </section>
                ) : filteredVariants.length === 0 ? (
                    <section className="seller-products-empty">
                        <div className="seller-products-empty-icon">
                            ?
                        </div>

                        <h2>
                            No variants found
                        </h2>

                        <p>
                            Try changing your search or
                            status filter.
                        </p>
                    </section>
                ) : (
                    <section className="seller-variants-table-section">
                        <div className="seller-products-table-header">
                            <div>
                                <h2>
                                    Product Variants
                                </h2>

                                <span>
                                    Showing{" "}
                                    {
                                        filteredVariants.length
                                    }{" "}
                                    of{" "}
                                    {variants.length}{" "}
                                    variants
                                </span>
                            </div>
                        </div>

                        <div className="seller-products-table-wrapper">
                            <table className="seller-products-table seller-variants-table">
                                <thead>
                                    <tr>
                                        <th>
                                            SKU
                                        </th>

                                        <th>
                                            Size
                                        </th>

                                        <th>
                                            Color
                                        </th>

                                        <th>
                                            Price
                                        </th>

                                        <th>
                                            Stock
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredVariants.map(
                                        (variant) => {
                                            const stock =
                                                variant.stock_quantity ??
                                                variant
                                                    .inventory
                                                    ?.quantity ??
                                                0;

                                            const price =
                                                variant.price ??
                                                product?.price ??
                                                0;

                                            return (
                                                <tr
                                                    key={
                                                        variant.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                variant.sku
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span className="seller-variant-value">
                                                            {variant.size ||
                                                                "—"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="seller-variant-color">
                                                            <span
                                                                className="seller-variant-color-dot"
                                                            ></span>

                                                            {variant.color ||
                                                                "—"}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {formatCurrency(
                                                                price
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                Number(
                                                                    stock
                                                                ) <=
                                                                0
                                                                    ? "seller-product-stock danger"
                                                                    : Number(
                                                                          stock
                                                                      ) <=
                                                                      5
                                                                    ? "seller-product-stock warning"
                                                                    : "seller-product-stock"
                                                            }
                                                        >
                                                            {
                                                                stock
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {variant.is_active !==
                                                        false ? (
                                                            <span className="seller-product-status active">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="seller-product-status archived">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td>
                                                        <div className="seller-product-actions">
                                                            <button
                                                                type="button"
                                                                className="seller-product-action edit"
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        variant
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="seller-product-action delete"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        variant
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
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