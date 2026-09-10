import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories/");
            const data = response.data;

            setCategories(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error("Failed to load categories:", err);
            setError("Unable to load categories.");
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get(
                "/products/?page_size=100"
            );

            const data = response.data;

            setProducts(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error("Failed to load products:", err);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryProductCount = (category) => {
        return products.filter((product) => {
            const categoryId =
                typeof product.category === "object"
                    ? product.category?.id
                    : product.category;

            return String(categoryId) === String(category.id);
        }).length;
    };

    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return categories;
        }

        return categories.filter((category) =>
            category.name?.toLowerCase().includes(query)
        );
    }, [categories, search]);

    const parentCategories = filteredCategories.filter(
        (category) => !category.parent
    );

    const getSubcategories = (parentId) => {
        return filteredCategories.filter((category) => {
            const parentIdValue =
                typeof category.parent === "object"
                    ? category.parent?.id
                    : category.parent;

            return String(parentIdValue) === String(parentId);
        });
    };

    const getCategoryImage = (category) => {
        if (category.image) {
            return category.image;
        }

        const categoryName =
            category.name?.toLowerCase() || "";

        const fallbackImages = {
            men: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=800&q=80",
            women: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
            shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
            bags: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
            accessories:
                "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80",
            kids: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80",
        };

        for (const key of Object.keys(fallbackImages)) {
            if (categoryName.includes(key)) {
                return fallbackImages[key];
            }
        }

        return "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80";
    };

    if (loading) {
        return (
            <div className="marketplace-page">
                <div className="marketplace-container">
                    <div className="marketplace-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading categories...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="marketplace-page">
            {/* HEADER */}
            <header className="marketplace-header">
                <div className="marketplace-container marketplace-header-inner">
                    <Link
                        to="/"
                        className="marketplace-logo"
                    >
                        Kelvoh<span>Market</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/">Home</Link>
                        <Link to="/products">Products</Link>
                        <Link
                            to="/categories"
                            className="active"
                        >
                            Categories
                        </Link>
                        <Link to="/stores">Stores</Link>
                        <Link to="/sell">Sell</Link>
                    </nav>

                    <div className="marketplace-actions">
                        <Link
                            to="/wishlist"
                            className="marketplace-action"
                        >
                            ♡
                        </Link>

                        <Link
                            to="/cart"
                            className="marketplace-action"
                        >
                            🛒
                        </Link>

                        <Link
                            to="/login"
                            className="marketplace-login-button"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO */}
            <section className="categories-hero">
                <div className="marketplace-container">
                    <div className="categories-hero-content">
                        <span>EXPLORE THE MARKETPLACE</span>

                        <h1>
                            Shop by
                            <br />
                            category
                        </h1>

                        <p>
                            Discover clothing, footwear,
                            accessories and more from sellers
                            across the marketplace.
                        </p>
                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <main className="marketplace-container categories-page">
                <div className="categories-toolbar">
                    <div>
                        <h2>All categories</h2>
                        <p>
                            {categories.length} categories
                            available
                        </p>
                    </div>

                    <div className="categories-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>
                </div>

                {error && (
                    <div className="marketplace-error">
                        <p>{error}</p>
                    </div>
                )}

                {parentCategories.length === 0 ? (
                    <div className="categories-empty">
                        <div>⌕</div>
                        <h3>No categories found</h3>
                        <p>
                            Try a different category search.
                        </p>
                    </div>
                ) : (
                    <div className="categories-list">
                        {parentCategories.map((category) => {
                            const subcategories =
                                getSubcategories(category.id);

                            const productCount =
                                getCategoryProductCount(
                                    category
                                );

                            return (
                                <section
                                    className="category-section"
                                    key={category.id}
                                >
                                    <div className="category-section-heading">
                                        <div>
                                            <h2>
                                                {category.name}
                                            </h2>

                                            {category.description && (
                                                <p>
                                                    {
                                                        category.description
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <Link
                                            to={`/products?category=${category.id}`}
                                        >
                                            Shop all →
                                        </Link>
                                    </div>

                                    <div className="category-feature-card">
                                        <Link
                                            to={`/products?category=${category.id}`}
                                            className="category-feature-image"
                                        >
                                            <img
                                                src={getCategoryImage(
                                                    category
                                                )}
                                                alt={
                                                    category.name
                                                }
                                            />

                                            <div className="category-feature-overlay">
                                                <span>
                                                    Explore
                                                </span>
                                                <h3>
                                                    {
                                                        category.name
                                                    }
                                                </h3>
                                            </div>
                                        </Link>

                                        <div className="category-subcategory-area">
                                            {subcategories.length >
                                            0 ? (
                                                <div className="subcategory-grid">
                                                    {subcategories.map(
                                                        (
                                                            subcategory
                                                        ) => (
                                                            <Link
                                                                key={
                                                                    subcategory.id
                                                                }
                                                                to={`/products?category=${subcategory.id}`}
                                                                className="subcategory-card"
                                                            >
                                                                <div className="subcategory-image">
                                                                    <img
                                                                        src={getCategoryImage(
                                                                            subcategory
                                                                        )}
                                                                        alt={
                                                                            subcategory.name
                                                                        }
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <strong>
                                                                        {
                                                                            subcategory.name
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {getCategoryProductCount(
                                                                            subcategory
                                                                        )}{" "}
                                                                        products
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="category-direct-shop">
                                                    <div>
                                                        <strong>
                                                            {
                                                                productCount
                                                            }{" "}
                                                            products
                                                        </strong>

                                                        <p>
                                                            Explore
                                                            everything
                                                            available
                                                            in this
                                                            category.
                                                        </p>
                                                    </div>

                                                    <Link
                                                        to={`/products?category=${category.id}`}
                                                        className="marketplace-primary-button"
                                                    >
                                                        Shop category
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="marketplace-footer">
                <div className="marketplace-container marketplace-footer-grid">
                    <div>
                        <Link
                            to="/"
                            className="marketplace-logo"
                        >
                            Kelvoh<span>Market</span>
                        </Link>

                        <p>
                            A modern marketplace connecting
                            customers with trusted clothing
                            sellers.
                        </p>
                    </div>

                    <div>
                        <h4>Marketplace</h4>
                        <Link to="/products">
                            Products
                        </Link>
                        <Link to="/categories">
                            Categories
                        </Link>
                        <Link to="/stores">
                            Stores
                        </Link>
                    </div>

                    <div>
                        <h4>Customer</h4>
                        <Link to="/orders">Orders</Link>
                        <Link to="/wishlist">
                            Wishlist
                        </Link>
                        <Link to="/cart">Cart</Link>
                    </div>

                    <div>
                        <h4>Sell with us</h4>
                        <Link to="/sell">
                            Become a seller
                        </Link>
                        <Link to="/seller">
                            Seller dashboard
                        </Link>
                    </div>
                </div>

                <div className="marketplace-footer-bottom">
                    © {new Date().getFullYear()} KelvohMarket.
                    All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Categories;