import { useEffect, useState } from "react";
import api from "../../services/api";

function ProductVariants({ productId }) {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        sku: "",
        size: "",
        color: "",
        price: "",
        stock_quantity: 0,
        is_active: true,
    });

    const loadVariants = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/products/${productId}/variants/`
            );

            const data = response.data;

            if (Array.isArray(data)) {
                setVariants(data);
            } else if (Array.isArray(data.results)) {
                setVariants(data.results);
            } else {
                setVariants([]);
            }
        } catch (err) {
            console.error("Failed to load variants:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to load product variants."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            loadVariants();
        }
    }, [productId]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const resetForm = () => {
        setForm({
            sku: "",
            size: "",
            color: "",
            price: "",
            stock_quantity: 0,
            is_active: true,
        });

        setEditingId(null);
    };

    const validateForm = () => {
        if (!form.sku.trim()) {
            setError("SKU is required.");
            return false;
        }

        if (!form.size.trim()) {
            setError("Size is required.");
            return false;
        }

        if (!form.color.trim()) {
            setError("Color is required.");
            return false;
        }

        if (
            form.price !== "" &&
            (Number.isNaN(Number(form.price)) ||
                Number(form.price) < 0)
        ) {
            setError("Price must be zero or greater.");
            return false;
        }

        if (
            Number.isNaN(Number(form.stock_quantity)) ||
            Number(form.stock_quantity) < 0
        ) {
            setError("Stock quantity cannot be negative.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        const payload = {
            sku: form.sku.trim(),
            size: form.size.trim(),
            color: form.color.trim(),
            price:
                form.price === ""
                    ? null
                    : Number(form.price),
            stock_quantity: Number(form.stock_quantity),
            is_active: form.is_active,
        };

        try {
            setSaving(true);

            if (editingId) {
                await api.put(
                    `/products/${productId}/variants/${editingId}/`,
                    payload
                );

                setSuccess("Variant updated successfully.");
            } else {
                await api.post(
                    `/products/${productId}/variants/`,
                    payload
                );

                setSuccess("Variant added successfully.");
            }

            resetForm();
            await loadVariants();
        } catch (err) {
            console.error("Failed to save variant:", err);

            const data = err.response?.data;

            if (typeof data === "object" && data !== null) {
                const messages = Object.entries(data)
                    .map(([field, value]) => {
                        const message = Array.isArray(value)
                            ? value.join(", ")
                            : String(value);

                        return `${field}: ${message}`;
                    })
                    .join(" ");

                setError(
                    messages || "Failed to save variant."
                );
            } else {
                setError("Failed to save variant.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (variant) => {
        setEditingId(variant.id);

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
                variant.stock_quantity ?? 0,
            is_active:
                variant.is_active !== false,
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    };

    const handleDelete = async (variantId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this variant?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/products/${productId}/variants/${variantId}/`
            );

            setSuccess("Variant deleted successfully.");

            if (editingId === variantId) {
                resetForm();
            }

            await loadVariants();
        } catch (err) {
            console.error("Failed to delete variant:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to delete variant."
            );
        }
    };

    const formatPrice = (price) => {
        if (
            price === null ||
            price === undefined ||
            price === ""
        ) {
            return "Product price";
        }

        return `KES ${Number(price).toLocaleString()}`;
    };

    return (
        <section className="admin-form-section product-variants-section">
            <div className="section-heading">
                <div>
                    <h2>Product Variants</h2>
                    <p>
                        Manage sizes, colors, SKUs, prices and
                        stock for this product.
                    </p>
                </div>

                <span className="variant-count">
                    {variants.length}{" "}
                    {variants.length === 1
                        ? "variant"
                        : "variants"}
                </span>
            </div>

            {error && (
                <div className="admin-alert admin-alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="admin-alert admin-alert-success">
                    {success}
                </div>
            )}

            <div className="variants-table-wrapper">
                {loading ? (
                    <div className="admin-loading">
                        Loading variants...
                    </div>
                ) : variants.length === 0 ? (
                    <div className="admin-empty">
                        <h3>No variants yet</h3>
                        <p>
                            Add the first size and color
                            combination below.
                        </p>
                    </div>
                ) : (
                    <table className="admin-table variants-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Size</th>
                                <th>Color</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {variants.map((variant) => (
                                <tr key={variant.id}>
                                    <td>
                                        <strong>
                                            {variant.sku}
                                        </strong>
                                    </td>

                                    <td>
                                        {variant.size || "—"}
                                    </td>

                                    <td>
                                        <span className="color-value">
                                            {variant.color ||
                                                "—"}
                                        </span>
                                    </td>

                                    <td>
                                        {formatPrice(
                                            variant.price
                                        )}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                Number(
                                                    variant.stock_quantity
                                                ) <= 0
                                                    ? "stock-danger"
                                                    : Number(
                                                          variant.stock_quantity
                                                      ) <= 5
                                                    ? "stock-warning"
                                                    : "stock-good"
                                            }
                                        >
                                            {
                                                variant.stock_quantity
                                            }
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`status-badge ${
                                                variant.is_active
                                                    ? "status-active"
                                                    : "status-archived"
                                            }`}
                                        >
                                            {variant.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="table-actions">
                                            <button
                                                type="button"
                                                className="admin-btn admin-btn-secondary admin-btn-small"
                                                onClick={() =>
                                                    handleEdit(
                                                        variant
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-btn admin-btn-danger admin-btn-small"
                                                onClick={() =>
                                                    handleDelete(
                                                        variant.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="variant-form-divider"></div>

            <div className="variant-form-heading">
                <div>
                    <h3>
                        {editingId
                            ? "Edit Variant"
                            : "Add Variant"}
                    </h3>

                    <p>
                        Each size and color combination should
                        have its own SKU.
                    </p>
                </div>

                {editingId && (
                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={resetForm}
                    >
                        Cancel Edit
                    </button>
                )}
            </div>

            <form
                className="admin-form"
                onSubmit={handleSubmit}
            >
                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label htmlFor="variant-sku">
                            SKU
                        </label>

                        <input
                            id="variant-sku"
                            type="text"
                            name="sku"
                            value={form.sku}
                            onChange={handleChange}
                            placeholder="TSH-BLK-M-001"
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="variant-size">
                            Size
                        </label>

                        <input
                            id="variant-size"
                            type="text"
                            name="size"
                            value={form.size}
                            onChange={handleChange}
                            placeholder="S, M, L, XL"
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="variant-color">
                            Color
                        </label>

                        <input
                            id="variant-color"
                            type="text"
                            name="color"
                            value={form.color}
                            onChange={handleChange}
                            placeholder="Black"
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="variant-price">
                            Price
                        </label>

                        <input
                            id="variant-price"
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="Leave empty to use product price"
                        />

                        <small>
                            Leave empty to use the main
                            product price.
                        </small>
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="variant-stock">
                            Stock Quantity
                        </label>

                        <input
                            id="variant-stock"
                            type="number"
                            name="stock_quantity"
                            value={form.stock_quantity}
                            onChange={handleChange}
                            min="0"
                            step="1"
                        />
                    </div>

                    <div className="admin-form-group admin-checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                            />

                            <span>
                                Variant is active
                            </span>
                        </label>
                    </div>
                </div>

                <div className="admin-form-actions">
                    <button
                        type="submit"
                        className="admin-btn admin-btn-primary"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                            ? "Update Variant"
                            : "Add Variant"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

export default ProductVariants;