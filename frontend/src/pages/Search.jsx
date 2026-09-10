import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
    return data?.results || data?.products || [];
}

export default function Search() {
    const [params, setParams] = useSearchParams();

    const initialSearch =
        params.get("q") || "";

    const [search, setSearch] =
        useState(initialSearch);

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        performSearch(initialSearch);
    }, [initialSearch]);

    async function performSearch(query) {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/products/?search=${encodeURIComponent(
                    query
                )}&page_size=100`
            );

            setProducts(
                getProducts(response.data)
            );
        } catch (err) {
            console.error(err);

            setError(
                "Unable to search products."
            );
        } finally {
            setLoading(false);
        }
    }

    function submitSearch(e) {
        e.preventDefault();

        const query = search.trim();

        if (!query) return;

        setParams({
            q: query,
        });
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

                    <form
                        className="marketplace-main-search"
                        onSubmit={submitSearch}
                    >
                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="What are you looking for?"
                        />

                        <button type="submit">
                            Search
                        </button>
                    </form>

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
                    </nav>
                </div>
            </header>

            <main className="marketplace-container marketplace-main">
                <div className="marketplace-breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <span>Search</span>
                </div>

                <section className="seller-page-heading">
                    <div>
                        <span className="seller-eyebrow">
                            MARKETPLACE SEARCH
                        </span>

                        <h1>
                            Search results for "
                            {initialSearch}"
                        </h1>

                        <p>
                            Find products and compare
                            available options.
                        </p>
                    </div>
                </section>

                {loading && (
                    <div className="marketplace-state">
                        Searching products...
                    </div>
                )}

                {error && (
                    <div className="marketplace-error">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    products.length === 0 && (
                        <div className="marketplace-empty">
                            <h3>
                                No products found
                            </h3>

                            <p>
                                Try a different search
                                term.
                            </p>

                            <Link
                                to="/products"
                                className="marketplace-primary-btn"
                            >
                                Browse Products
                            </Link>
                        </div>
                    )}

                {!loading &&
                    products.length > 0 && (
                        <section className="marketplace-product-grid">
                            {products.map(
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
                                                    {product.brand ||
                                                        "Marketplace"}
                                                </span>

                                                <h3>
                                                    {
                                                        product.name
                                                    }
                                                </h3>

                                                <div className="marketplace-product-rating">
                                                    ★{" "}
                                                    {product.rating ||
                                                        "0.0"}
                                                    <span>
                                                        (
                                                        {product.review_count ||
                                                            0}
                                                        )
                                                    </span>
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
            </main>
        </div>
    );
}