import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const MEDIA_BASE_URL = "http://127.0.0.1:8000";

function getImageUrl(image) {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${MEDIA_BASE_URL}${image}`;
}

function getProducts(data) {
    if (Array.isArray(data)) return data;
    return data?.results || data?.products || data?.items || [];
}

function getCategories(data) {
    if (Array.isArray(data)) return data;
    return data?.results || data?.categories || [];
}

export default function SellerProducts() {
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [category, setCategory] = useState("ALL");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const sellerResponse = await api.get("/sellers/me/");
            const sellerData = sellerResponse.data;

            setSeller(sellerData);

            const requests = [
                api.get(
                    `/products/?seller=${sellerData.id}&page_size=100`
                ),
                api.get("/categories/?page_size=100"),
            ];

            const [productsResponse, categoriesResponse] =
                await Promise.all(requests);

            setProducts(getProducts(productsResponse.data));
            setCategories(getCategories(categoriesResponse.data));
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                setError("Please sign in to manage your products.");
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load your products."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const text = `${product.name || ""} ${
                product.brand || ""
            } ${product.slug || ""}`.toLowerCase();

            const matchesSearch = text.includes(search.toLowerCase());

            const matchesStatus =
                status === "ALL" || product.status === status;

            const productCategory =
                product.category?.id || product.category;

            const matchesCategory =
                category === "ALL" ||
                String(productCategory) === String(category);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );
        });
    }, [products, search, status, category]);

    const activeProducts = products.filter(
        (product) => product.status === "ACTIVE"
    ).length;

    const outOfStockProducts = products.filter(
        (product) => product.status === "OUT_OF_STOCK"
    ).length;

    const featuredProducts = products.filter(
        (product) => product.featured
    ).length;

    return (
        <div className="marketplace-page seller-products-page">
            <header className="marketplace-header">
                <div className="marketplace-container marketplace-header-inner">
                    <Link to="/" className="marketplace-logo">
                        Oteyo<span>Market</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/seller/dashboard">Dashboard</Link>
                        <Link className="active" to="/seller/products">
                            Products
                        </Link>
                        <Link to="/seller/inventory">Inventory</Link>
                        <Link to="/seller/orders">Orders</Link>
                        <Link to="/seller/store">My Store</Link>
                    </nav>

                    <div className="marketplace-header-actions">
                        <Link to="/products">Marketplace</Link>
                    </div>
                </div>
            </header>

            <main className="marketplace-container marketplace-main">
                <div className="marketplace-breadcrumb">
                    <Link to="/seller/dashboard">Seller Center</Link>
                    <span>/</span>
                    <span>Products</span>
                </div>

                <section className="seller-page-heading">
                    <div>
                        <span className="seller-eyebrow">
                            SELLER CENTER
                        </span>
                        <h1>My Products</h1>
                        <p>
                            Manage the products you sell across your
                            marketplace store.
                        </p>
                    </div>

                    <Link
                        to="/seller/products/new"
                        className="marketplace-primary-btn"
                    >
                        + Add Product
                    </Link>
                </section>

                {seller && (
                    <div className="seller-store-strip">
                        <div>
                            <strong>{seller.store_name}</strong>
                            <span>
                                {seller.verified
                                    ? "Verified seller"
                                    : "Seller account"}
                            </span>
                        </div>

                        <Link
                            to={`/stores/${
                                seller.store_slug ||
                                seller.slug ||
                                seller.id
                            }`}
                        >
                            View Store
                        </Link>
                    </div>
                )}

                <section className="seller-stats-grid">
                    <div className="seller-stat-card">
                        <span>Total Products</span>
                        <strong>{products.length}</strong>
                    </div>

                    <div className="seller-stat-card">
                        <span>Active</span>
                        <strong>{activeProducts}</strong>
                    </div>

                    <div className="seller-stat-card">
                        <span>Featured</span>
                        <strong>{featuredProducts}</strong>
                    </div>

                    <div className="seller-stat-card">
                        <span>Out of Stock</span>
                        <strong>{outOfStockProducts}</strong>
                    </div>
                </section>

                <section className="seller-products-toolbar">
                    <div className="marketplace-search-box">
                        <input
                            type="text"
                            placeholder="Search your products..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value)
                        }
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="OUT_OF_STOCK">
                            Out of Stock
                        </option>
                        <option value="ARCHIVED">Archived</option>
                    </select>

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                    >
                        <option value="ALL">All Categories</option>

                        {categories.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.name}
                            </option>
                        ))}
                    </select>
                </section>

                {loading && (
                    <div className="marketplace-state">
                        Loading your products...
                    </div>
                )}

                {!loading && error && (
                    <div className="marketplace-error">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    filteredProducts.length === 0 && (
                        <div className="marketplace-empty">
                            <h3>No products found</h3>
                            <p>
                                Add your first product to start selling.
                            </p>

                            <Link
                                to="/seller/products/new"
                                className="marketplace-primary-btn"
                            >
                                Add Your First Product
                            </Link>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    filteredProducts.length > 0 && (
                        <section className="seller-products-table-section">
                            <div className="seller-products-table-wrap">
                                <table className="seller-products-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Rating</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredProducts.map(
                                            (product) => {
                                                const image =
                                                    product.primary_image ||
                                                    product.image ||
                                                    product.images?.[0]
                                                        ?.image;

                                                const price =
                                                    product.current_price ||
                                                    product.discount_price ||
                                                    product.price;

                                                return (
                                                    <tr
                                                        key={
                                                            product.id
                                                        }
                                                    >
                                                        <td>
                                                            <div className="seller-product-cell">
                                                                <div className="seller-product-thumb">
                                                                    {image ? (
                                                                        <img
                                                                            src={getImageUrl(
                                                                                image
                                                                            )}
                                                                            alt={
                                                                                product.name
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <span>
                                                                            No
                                                                            Image
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <strong>
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </strong>

                                                                    <small>
                                                                        {product.brand ||
                                                                            "No brand"}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {product.category_name ||
                                                                product.category?.name ||
                                                                "Uncategorized"}
                                                        </td>

                                                        <td>
                                                            KSh{" "}
                                                            {Number(
                                                                price || 0
                                                            ).toLocaleString()}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`seller-status seller-status-${String(
                                                                    product.status ||
                                                                        ""
                                                                ).toLowerCase()}`}
                                                            >
                                                                {product.status ||
                                                                    "UNKNOWN"}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            ★{" "}
                                                            {product.rating ||
                                                                "0.0"}
                                                        </td>

                                                        <td>
                                                            <div className="seller-table-actions">
                                                                <Link
                                                                    to={`/products/${product.id}`}
                                                                >
                                                                    View
                                                                </Link>

                                                                <Link
                                                                    to={`/seller/products/${product.id}/edit`}
                                                                >
                                                                    Edit
                                                                </Link>

                                                                <Link
                                                                    to={`/seller/products/${product.id}/variants`}
                                                                >
                                                                    Variants
                                                                </Link>
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
        </div>
    );
}