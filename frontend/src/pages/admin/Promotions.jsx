import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";


function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    const [form, setForm] = useState({
        name: "",
        code: "",
        discount_type: "PERCENTAGE",
        discount_value: "",
        minimum_order_amount: "",
        maximum_discount_amount: "",
        start_date: "",
        end_date: "",
        is_active: true,
    });


    const fetchPromotions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/promotions/");

            const data = response.data;

            if (Array.isArray(data)) {
                setPromotions(data);
            } else if (Array.isArray(data.results)) {
                setPromotions(data.results);
            } else {
                setPromotions([]);
            }
        } catch (err) {
            console.error(
                "Failed to load promotions:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to load promotions."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchPromotions();
    }, []);


    const resetForm = () => {
        setForm({
            name: "",
            code: "",
            discount_type: "PERCENTAGE",
            discount_value: "",
            minimum_order_amount: "",
            maximum_discount_amount: "",
            start_date: "",
            end_date: "",
            is_active: true,
        });

        setEditingPromotion(null);
    };


    const openCreateForm = () => {
        resetForm();
        setShowForm(true);
        setError("");
        setSuccess("");
    };


    const openEditForm = (promotion) => {
        setEditingPromotion(promotion);

        setForm({
            name: promotion.name || "",
            code: promotion.code || "",
            discount_type:
                promotion.discount_type ||
                "PERCENTAGE",
            discount_value:
                promotion.discount_value ?? "",
            minimum_order_amount:
                promotion.minimum_order_amount ?? "",
            maximum_discount_amount:
                promotion.maximum_discount_amount ?? "",
            start_date:
                promotion.start_date
                    ? promotion.start_date.slice(0, 16)
                    : "",
            end_date:
                promotion.end_date
                    ? promotion.end_date.slice(0, 16)
                    : "",
            is_active:
                promotion.is_active !== false,
        });

        setShowForm(true);
        setError("");
        setSuccess("");
    };


    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        resetForm();
    };


    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

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
            return "Promotion name is required.";
        }

        if (!form.code.trim()) {
            return "Promo code is required.";
        }

        if (!form.start_date || !form.end_date) {
            return "Start and end dates are required.";
        }

        const discountValue =
            Number(form.discount_value);

        if (
            form.discount_value === "" ||
            Number.isNaN(discountValue) ||
            discountValue <= 0
        ) {
            return "Discount value must be greater than zero.";
        }

        if (
            form.discount_type ===
                "PERCENTAGE" &&
            discountValue > 100
        ) {
            return "Percentage discount cannot exceed 100%.";
        }

        if (
            form.minimum_order_amount !== "" &&
            Number(form.minimum_order_amount) < 0
        ) {
            return "Minimum order amount cannot be negative.";
        }

        if (
            form.maximum_discount_amount !== "" &&
            Number(form.maximum_discount_amount) < 0
        ) {
            return "Maximum discount cannot be negative.";
        }

        if (
            form.start_date &&
            form.end_date &&
            new Date(form.end_date) <=
                new Date(form.start_date)
        ) {
            return "End date must be after the start date.";
        }

        return "";
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                discount_type:
                    form.discount_type,
                discount_value:
                    Number(form.discount_value),
                minimum_order_amount:
                    form.minimum_order_amount === ""
                        ? 0
                        : Number(
                            form.minimum_order_amount
                        ),
                maximum_discount_amount:
                    form.maximum_discount_amount === ""
                        ? null
                        : Number(
                            form.maximum_discount_amount
                        ),
                start_date:
                    form.start_date || null,
                end_date:
                    form.end_date || null,
                is_active:
                    form.is_active,
            };

            if (editingPromotion) {
                await api.patch(
                    `/promotions/${editingPromotion.id}/`,
                    payload
                );

                setSuccess(
                    "Promotion updated successfully."
                );
            } else {
                await api.post(
                    "/promotions/",
                    payload
                );

                setSuccess(
                    "Promotion created successfully."
                );
            }

            setShowForm(false);
            resetForm();

            await fetchPromotions();

        } catch (err) {
            console.error(
                "Failed to save promotion:",
                err
            );

            const data =
                err.response?.data;

            if (
                data &&
                typeof data === "object"
            ) {
                const firstError =
                    Object.values(data)
                        .flat()
                        .find(
                            (message) =>
                                typeof message ===
                                "string"
                        );

                setError(
                    firstError ||
                    data.detail ||
                    "Failed to save promotion."
                );
            } else {
                setError(
                    "Failed to save promotion."
                );
            }
        } finally {
            setSaving(false);
        }
    };


    const handleDelete = async (promotion) => {
        const confirmed =
            window.confirm(
                `Delete promotion "${promotion.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/promotions/${promotion.id}/`
            );

            setSuccess(
                "Promotion deleted successfully."
            );

            await fetchPromotions();

        } catch (err) {
            console.error(
                "Failed to delete promotion:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to delete promotion."
            );
        }
    };


    const getPromotionStatus = (promotion) => {
        if (!promotion.is_active) {
            return "INACTIVE";
        }

        const now = new Date();

        if (
            promotion.start_date &&
            new Date(promotion.start_date) >
                now
        ) {
            return "SCHEDULED";
        }

        if (
            promotion.end_date &&
            new Date(promotion.end_date) <
                now
        ) {
            return "EXPIRED";
        }

        return "ACTIVE";
    };


    const getStatusClass = (status) => {
        switch (status) {
            case "ACTIVE":
                return "promotion-status-active";

            case "SCHEDULED":
                return "promotion-status-scheduled";

            case "EXPIRED":
                return "promotion-status-expired";

            case "INACTIVE":
            default:
                return "promotion-status-inactive";
        }
    };


    const formatDiscount = (promotion) => {
        const value =
            Number(
                promotion.discount_value || 0
            );

        const type =
            promotion.discount_type ||
            "PERCENTAGE";

        if (type === "FIXED") {
            return `KSh ${value.toLocaleString(
                "en-KE",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            )}`;
        }

        return `${value}%`;
    };


    const formatDate = (value) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString(
            "en-KE",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };


    const filteredPromotions = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return promotions.filter(
            (promotion) => {
                const name =
                    (
                        promotion.name ||
                        ""
                    ).toLowerCase();

                const code =
                    (
                        promotion.code ||
                        ""
                    ).toLowerCase();

                const status =
                    getPromotionStatus(
                        promotion
                    );

                const matchesSearch =
                    !query ||
                    name.includes(query) ||
                    code.includes(query);

                const matchesStatus =
                    statusFilter === "ALL" ||
                    status === statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    }, [
        promotions,
        search,
        statusFilter,
    ]);


    const statistics = useMemo(() => {
        const active =
            promotions.filter(
                (promotion) =>
                    getPromotionStatus(
                        promotion
                    ) === "ACTIVE"
            ).length;

        const scheduled =
            promotions.filter(
                (promotion) =>
                    getPromotionStatus(
                        promotion
                    ) === "SCHEDULED"
            ).length;

        const expired =
            promotions.filter(
                (promotion) =>
                    getPromotionStatus(
                        promotion
                    ) === "EXPIRED"
            ).length;

        return {
            total: promotions.length,
            active,
            scheduled,
            expired,
        };
    }, [promotions]);


    return (
        <div className="admin-page">

            {/* Header */}
            <div className="admin-page-header">

                <div>
                    <h1>Promotions</h1>

                    <p>
                        Create and manage discounts, campaigns and promo codes.
                    </p>
                </div>

                <div className="admin-page-header-actions">

                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={openCreateForm}
                    >
                        + Create Promotion
                    </button>

                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={fetchPromotions}
                        disabled={loading}
                    >
                        {loading
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </div>

            </div>


            {/* Statistics */}
            <div className="seller-stats-grid">

                <div className="seller-stat-card">

                    <div className="seller-stat-label">
                        Total Promotions
                    </div>

                    <div className="seller-stat-value">
                        {statistics.total}
                    </div>

                </div>


                <div className="seller-stat-card">

                    <div className="seller-stat-label">
                        Active
                    </div>

                    <div className="seller-stat-value">
                        {statistics.active}
                    </div>

                </div>


                <div className="seller-stat-card">

                    <div className="seller-stat-label">
                        Scheduled
                    </div>

                    <div className="seller-stat-value">
                        {statistics.scheduled}
                    </div>

                </div>


                <div className="seller-stat-card">

                    <div className="seller-stat-label">
                        Expired
                    </div>

                    <div className="seller-stat-value">
                        {statistics.expired}
                    </div>

                </div>

            </div>


            {/* Alerts */}
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


            {/* Toolbar */}
            <div className="admin-card promotions-toolbar">

                <div className="promotions-search">

                    <input
                        type="text"
                        placeholder="Search promotion or promo code..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <select
                    className="promotions-status-filter"
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All Promotions
                    </option>

                    <option value="ACTIVE">
                        Active
                    </option>

                    <option value="SCHEDULED">
                        Scheduled
                    </option>

                    <option value="EXPIRED">
                        Expired
                    </option>

                    <option value="INACTIVE">
                        Inactive
                    </option>

                </select>

            </div>


            {/* Table */}
            <div className="admin-card promotions-table-card">

                {loading ? (
                    <div className="admin-loading">
                        Loading promotions...
                    </div>
                ) : filteredPromotions.length === 0 ? (
                    <div className="admin-empty-state">

                        <h3>
                            No promotions found
                        </h3>

                        <p>
                            Create a promotion to start offering discounts.
                        </p>

                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table promotions-table">

                            <thead>

                                <tr>

                                    <th>
                                        Promotion
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Discount
                                    </th>

                                    <th>
                                        Minimum Order
                                    </th>

                                    <th>
                                        Start
                                    </th>

                                    <th>
                                        End
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

                                {filteredPromotions.map(
                                    (promotion) => {

                                        const status =
                                            getPromotionStatus(
                                                promotion
                                            );

                                        return (
                                            <tr
                                                key={
                                                    promotion.id
                                                }
                                            >

                                                <td>

                                                    <strong className="promotion-name">
                                                        {
                                                            promotion.name
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <span className="promotion-code">
                                                        {promotion.code ||
                                                            "—"}
                                                    </span>

                                                </td>


                                                <td>

                                                    <strong>
                                                        {formatDiscount(
                                                            promotion
                                                        )}
                                                    </strong>

                                                    <span className="promotion-discount-type">
                                                        {promotion.discount_type ===
                                                        "FIXED"
                                                            ? "Fixed"
                                                            : "Percentage"}
                                                    </span>

                                                </td>


                                                <td>
                                                    KSh{" "}
                                                    {Number(
                                                        promotion.minimum_order_amount ||
                                                        0
                                                    ).toLocaleString(
                                                        "en-KE",
                                                        {
                                                            minimumFractionDigits: 2,
                                                        }
                                                    )}
                                                </td>


                                                <td>
                                                    {formatDate(
                                                        promotion.start_date
                                                    )}
                                                </td>


                                                <td>
                                                    {formatDate(
                                                        promotion.end_date
                                                    )}
                                                </td>


                                                <td>

                                                    <span
                                                        className={`promotion-status-badge ${getStatusClass(
                                                            status
                                                        )}`}
                                                    >
                                                        {
                                                            status
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="admin-table-actions">

                                                        <button
                                                            type="button"
                                                            className="admin-btn admin-btn-small admin-btn-secondary"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    promotion
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="admin-btn admin-btn-small admin-btn-danger"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    promotion
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
                )}

            </div>


            {/* Create/Edit Modal */}
            {showForm && (
                <div className="admin-modal-overlay">

                    <div className="admin-modal promotion-form-modal">

                        <div className="admin-modal-header">

                            <div>

                                <h2>
                                    {editingPromotion
                                        ? "Edit Promotion"
                                        : "Create Promotion"}
                                </h2>

                                <p>
                                    Configure your marketplace discount campaign.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="promotion-form-content">

                                <div className="admin-form-section">

                                    <h3>
                                        Basic Information
                                    </h3>


                                    <div className="admin-form-grid">

                                        <div className="admin-form-group">

                                            <label htmlFor="promotion-name">
                                                Promotion Name
                                            </label>

                                            <input
                                                id="promotion-name"
                                                name="name"
                                                type="text"
                                                value={
                                                    form.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. Weekend Fashion Sale"
                                                required
                                            />

                                        </div>


                                        <div className="admin-form-group">

                                            <label htmlFor="promotion-code">
                                                Promo Code
                                            </label>

                                            <input
                                                id="promotion-code"
                                                name="code"
                                                type="text"
                                                value={
                                                    form.code
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. WEEKEND20"
                                                style={{
                                                    textTransform:
                                                        "uppercase",
                                                }}
                                                required
                                            />

                                        </div>

                                    </div>

                                </div>


                                <div className="admin-form-section">

                                    <h3>
                                        Discount
                                    </h3>


                                    <div className="admin-form-grid">

                                        <div className="admin-form-group">

                                            <label htmlFor="discount-type">
                                                Discount Type
                                            </label>

                                            <select
                                                id="discount-type"
                                                name="discount_type"
                                                value={
                                                    form.discount_type
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            >

                                                <option value="PERCENTAGE">
                                                    Percentage
                                                </option>

                                                <option value="FIXED">
                                                    Fixed Amount
                                                </option>

                                            </select>

                                        </div>


                                        <div className="admin-form-group">

                                            <label htmlFor="discount-value">
                                                Discount Value
                                            </label>

                                            <input
                                                id="discount-value"
                                                name="discount_value"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    form.discount_value
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    form.discount_type ===
                                                    "PERCENTAGE"
                                                        ? "e.g. 20"
                                                        : "e.g. 500"
                                                }
                                                required
                                            />

                                        </div>


                                        <div className="admin-form-group">

                                            <label htmlFor="minimum-order">
                                                Minimum Order Amount
                                            </label>

                                            <input
                                                id="minimum-order"
                                                name="minimum_order_amount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    form.minimum_order_amount
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. 2000"
                                            />

                                        </div>


                                        <div className="admin-form-group">

                                            <label htmlFor="maximum-discount">
                                                Maximum Discount
                                            </label>

                                            <input
                                                id="maximum-discount"
                                                name="maximum_discount_amount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    form.maximum_discount_amount
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Optional"
                                            />

                                        </div>

                                    </div>

                                </div>


                                <div className="admin-form-section">

                                    <h3>
                                        Schedule
                                    </h3>


                                    <div className="admin-form-grid">

                                        <div className="admin-form-group">

                                            <label htmlFor="start-date">
                                                Start Date
                                            </label>

                                            <input
                                                id="start-date"
                                                name="start_date"
                                                type="datetime-local"
                                                value={
                                                    form.start_date
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div className="admin-form-group">

                                            <label htmlFor="end-date">
                                                End Date
                                            </label>

                                            <input
                                                id="end-date"
                                                name="end_date"
                                                type="datetime-local"
                                                value={
                                                    form.end_date
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>


                                <div className="admin-form-section">

                                    <label className="admin-checkbox">

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
                                            Promotion is active
                                        </span>

                                    </label>

                                </div>

                            </div>


                            <div className="admin-modal-footer">

                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingPromotion
                                            ? "Save Changes"
                                            : "Create Promotion"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}


export default Promotions;
