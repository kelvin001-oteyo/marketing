import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";
import ProductVariants from "../../components/admin/ProductVariants";


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


export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);

    const [product, setProduct] = useState(null);
    const [sellers, setSellers] = useState([]);
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
                const [
                    productResponse,
                    sellerResponse,
                    categoryResponse,
                ] = await Promise.all([
                    api.get(`/products/${id}/`),
                    api.get("/sellers/admin/all/"),
                    api.get("/categories/"),
                ]);


                const productData =
                    productResponse.data;

                setProduct(productData);


                setForm({
                    seller:
                        productData.seller ?? "",
                    category:
                        productData.category ?? "",
                    name:
                        productData.name ?? "",
                    description:
                        productData.description ?? "",
                    brand:
                        productData.brand ?? "",
                    price:
                        productData.price ?? "",
                    discount_price:
                        productData.discount_price ?? "",
                    featured:
                        Boolean(productData.featured),
                    new_arrival:
                        Boolean(productData.new_arrival),
                    status:
                        productData.status ?? "DRAFT",
                });


                const sellerData =
                    sellerResponse.data;

                if (Array.isArray(sellerData)) {
                    setSellers(sellerData);
                } else if (
                    Array.isArray(sellerData.results)
                ) {
                    setSellers(
                        sellerData.results
                    );
                }


                const categoryData =
                    categoryResponse.data;

                if (Array.isArray(categoryData)) {
                    setCategories(categoryData);
                } else if (
                    Array.isArray(
                        categoryData.results
                    )
                ) {
                    setCategories(
                        categoryData.results
                    );
                }

            } catch (err) {
                console.error(
                    "Failed to load product:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Unable to load product."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);


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
            setError(
                "Please select a seller."
            );
            return;
        }


        if (!form.category) {
            setError(
                "Please select a category."
            );
            return;
        }


        if (!form.name.trim()) {
            setError(
                "Product name is required."
            );
            return;
        }


        if (!form.price) {
            setError(
                "Product price is required."
            );
            return;
        }


        const price = Number(form.price);

        if (
            Number.isNaN(price) ||
            price < 0
        ) {
            setError(
                "Product price must be a valid amount."
            );
            return;
        }


        let discountPrice = null;

        if (
            form.discount_price !== "" &&
            form.discount_price !== null
        ) {
            discountPrice =
                Number(form.discount_price);

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
            description:
                form.description.trim(),
            brand: form.brand.trim(),
            price,
            discount_price: discountPrice,
            featured: form.featured,
            new_arrival: form.new_arrival,
            status: form.status,
        };


        setSaving(true);


        try {
            const response = await api.put(
                `/products/${id}/`,
                payload
            );

            setProduct(response.data);

            setSuccess(
                "Product updated successfully."
            );

            setTimeout(() => {
                navigate("/admin/products");
            }, 800);

        } catch (err) {
            console.error(
                "Failed to update product:",
                err
            );

            const responseData =
                err.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {
                const messages = [];

                Object.entries(
                    responseData
                ).forEach(
                    ([field, value]) => {
                        if (
                            Array.isArray(value)
                        ) {
                            messages.push(
                                `${field}: ${value.join(
                                    ", "
                                )}`
                            );
                        } else if (
                            typeof value ===
                            "string"
                        ) {
                            messages.push(
                                `${field}: ${value}`
                            );
                        }
                    }
                );

                setError(
                    messages.length
                        ? messages.join(" ")
                        : "Unable to update product."
                );
            } else {
                setError(
                    "Unable to update product."
                );
            }

        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="admin-page">
                <div className="table-state">
                    Loading product...
                </div>
            </div>
        );
    }


    if (!product) {
        return (
            <div className="admin-page">

                <div className="admin-alert admin-alert-error">
                    {error ||
                        "Product not found."}
                </div>

                <Link
                    to="/admin/products"
                    className="secondary-button"
                >
                    Back to Products
                </Link>

            </div>
        );
    }


    return (
        <div className="admin-page edit-product-page">

            <div className="page-heading">

                <div>
                    <h1>Edit Product</h1>

                    <p>
                        Update product information
                        and marketplace visibility.
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

                <section className="form-section">

                    <div className="form-section-heading">

                        <h2>
                            Basic Information
                        </h2>

                        <p>
                            Update the product's
                            marketplace information.
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
                                            value={
                                                seller.id
                                            }
                                        >
                                            {
                                                seller.store_name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        <div className="form-group">

                            <label htmlFor="status">
                                Status
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
                                rows="6"
                                value={
                                    form.description
                                }
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </section>


                <section className="form-section">

                    <div className="form-section-heading">

                        <h2>
                            Pricing
                        </h2>

                        <p>
                            Manage the product's
                            pricing.
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
                            />

                        </div>

                    </div>

                </section>


                <section className="form-section">

                    <div className="form-section-heading">

                        <h2>
                            Marketplace Visibility
                        </h2>

                        <p>
                            Choose how the product
                            should appear across
                            the marketplace.
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
                                    Highlight this
                                    product in
                                    featured sections.
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
                                    Display this
                                    product in new
                                    arrivals.
                                </small>

                            </span>

                        </label>

                    </div>

                </section>


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
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </div>

            </form>
          <ProductVariants productId={id} />

            {/* VARIANTS WILL BE ADDED HERE */}

        </div>
    );
}