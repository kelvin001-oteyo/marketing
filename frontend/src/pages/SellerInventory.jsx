import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

function getItems(data) {
    if (Array.isArray(data)) return data;
    return (
        data?.results ||
        data?.inventory ||
        data?.items ||
        data?.records ||
        []
    );
}

function getVariant(record) {
    return record?.variant || record?.product_variant || {};
}

function getProduct(record) {
    const variant = getVariant(record);

    return (
        record?.product ||
        variant?.product ||
        {}
    );
}

export default function SellerInventory() {
    const [records, setRecords] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    const [editing, setEditing] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [threshold, setThreshold] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadInventory();
    }, []);

    async function loadInventory() {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/inventory/");

            setRecords(getItems(response.data));
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                setError(
                    "Please sign in to manage inventory."
                );
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load inventory."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    const stats = useMemo(() => {
        let total = 0;
        let low = 0;
        let out = 0;

        records.forEach((record) => {
            const available =
                record.available_quantity ??
                Math.max(
                    Number(record.quantity || 0) -
                        Number(
                            record.reserved_quantity || 0
                        ),
                    0
                );

            const thresholdValue =
                Number(
                    record.low_stock_threshold ?? 5
                );

            total += available;

            if (available <= 0) {
                out++;
            } else if (available <= thresholdValue) {
                low++;
            }
        });

        return {
            total,
            low,
            out,
        };
    }, [records]);

    const filteredRecords = records.filter((record) => {
        const variant = getVariant(record);
        const product = getProduct(record);

        const text = `
            ${product.name || ""}
            ${product.brand || ""}
            ${variant.sku || ""}
            ${variant.size || ""}
            ${variant.color || ""}
        `.toLowerCase();

        const matchesSearch = text.includes(
            search.toLowerCase()
        );

        const available =
            record.available_quantity ??
            Math.max(
                Number(record.quantity || 0) -
                    Number(
                        record.reserved_quantity || 0
                    ),
                0
            );

        const thresholdValue =
            Number(record.low_stock_threshold ?? 5);

        let matchesFilter = true;

        if (filter === "LOW") {
            matchesFilter =
                available > 0 &&
                available <= thresholdValue;
        }

        if (filter === "OUT") {
            matchesFilter = available <= 0;
        }

        if (filter === "HEALTHY") {
            matchesFilter =
                available > thresholdValue;
        }

        return matchesSearch && matchesFilter;
    });

    function openEditor(record) {
        setEditing(record);
        setQuantity(
            String(record.quantity ?? 0)
        );
        setThreshold(
            String(
                record.low_stock_threshold ?? 5
            )
        );
        setError("");
    }

    function closeEditor() {
        setEditing(null);
        setQuantity("");
        setThreshold("");
    }

    async function saveInventory(e) {
        e.preventDefault();

        if (!editing) return;

        const newQuantity = Number(quantity);

        if (
            Number.isNaN(newQuantity) ||
            newQuantity < 0
        ) {
            setError("Enter a valid stock quantity.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                quantity: newQuantity,
                low_stock_threshold:
                    Number(threshold) >= 0
                        ? Number(threshold)
                        : 5,
            };

            await api.patch(
                `/inventory/${editing.id}/update/`,
                payload
            );

            closeEditor();
            await loadInventory();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.quantity?.[0] ||
                "Unable to update inventory."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="marketplace-page seller-inventory-page">
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
                        <Link
                            className="active"
                            to="/seller/inventory"
                        >
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
                    <Link to="/seller/dashboard">
                        Seller Center
                    </Link>
                    <span>/</span>
                    <span>Inventory</span>
                </div>

                <section className="seller-page-heading">
                    <div>
                        <span className="seller-eyebrow">
                            INVENTORY MANAGEMENT
                        </span>
                        <h1>Inventory</h1>
                        <p>
                            Keep track of product variants and
                            available stock.
                        </p>
                    </div>
                </section>

                {error && (
                    <div className="marketplace-error">
                        {error}
                    </div>
                )}

                <section className="seller-stats-grid">
                    <div className="seller-stat-card">
                        <span>Inventory Records</span>
                        <strong>{records.length}</strong>
                    </div>

                    <div className="seller-stat-card">
                        <span>Available Units</span>
                        <strong>
                            {stats.total.toLocaleString()}
                        </strong>
                    </div>

                    <div className="seller-stat-card">
                        <span>Low Stock</span>
                        <strong>{stats.low}</strong>
                    </div>

                    <div className="seller-stat-card">
                        <span>Out of Stock</span>
                        <strong>{stats.out}</strong>
                    </div>
                </section>

                <section className="seller-products-toolbar">
                    <div className="marketplace-search-box">
                        <input
                            type="text"
                            placeholder="Search product, SKU, size or color..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <select
                        value={filter}
                        onChange={(e) =>
                            setFilter(e.target.value)
                        }
                    >
                        <option value="ALL">
                            All Inventory
                        </option>
                        <option value="HEALTHY">
                            Healthy Stock
                        </option>
                        <option value="LOW">
                            Low Stock
                        </option>
                        <option value="OUT">
                            Out of Stock
                        </option>
                    </select>
                </section>

                {loading ? (
                    <div className="marketplace-state">
                        Loading inventory...
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="marketplace-empty">
                        <h3>No inventory records found</h3>
                        <p>
                            Product variants with inventory records
                            will appear here.
                        </p>
                    </div>
                ) : (
                    <section className="seller-products-table-section">
                        <div className="seller-products-table-wrap">
                            <table className="seller-products-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Variant</th>
                                        <th>Total Stock</th>
                                        <th>Reserved</th>
                                        <th>Available</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredRecords.map(
                                        (record) => {
                                            const variant =
                                                getVariant(
                                                    record
                                                );

                                            const product =
                                                getProduct(
                                                    record
                                                );

                                            const available =
                                                record.available_quantity ??
                                                Math.max(
                                                    Number(
                                                        record.quantity ||
                                                            0
                                                    ) -
                                                        Number(
                                                            record.reserved_quantity ||
                                                                0
                                                        ),
                                                    0
                                                );

                                            const threshold =
                                                Number(
                                                    record.low_stock_threshold ??
                                                        5
                                                );

                                            let status =
                                                "Healthy";

                                            if (
                                                available <=
                                                0
                                            ) {
                                                status =
                                                    "Out of Stock";
                                            } else if (
                                                available <=
                                                threshold
                                            ) {
                                                status =
                                                    "Low Stock";
                                            }

                                            return (
                                                <tr
                                                    key={
                                                        record.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                product.name
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            variant.sku
                                                        }
                                                    </td>

                                                    <td>
                                                        {variant.size ||
                                                            "—"}
                                                        {variant.color
                                                            ? ` / ${variant.color}`
                                                            : ""}
                                                    </td>

                                                    <td>
                                                        {
                                                            record.quantity
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            record.reserved_quantity
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                available
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`seller-stock-status seller-stock-${status
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\s/g,
                                                                    "-"
                                                                )}`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <button
                                                            className="marketplace-small-btn"
                                                            onClick={() =>
                                                                openEditor(
                                                                    record
                                                                )
                                                            }
                                                        >
                                                            Update
                                                        </button>
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

                {editing && (
                    <div className="seller-modal-overlay">
                        <div className="seller-modal">
                            <button
                                className="seller-modal-close"
                                onClick={closeEditor}
                            >
                                ×
                            </button>

                            <h2>Update Inventory</h2>

                            <p>
                                Update stock for{" "}
                                <strong>
                                    {
                                        getProduct(
                                            editing
                                        ).name
                                    }
                                </strong>
                            </p>

                            <form
                                onSubmit={
                                    saveInventory
                                }
                            >
                                <label>
                                    Stock Quantity
                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            quantity
                                        }
                                        onChange={(e) =>
                                            setQuantity(
                                                e.target
                                                    .value
                                            )
                                        }
                                    />
                                </label>

                                <label>
                                    Low Stock Threshold
                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            threshold
                                        }
                                        onChange={(e) =>
                                            setThreshold(
                                                e.target
                                                    .value
                                            )
                                        }
                                    />
                                </label>

                                <div className="seller-modal-actions">
                                    <button
                                        type="button"
                                        className="marketplace-secondary-btn"
                                        onClick={
                                            closeEditor
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="marketplace-primary-btn"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}