import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        parent: "",
        image: null,
        is_active: true,
    });

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/categories/");

            const data = response.data;

            if (Array.isArray(data)) {
                setCategories(data);
            } else if (Array.isArray(data.results)) {
                setCategories(data.results);
            } else {
                setCategories([]);
            }
        } catch (err) {
            console.error(
                "Failed to load categories:",
                err
            );

            setError(
                err.response?.data?.detail ||
                    "Failed to load categories."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            parent: "",
            image: null,
            is_active: true,
        });

        setEditingId(null);
        setError("");
    };

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
            files,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "file"
                    ? files?.[0] || null
                    : value,
        }));
    };

    const validateForm = () => {
        if (!form.name.trim()) {
            setError("Category name is required.");
            return false;
        }

        if (form.name.trim().length < 2) {
            setError(
                "Category name must contain at least 2 characters."
            );
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

        try {
            setSaving(true);

            const payload = new FormData();

            payload.append(
                "name",
                form.name.trim()
            );

            payload.append(
                "description",
                form.description.trim()
            );

            payload.append(
                "is_active",
                form.is_active ? "true" : "false"
            );

            if (form.parent) {
                payload.append(
                    "parent",
                    form.parent
                );
            } else {
                payload.append(
                    "parent",
                    ""
                );
            }

            if (form.image) {
                payload.append(
                    "image",
                    form.image
                );
            }

            if (editingId) {
                await api.patch(
                    `/categories/${editingId}/`,
                    payload,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                setSuccess(
                    "Category updated successfully."
                );
            } else {
                await api.post(
                    "/categories/",
                    payload,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

                setSuccess(
                    "Category created successfully."
                );
            }

            resetForm();
            await loadCategories();
        } catch (err) {
            console.error(
                "Failed to save category:",
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
                        "Failed to save category."
                );
            } else {
                setError(
                    "Failed to save category."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);

        setForm({
            name: category.name || "",
            description:
                category.description || "",
            parent:
                category.parent ||
                category.parent_id ||
                "",
            image: null,
            is_active:
                category.is_active !== false,
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `Delete "${category.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/categories/${category.id}/`
            );

            setSuccess(
                "Category deleted successfully."
            );

            if (
                editingId === category.id
            ) {
                resetForm();
            }

            await loadCategories();
        } catch (err) {
            console.error(
                "Failed to delete category:",
                err
            );

            setError(
                err.response?.data?.detail ||
                    "Failed to delete category. It may contain products or subcategories."
            );
        }
    };

    const filteredCategories = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return categories.filter(
            (category) => {
                const name =
                    String(
                        category.name || ""
                    ).toLowerCase();

                const description =
                    String(
                        category.description ||
                            ""
                    ).toLowerCase();

                const matchesSearch =
                    !query ||
                    name.includes(query) ||
                    description.includes(query);

                const matchesStatus =
                    statusFilter ===
                        "ALL" ||
                    (statusFilter ===
                        "ACTIVE" &&
                        category.is_active) ||
                    (statusFilter ===
                        "INACTIVE" &&
                        !category.is_active);

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    }, [
        categories,
        search,
        statusFilter,
    ]);

    const parentCategories =
        categories.filter(
            (category) =>
                !category.parent &&
                !category.parent_id
        );

    const getParentName = (
        category
    ) => {
        const parentId =
            category.parent ||
            category.parent_id;

        if (!parentId) {
            return "Main Category";
        }

        const parent =
            categories.find(
                (item) =>
                    Number(item.id) ===
                    Number(parentId)
            );

        return (
            parent?.name ||
            category.parent_name ||
            "Subcategory"
        );
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Categories</h1>

                    <p>
                        Manage marketplace
                        categories and
                        subcategories.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={loadCategories}
                    disabled={loading}
                >
                    {loading
                        ? "Refreshing..."
                        : "Refresh"}
                </button>
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

            <div className="categories-layout">
                <section className="admin-card category-form-card">
                    <div className="admin-card-header">
                        <div>
                            <h2>
                                {editingId
                                    ? "Edit Category"
                                    : "Add Category"}
                            </h2>

                            <p>
                                Create a main
                                category or
                                assign it as a
                                subcategory.
                            </p>
                        </div>

                        {editingId && (
                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary admin-btn-small"
                                onClick={
                                    resetForm
                                }
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    <form
                        className="admin-form"
                        onSubmit={
                            handleSubmit
                        }
                    >
                        <div className="admin-form-group">
                            <label htmlFor="category-name">
                                Name
                            </label>

                            <input
                                id="category-name"
                                type="text"
                                name="name"
                                value={
                                    form.name
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. Men's Clothing"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label htmlFor="category-description">
                                Description
                            </label>

                            <textarea
                                id="category-description"
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                rows="5"
                                placeholder="Describe this category..."
                            />
                        </div>

                        <div className="admin-form-group">
                            <label htmlFor="category-parent">
                                Parent Category
                            </label>

                            <select
                                id="category-parent"
                                name="parent"
                                value={
                                    form.parent
                                }
                                onChange={
                                    handleChange
                                }
                            >
                                <option value="">
                                    Main Category
                                </option>

                                {parentCategories
                                    .filter(
                                        (
                                            category
                                        ) =>
                                            Number(
                                                category.id
                                            ) !==
                                            Number(
                                                editingId
                                            )
                                    )
                                    .map(
                                        (
                                            category
                                        ) => (
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

                        <div className="admin-form-group">
                            <label htmlFor="category-image">
                                Category Image
                            </label>

                            <input
                                id="category-image"
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={
                                    handleChange
                                }
                            />

                            <small>
                                Optional. Use a
                                clear image that
                                represents the
                                category.
                            </small>
                        </div>

                        <div className="admin-form-group admin-checkbox-group">
                            <label>
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
                                    Category is
                                    active
                                </span>
                            </label>
                        </div>

                        <div className="admin-form-actions">
                            <button
                                type="submit"
                                className="admin-btn admin-btn-primary"
                                disabled={
                                    saving
                                }
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                    ? "Update Category"
                                    : "Create Category"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={
                                        resetForm
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="admin-card">
                    <div className="admin-toolbar">
                        <div className="admin-search">
                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search categories..."
                            />
                        </div>

                        <div className="inventory-filters">
                            <button
                                type="button"
                                className={
                                    statusFilter ===
                                    "ALL"
                                        ? "inventory-filter active"
                                        : "inventory-filter"
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        "ALL"
                                    )
                                }
                            >
                                All
                            </button>

                            <button
                                type="button"
                                className={
                                    statusFilter ===
                                    "ACTIVE"
                                        ? "inventory-filter active"
                                        : "inventory-filter"
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        "ACTIVE"
                                    )
                                }
                            >
                                Active
                            </button>

                            <button
                                type="button"
                                className={
                                    statusFilter ===
                                    "INACTIVE"
                                        ? "inventory-filter active"
                                        : "inventory-filter"
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        "INACTIVE"
                                    )
                                }
                            >
                                Inactive
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="admin-loading">
                            Loading categories...
                        </div>
                    ) : filteredCategories.length ===
                      0 ? (
                        <div className="admin-empty">
                            <h3>
                                No categories
                                found
                            </h3>

                            <p>
                                Create your
                                first
                                marketplace
                                category.
                            </p>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table categories-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Description
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
                                    {filteredCategories.map(
                                        (
                                            category
                                        ) => (
                                            <tr
                                                key={
                                                    category.id
                                                }
                                            >
                                                <td>
                                                    <strong>
                                                        {
                                                            category.name
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="category-type">
                                                        {getParentName(
                                                            category
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="category-description-cell">
                                                    {category.description ||
                                                        "—"}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${
                                                            category.is_active
                                                                ? "status-active"
                                                                : "status-archived"
                                                        }`}
                                                    >
                                                        {category.is_active
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
                                                                    category
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
                                                                    category
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Categories;