import React, { useEffect, useState } from "react";
import {
    Link,
    useParams,
} from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const MEDIA_BASE_URL = "http://127.0.0.1:8000";

function imageUrl(image) {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${MEDIA_BASE_URL}${image}`;
}

function getProducts(data) {
    if (Array.isArray(data)) return data;

    return (
        data?.results ||
        data?.products ||
        []
    );
}

export default function CategoryProducts() {
    const { slug } = useParams();

    const [category, setCategory] =
        useState(null);

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        loadCategory();
    }, [slug]);

    async function loadCategory() {
        try {
            setLoading(true);
            setError("");

            const categoryResponse =
                await api.get(
                    `/categories/${slug}/`
                );

            const categoryData =
                categoryResponse.data;

            setCategory(categoryData);

            const productResponse =
                await api.get(
                    `/products/?category=${categoryData.id}&page_size=100`
                );

            setProducts(
                getProducts(
                    productResponse.data
                )
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.status === 404
                    ? "Category not found."
                    : "Unable to load category."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <div className="marketplace-container marketplace-header-inner">
                    <Link
                        to="/"
                        className="marketplace-logo"
                    >
                        Oteyo<span>Market</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/products">
                            Products
                        </Link>
                        <Link to="/categories">
                            Categories
                        </Link>
                        <Link to="/stores">
                            Stores
                        </Link>
                        <Link to="/cart">
                            Cart
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="marketplace-container marketplace-main">
                <div className="marketplace-breadcrumb">
                    <Link to="/">
                        Home
                    </Link>
                    <span>/</span>
                    <Link to="/categories">
                        Categories
                    </Link>
                    <span>/</span>
                    <span>
                        {category?.name ||
                            "Category"}
                    </span>
                </div>

                {loading && (
                    <div className="marketplace-state">
                        Loading category...
                    </div>
                )}

                {error && (
                    <div className="marketplace-error">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    category && (
                        <>
                            <section className="category-products-hero">
                                <span>
                                    CATEGORY
                                </span>

                                <h1>
                                    {
                                        category.name
                                    }
                                </h1>

                                <p>
                                    {category.description ||
                                        `Explore products in ${category.name}.`}
                                </p>

                                <strong>
                                    {
                                        products.length
                                    }{" "}
                                    products
                                </strong>
                            </section>

                            {products.length ===
                            0 ? (
                                <div className="marketplace-empty">
                                    <h3>
                                        No products
                                        available
                                    </h3>

                                    <p>
                                        This category
                                        currently has
                                        no products.
                                    </p>
                                </div>
                            ) : (
                                <section className="marketplace-product-grid">
                                    {products.map(
                                        (
                                            product
                                        ) => {
                                            const image =
                                                product.primary_image ||
                                                product.image ||
                                                product
                                                    .images?.[0]
                                                    ?.image;

                                            const price =
                                                product.current_price ||
                                                product.discount_price ||
                                                product.price;

                                            return (
                                                <Link
                                                    key={
                                                        product.id
                                                    }
                                                    to={`/products/${product.id}`}
                                                    className="marketplace-product-card"
                                                >
                                                    <div className="marketplace-product-image">
                                                        {image ? (
                                                            <img
                                                                src={imageUrl(
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

                                                    <div className="marketplace-product-info">
                                                        <span className="marketplace-product-brand">
                                                            {
                                                                product.brand
                                                            }
                                                        </span>

                                                        <h3>
                                                            {
                                                                product.name
                                                            }
                                                        </h3>

                                                        <div className="marketplace-product-rating">
                                                            ★{" "}
                                                            {
                                                                product.rating
                                                            }
                                                        </div>

                                                        <strong>
                                                            KSh{" "}
                                                            {Number(
                                                                price ||
                                                                    0
                                                            ).toLocaleString()}
                                                        </strong>
                                                    </div>
                                                </Link>
                                            );
                                        }
                                    )}
                                </section>
                            )}
                        </>
                    )}
            </main>
        </div>
    );
}