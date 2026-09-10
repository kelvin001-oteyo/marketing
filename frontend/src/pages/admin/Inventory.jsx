import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    const [selectedItem, setSelectedItem] = useState(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);

    const [adjustment, setAdjustment] = useState({
        quantity: "",
        transaction_type: "ADJUSTMENT",
        reference: "",
        notes: "",
    });

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const loadInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/inventory/");

            const data = response.data;

            if (Array.isArray(data)) {
                setInventory(data);
            } else if (Array.isArray(data.results)) {
                setInventory(data.results);
            } else {
                setInventory([]);
            }
        } catch (err) {
            console.error("Failed to load inventory:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to load inventory."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const getVariant = (item) => {
        return item.variant || item.product_variant || {};
    };

    const getProduct = (item) => {
        const variant = getVariant(item);

        return (
            item.product ||
            variant.product ||
            {}
        );
    };

    const getProductName = (item) => {
        const product = getProduct(item);
        const variant = getVariant(item);

        return (
            product.name ||
            variant.product_name ||
            "Unnamed Product"
        );
    };

    const getSKU = (item) => {
        const variant = getVariant(item);

        return (
            variant.sku ||
            item.sku ||
            "—"
        );
    };

    const getSize = (item) => {
        const variant = getVariant(item);

        return variant.size || "—";
    };

    const getColor = (item) => {
        const variant = getVariant(item);

        return variant.color || "—";
    };

    const getQuantity = (item) => {
        return Number(item.quantity ?? 0);
    };

    const getReserved = (item) => {
        return Number(item.reserved_quantity ?? 0);
    };

    const getAvailable = (item) => {
        if (
            item.available_quantity !== undefined &&
            item.available_quantity !== null
        ) {
            return Number(item.available_quantity);
        }

        return Math.max(
            getQuantity(item) - getReserved(item),
            0
        );
    };

    const getThreshold = (item) => {
        return Number(
            item.low_stock_threshold ?? 5
        );
    };

    const getStatus = (item) => {
        const available = getAvailable(item);
        const threshold = getThreshold(item);

        if (available <= 0) {
            return "OUT_OF_STOCK";
        }

        if (available <= threshold) {
            return "LOW_STOCK";
        }

        return "IN_STOCK";
    };

    const filteredInventory = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return inventory.filter((item) => {
            const productName =
                getProductName(item).toLowerCase();

            const sku = getSKU(item).toLowerCase();

            const size = getSize(item).toLowerCase();

            const color = getColor(item).toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                productName.includes(
                    normalizedSearch
                ) ||
                sku.includes(normalizedSearch) ||
                size.includes(normalizedSearch) ||
                color.includes(normalizedSearch);

            const status = getStatus(item);

            const matchesFilter =
                filter === "ALL" ||
                (filter === "IN_STOCK" &&
                    status === "IN_STOCK") ||
                (filter === "LOW_STOCK" &&
                    status === "LOW_STOCK") ||
                (filter === "OUT_OF_STOCK" &&
                    status === "OUT_OF_STOCK");

            return (
                matchesSearch &&
                matchesFilter
            );
        });
    }, [inventory, search, filter]);

    const statistics = useMemo(() => {
        let totalItems = 0;
        let reservedItems = 0;
        let availableItems = 0;
        let lowStockItems = 0;
        let outOfStockItems = 0;

        inventory.forEach((item) => {
            const quantity = getQuantity(item);
            const reserved = getReserved(item);
            const available = getAvailable(item);

            totalItems += quantity;
            reservedItems += reserved;
            availableItems += available;

            if (
                getStatus(item) ===
                "LOW_STOCK"
            ) {
                lowStockItems++;
            }

            if (
                getStatus(item) ===
                "OUT_OF_STOCK"
            ) {
                outOfStockItems++;
            }
        });

        return {
            totalItems,
            reservedItems,
            availableItems,
            lowStockItems,
            outOfStockItems,
        };
    }, [inventory]);

    const openAdjustment = (item) => {
        setSelectedItem(item);

        setAdjustment({
            quantity: "",
            transaction_type: "ADJUSTMENT",
            reference: "",
            notes: "",
        });

        setError("");
        setSuccess("");
        setShowAdjustModal(true);
    };

    const closeAdjustment = () => {
        if (saving) {
            return;
        }

        setShowAdjustModal(false);
        setSelectedItem(null);
    };

    const handleAdjustmentChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setAdjustment((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const submitAdjustment = async (
        event
    ) => {
        event.preventDefault();

        if (!selectedItem) {
            return;
        }

        const quantity = Number(
            adjustment.quantity
        );

        if (
            Number.isNaN(quantity) ||
            quantity === 0
        ) {
            setError(
                "Enter a valid non-zero quantity."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                quantity,
                transaction_type:
                    adjustment.transaction_type,
                reference:
                    adjustment.reference.trim(),
                notes:
                    adjustment.notes.trim(),
            };

            await api.patch(
                `/inventory/${selectedItem.id}/update/`,
                payload
            );

            setShowAdjustModal(false);
            setSelectedItem(null);

            setSuccess(
                "Inventory updated successfully."
            );

            await loadInventory();
        } catch (err) {
            console.error(
                "Failed to update inventory:",
                err
            );

            const data =
                err.response?.data;

            if (
                data &&
                typeof data === "object"
            ) {
                const messages =
                    Object.entries(data)
                        .map(
                            ([
                                field,
                                value,
                            ]) => {
                                const message =
                                    Array.isArray(
                                        value
                                    )
                                        ? value.join(
                                              ", "
                                          )
                                        : String(
                                              value
                                          );

                                return `${field}: ${message}`;
                            }
                        )
                        .join(" ");

                setError(
                    messages ||
                        "Failed to update inventory."
                );
            } else {
                setError(
                    "Failed to update inventory."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return "—";
        }

        return parsed.toLocaleDateString(
            "en-KE",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Inventory</h1>

                    <p>
                        Monitor stock levels,
                        reservations and
                        inventory movements.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={loadInventory}
                    disabled={loading}
                >
                    {loading
                        ? "Refreshing..."
                        : "Refresh"}
                </button>
            </div>

            {error && !showAdjustModal && (
                <div className="admin-alert admin-alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="admin-alert admin-alert-success">
                    {success}
                </div>
            )}

            <div className="inventory-stats-grid">
                <div className="inventory-stat-card">
                    <span>
                        Total Stock
                    </span>

                    <strong>
                        {statistics.totalItems.toLocaleString()}
                    </strong>
                </div>

                <div className="inventory-stat-card">
                    <span>
                        Available
                    </span>

                    <strong>
                        {statistics.availableItems.toLocaleString()}
                    </strong>
                </div>

                <div className="inventory-stat-card">
                    <span>
                        Reserved
                    </span>

                    <strong>
                        {statistics.reservedItems.toLocaleString()}
                    </strong>
                </div>

                <div className="inventory-stat-card">
                    <span>
                        Low Stock
                    </span>

                    <strong>
                        {statistics.lowStockItems}
                    </strong>
                </div>

                <div className="inventory-stat-card">
                    <span>
                        Out of Stock
                    </span>

                    <strong>
                        {statistics.outOfStockItems}
                    </strong>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-toolbar">
                    <div className="admin-search">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search product, SKU, size or color..."
                        />
                    </div>

                    <div className="inventory-filters">
                        <button
                            type="button"
                            className={
                                filter ===
                                "ALL"
                                    ? "inventory-filter active"
                                    : "inventory-filter"
                            }
                            onClick={() =>
                                setFilter(
                                    "ALL"
                                )
                            }
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={
                                filter ===
                                "IN_STOCK"
                                    ? "inventory-filter active"
                                    : "inventory-filter"
                            }
                            onClick={() =>
                                setFilter(
                                    "IN_STOCK"
                                )
                            }
                        >
                            In Stock
                        </button>

                        <button
                            type="button"
                            className={
                                filter ===
                                "LOW_STOCK"
                                    ? "inventory-filter active"
                                    : "inventory-filter"
                            }
                            onClick={() =>
                                setFilter(
                                    "LOW_STOCK"
                                )
                            }
                        >
                            Low Stock
                        </button>

                        <button
                            type="button"
                            className={
                                filter ===
                                "OUT_OF_STOCK"
                                    ? "inventory-filter active"
                                    : "inventory-filter"
                            }
                            onClick={() =>
                                setFilter(
                                    "OUT_OF_STOCK"
                                )
                            }
                        >
                            Out of Stock
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        Loading inventory...
                    </div>
                ) : filteredInventory.length ===
                  0 ? (
                    <div className="admin-empty">
                        <h3>
                            No inventory found
                        </h3>

                        <p>
                            Try changing your
                            search or filter.
                        </p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table inventory-table">
                            <thead>
                                <tr>
                                    <th>
                                        Product
                                    </th>

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
                                        Total
                                    </th>

                                    <th>
                                        Reserved
                                    </th>

                                    <th>
                                        Available
                                    </th>

                                    <th>
                                        Threshold
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Updated
                                    </th>

                                    <th>
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredInventory.map(
                                    (item) => {
                                        const status =
                                            getStatus(
                                                item
                                            );

                                        return (
                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >
                                                <td>
                                                    <strong>
                                                        {getProductName(
                                                            item
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {getSKU(
                                                        item
                                                    )}
                                                </td>

                                                <td>
                                                    {getSize(
                                                        item
                                                    )}
                                                </td>

                                                <td>
                                                    {getColor(
                                                        item
                                                    )}
                                                </td>

                                                <td>
                                                    {getQuantity(
                                                        item
                                                    )}
                                                </td>

                                                <td>
                                                    {getReserved(
                                                        item
                                                    )}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {getAvailable(
                                                            item
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {getThreshold(
                                                        item
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${
                                                            status ===
                                                            "IN_STOCK"
                                                                ? "status-active"
                                                                : status ===
                                                                  "LOW_STOCK"
                                                                ? "status-pending"
                                                                : "status-archived"
                                                        }`}
                                                    >
                                                        {status ===
                                                        "IN_STOCK"
                                                            ? "In Stock"
                                                            : status ===
                                                              "LOW_STOCK"
                                                            ? "Low Stock"
                                                            : "Out of Stock"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        item.updated_at
                                                    )}
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="admin-btn admin-btn-secondary admin-btn-small"
                                                        onClick={() =>
                                                            openAdjustment(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        Adjust
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showAdjustModal &&
                selectedItem && (
                    <div
                        className="inventory-modal-backdrop"
                        onMouseDown={
                            closeAdjustment
                        }
                    >
                        <div
                            className="inventory-modal"
                            onMouseDown={(
                                event
                            ) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="inventory-modal-header">
                                <div>
                                    <h2>
                                        Adjust
                                        Inventory
                                    </h2>

                                    <p>
                                        {
                                            getProductName(
                                                selectedItem
                                            )
                                        }{" "}
                                        —{" "}
                                        {
                                            getSKU(
                                                selectedItem
                                            )
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modal-close-btn"
                                    onClick={
                                        closeAdjustment
                                    }
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                className="admin-form"
                                onSubmit={
                                    submitAdjustment
                                }
                            >
                                <div className="admin-form-group">
                                    <label>
                                        Adjustment
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        name="quantity"
                                        value={
                                            adjustment.quantity
                                        }
                                        onChange={
                                            handleAdjustmentChange
                                        }
                                        placeholder="Example: 10 or -3"
                                        step="1"
                                    />

                                    <small>
                                        Use a
                                        positive
                                        number to
                                        add stock
                                        or a
                                        negative
                                        number to
                                        remove
                                        stock.
                                    </small>
                                </div>

                                <div className="admin-form-group">
                                    <label>
                                        Transaction
                                        Type
                                    </label>

                                    <select
                                        name="transaction_type"
                                        value={
                                            adjustment.transaction_type
                                        }
                                        onChange={
                                            handleAdjustmentChange
                                        }
                                    >
                                        <option value="ADJUSTMENT">
                                            Adjustment
                                        </option>

                                        <option value="RESTOCK">
                                            Restock
                                        </option>

                                        <option value="RETURN">
                                            Return
                                        </option>
                                    </select>
                                </div>

                                <div className="admin-form-group">
                                    <label>
                                        Reference
                                    </label>

                                    <input
                                        type="text"
                                        name="reference"
                                        value={
                                            adjustment.reference
                                        }
                                        onChange={
                                            handleAdjustmentChange
                                        }
                                        placeholder="Optional reference"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label>
                                        Notes
                                    </label>

                                    <textarea
                                        name="notes"
                                        value={
                                            adjustment.notes
                                        }
                                        onChange={
                                            handleAdjustmentChange
                                        }
                                        rows="4"
                                        placeholder="Explain this stock movement..."
                                    />
                                </div>

                                {error && (
                                    <div className="admin-alert admin-alert-error">
                                        {
                                            error
                                        }
                                    </div>
                                )}

                                <div className="admin-form-actions">
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-secondary"
                                        onClick={
                                            closeAdjustment
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="admin-btn admin-btn-primary"
                                        disabled={
                                            saving
                                        }
                                    >
                                        {saving
                                            ? "Updating..."
                                            : "Update Stock"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Inventory;