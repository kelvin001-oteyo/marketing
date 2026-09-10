import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProducts = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/products/", {
                params: {
                    search: search || undefined,
                    ordering: "-created_at",
                },
            });

            const data = response.data;

            if (Array.isArray(data)) {
                setProducts(data);
            } else if (Array.isArray(data.results)) {
                setProducts(data.results);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Failed to load products:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        fetchProducts();
    };

    const handleDelete = async (product) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/products/${product.id}/`);

            setProducts((currentProducts) =>
                currentProducts.filter(
                    (item) => item.id !== product.id
                )
            );
        } catch (err) {
            console.error("Failed to delete product:", err);

            window.alert(
                err.response?.data?.detail ||
                "Unable to delete this product."
            );
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "ACTIVE":
                return "status-badge status-active";

            case "DRAFT":
                return "status-badge status-draft";

            case "OUT_OF_STOCK":
                return "status-badge status-out";

            case "ARCHIVED":
                return "status-badge status-archived";

            default:
                return "status-badge";
        }
    };

    const formatPrice = (price) => {
        const numericPrice = Number(price);

        if (Number.isNaN(numericPrice)) {
            return "KES 0.00";
        }

        return `KES ${numericPrice.toLocaleString(
            "en-KE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    return (
        <div className="admin-page products-page">

            <div className="page-heading">
                <div>
                    <h1>Products</h1>

                    <p>
                        Manage products, prices, sellers,
                        categories and product visibility.
                    </p>
                </div>

                <Link
                    to="/admin/products/new"
                    className="primary-button"
                >
                    + Add Product
                </Link>
            </div>

            <div className="products-toolbar">

                <form
                    onSubmit={handleSearch}
                    className="product-search"
                >
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                    <button type="submit">
                        Search
                    </button>
                </form>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={fetchProducts}
                >
                    Refresh
                </button>

            </div>

            {error && (
                <div className="admin-alert admin-alert-error">
                    {error}
                </div>
            )}

            <div className="products-card">

                {loading ? (
                    <div className="table-state">
                        Loading products...
                    </div>
                ) : products.length === 0 ? (
                    <div className="table-state">
                        <h3>No products found</h3>

                        <p>
                            Add your first product to start
                            building the marketplace.
                        </p>

                        <Link
                            to="/admin/products/new"
                            className="primary-button"
                        >
                            Add Product
                        </Link>
                    </div>
                ) : (
                    <div className="table-wrapper">

                        <table className="admin-table">

                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Seller</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Flags</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {products.map((product) => (
                                    <tr key={product.id}>

                                        <td>
                                            <div className="product-name-cell">
                                                <strong>
                                                    {product.name}
                                                </strong>

                                                {product.brand && (
                                                    <span>
                                                        {product.brand}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            {product.seller_name ||
                                                "—"}
                                        </td>

                                        <td>
                                            {product.category_name ||
                                                "—"}
                                        </td>

                                        <td>
                                            <div className="price-cell">

                                                {product.discount_price ? (
                                                    <>
                                                        <strong>
                                                            {formatPrice(
                                                                product.discount_price
                                                            )}
                                                        </strong>

                                                        <span className="old-price">
                                                            {formatPrice(
                                                                product.price
                                                            )}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <strong>
                                                        {formatPrice(
                                                            product.price
                                                        )}
                                                    </strong>
                                                )}

                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    product.status
                                                )}
                                            >
                                                {product.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="product-flags">

                                                {product.featured && (
                                                    <span>
                                                        Featured
                                                    </span>
                                                )}

                                                {product.new_arrival && (
                                                    <span>
                                                        New
                                                    </span>
                                                )}

                                                {!product.featured &&
                                                    !product.new_arrival && (
                                                        <span>
                                                            —
                                                        </span>
                                                    )}

                                            </div>
                                        </td>

                                        <td>
                                            <div className="table-actions">

                                                <Link
                                                    to={`/admin/products/${product.id}/edit`}
                                                    className="action-link"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            product
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

                    </div>
                )}

            </div>

        </div>
    );
}