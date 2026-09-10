import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";


const initialForm = {
    seller: "",
    category: "",
    name: "",
    description: "",
    brand: "",
    price: "",
    discount_price: "",
    featured: false,
    new_arrival: false,
    status: "DRAFT",
};


export default function AddProduct() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);

    const [sellers, setSellers] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    useEffect(() => {
        const loadFormData = async () => {
            setLoadingData(true);
            setError("");

            try {
                const [sellerResponse, categoryResponse] =
                    await Promise.all([
                        api.get("/sellers/admin/all/"),
                        api.get("/categories/"),
                    ]);

                const sellerData = sellerResponse.data;

                if (Array.isArray(sellerData)) {
                    setSellers(sellerData);
                } else if (
                    Array.isArray(sellerData.results)
                ) {
                    setSellers(sellerData.results);
                } else {
                    setSellers([]);
                }


                const categoryData = categoryResponse.data;

                if (Array.isArray(categoryData)) {
                    setCategories(categoryData);
                } else if (
                    Array.isArray(categoryData.results)
                ) {
                    setCategories(categoryData.results);
                } else {
                    setCategories([]);
                }

            } catch (err) {
                console.error(
                    "Failed to load product form data:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Unable to load sellers and categories."
                );
            } finally {
                setLoadingData(false);
            }
        };

        loadFormData();
    }, []);


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

        setError("");
        setSuccess("");
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");


        if (!form.seller) {
            setError("Please select a seller.");
            return;
        }

        if (!form.category) {
            setError("Please select a category.");
            return;
        }

        if (!form.name.trim()) {
            setError("Product name is required.");
            return;
        }

        if (!form.price) {
            setError("Product price is required.");
            return;
        }

        const price = Number(form.price);

        if (Number.isNaN(price) || price < 0) {
            setError(
                "Product price must be a valid positive amount."
            );
            return;
        }


        let discountPrice = null;

        if (form.discount_price !== "") {
            discountPrice = Number(
                form.discount_price
            );

            if (
                Number.isNaN(discountPrice) ||
                discountPrice < 0
            ) {
                setError(
                    "Discount price must be a valid amount."
                );
                return;
            }

            if (discountPrice >= price) {
                setError(
                    "Discount price must be lower than the original price."
                );
                return;
            }
        }


        const payload = {
            seller: Number(form.seller),
            category: Number(form.category),
            name: form.name.trim(),
            description: form.description.trim(),
            brand: form.brand.trim(),
            price: price,
            discount_price: discountPrice,
            featured: form.featured,
            new_arrival: form.new_arrival,
            status: form.status,
        };


        setSaving(true);

        try {
            await api.post(
                "/products/",
                payload
            );

            setSuccess(
                "Product created successfully."
            );

            setTimeout(() => {
                navigate("/admin/products");
            }, 800);

        } catch (err) {
            console.error(
                "Failed to create product:",
                err
            );

            const responseData =
                err.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {
                const messages = [];

                Object.entries(responseData).forEach(
                    ([field, value]) => {
                        if (Array.isArray(value)) {
                            messages.push(
                                `${field}: ${value.join(", ")}`
                            );
                        } else if (
                            typeof value === "string"
                        ) {
                            messages.push(
                                `${field}: ${value}`
                            );
                        }
                    }
                );

                if (messages.length > 0) {
                    setError(
                        messages.join(" ")
                    );
                } else {
                    setError(
                        "Unable to create the product."
                    );
                }
            } else {
                setError(
                    "Unable to create the product."
                );
            }

        } finally {
            setSaving(false);
        }
    };


    if (loadingData) {
        return (
            <div className="admin-page">
                <div className="table-state">
                    Loading product form...
                </div>
            </div>
        );
    }


    return (
        <div className="admin-page add-product-page">

            <div className="page-heading">

                <div>
                    <h1>Add Product</h1>

                    <p>
                        Create a new product for the
                        marketplace.
                    </p>
                </div>

                <Link
                    to="/admin/products"
                    className="secondary-button"
                >
                    Back to Products
                </Link>

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


            <form
                className="product-form"
                onSubmit={handleSubmit}
            >

                {/* BASIC INFORMATION */}

                <section className="form-section">

                    <div className="form-section-heading">
                        <h2>Basic Information</h2>

                        <p>
                            Enter the main information
                            about this product.
                        </p>
                    </div>


                    <div className="form-grid">

                        <div className="form-group form-group-full">

                            <label htmlFor="name">
                                Product Name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Premium Cotton T-Shirt"
                                maxLength={255}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="brand">
                                Brand
                            </label>

                            <input
                                id="brand"
                                name="brand"
                                type="text"
                                value={form.brand}
                                onChange={handleChange}
                                placeholder="e.g. Nike"
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="category">
                                Category
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
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        <div className="form-group">

                            <label htmlFor="seller">
                                Seller
                            </label>

                            <select
                                id="seller"
                                name="seller"
                                value={form.seller}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select seller
                                </option>

                                {sellers.map(
                                    (seller) => (
                                        <option
                                            key={seller.id}
                                            value={seller.id}
                                        >
                                            {seller.store_name}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        <div className="form-group">

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

                                <option value="OUT_OF_STOCK">
                                    Out of Stock
                                </option>

                                <option value="ARCHIVED">
                                    Archived
                                </option>

                            </select>

                        </div>


                        <div className="form-group form-group-full">

                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the product..."
                                rows="6"
                            />

                        </div>

                    </div>

                </section>


                {/* PRICING */}

                <section className="form-section">

                    <div className="form-section-heading">
                        <h2>Pricing</h2>

                        <p>
                            Set the normal and discounted
                            selling prices.
                        </p>
                    </div>


                    <div className="form-grid">

                        <div className="form-group">

                            <label htmlFor="price">
                                Original Price (KES)
                            </label>

                            <input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                            />

                        </div>


                        <div className="form-group">

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
                                placeholder="Optional"
                            />

                        </div>

                    </div>

                </section>


                {/* VISIBILITY */}

                <section className="form-section">

                    <div className="form-section-heading">
                        <h2>Marketplace Visibility</h2>

                        <p>
                            Control how this product is
                            highlighted on the marketplace.
                        </p>
                    </div>


                    <div className="checkbox-grid">

                        <label className="checkbox-option">

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
                                    Highlight this product
                                    in featured sections.
                                </small>
                            </span>

                        </label>


                        <label className="checkbox-option">

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
                                    Show this product in
                                    new arrivals.
                                </small>
                            </span>

                        </label>

                    </div>

                </section>


                {/* ACTIONS */}

                <div className="form-actions">

                    <Link
                        to="/admin/products"
                        className="secondary-button"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={saving}
                    >
                        {saving
                            ? "Creating..."
                            : "Create Product"}
                    </button>

                </div>

            </form>

        </div>
    );
}