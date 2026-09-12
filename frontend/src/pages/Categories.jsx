import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconSearch = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
    </svg>
);

const IconGrid = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

/* =========================================================
   CATEGORIES
========================================================= */

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

            setCategories(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            console.error("Failed to load categories:", err);
            setError("Unable to load categories.");
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get("/products/?page_size=100");
            const data = response.data;

            setProducts(Array.isArray(data) ? data : data.results || []);
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
        if (!query) return categories;

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
        if (category.image) return category.image;

        const categoryName = category.name?.toLowerCase() || "";

        const fallbackImages = {
            men: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=800&q=80",
            women: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
            shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
            bags: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
            accessories: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80",
            kids: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80",
        };

        for (const key of Object.keys(fallbackImages)) {
            if (categoryName.includes(key)) return fallbackImages[key];
        }

        return "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80";
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <Header />
                <main className="nf-categories-page">
                    <div className="marketplace-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading categories…</p>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       MAIN
    ========================================================= */

    return (
        <div className="marketplace">
            <Header />

            <nav className="marketplace-nav" aria-label="Primary">
                <div className="marketplace-nav-inner">
                    <Link to="/">Home</Link>
                    <Link to="/products">All Products</Link>
                    <Link to="/categories" className="active">Categories</Link>
                    <Link to="/stores">Stores</Link>
                    <Link to="/products?new=true">New Arrivals</Link>
                    <Link to="/products?featured=true">Featured</Link>
                    <Link to="/products?sale=true">Deals</Link>
                </div>
            </nav>

            {/* ---- Hero ---- */}
            <section className="nf-categories-hero" aria-labelledby="nf-cat-hero-title">
                <div className="nf-categories-hero-bg" aria-hidden="true" />
                <div className="nf-categories-hero-overlay" aria-hidden="true" />

                <div className="nf-categories-hero-inner">
                    <span className="section-eyebrow">EXPLORE THE MARKETPLACE</span>
                    <h1 id="nf-cat-hero-title">
                        Shop by <br />
                        <span>category</span>
                    </h1>
                    <p>
                        Discover clothing, footwear, accessories and more from
                        sellers across the marketplace.
                    </p>

                    <div className="nf-categories-hero-stats">
                        <div>
                            <strong>{categories.length}</strong>
                            <span>Categories</span>
                        </div>
                        <div>
                            <strong>{products.length}</strong>
                            <span>Products</span>
                        </div>
                        <div>
                            <strong>{parentCategories.length}</strong>
                            <span>Top-level</span>
                        </div>
                    </div>
                </div>
            </section>

            <main className="nf-categories-page">
                {/* ---- Toolbar ---- */}
                <div className="nf-categories-toolbar">
                    <div>
                        <span className="section-eyebrow">BROWSE</span>
                        <h2>All categories</h2>
                        <p>
                            {categories.length} categor
                            {categories.length === 1 ? "y" : "ies"} available
                        </p>
                    </div>

                    <div className="nf-categories-search">
                        <span className="nf-search-icon" aria-hidden="true">
                            <IconSearch />
                        </span>
                        <label htmlFor="cat-search" className="nf-visually-hidden">
                            Search categories
                        </label>
                        <input
                            id="cat-search"
                            type="search"
                            placeholder="Search categories..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="marketplace-error" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                {/* ---- Empty ---- */}
                {parentCategories.length === 0 ? (
                    <section className="nf-categories-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconGrid />
                        </div>
                        <h3>No categories found</h3>
                        <p>
                            {search
                                ? "Try a different category search."
                                : "Categories will appear here once they are added."}
                        </p>
                        {search && (
                            <button
                                type="button"
                                className="nf-btn-ghost"
                                onClick={() => setSearch("")}
                            >
                                Clear search
                            </button>
                        )}
                    </section>
                ) : (
                    <div className="nf-categories-list">
                        {parentCategories.map((category, index) => {
                            const subcategories = getSubcategories(category.id);
                            const productCount = getCategoryProductCount(category);
                            const bannerImage = getCategoryImage(category);

                            return (
                                <section
                                    key={category.id}
                                    className="nf-category-section"
                                    aria-labelledby={`cat-${category.id}-title`}
                                >
                                    {/* Section heading */}
                                    <header className="nf-category-section-head">
                                        <div>
                                            <span className="section-eyebrow">
                                                {String(index + 1).padStart(2, "0")} · CATEGORY
                                            </span>
                                            <h2 id={`cat-${category.id}-title`}>
                                                {category.name}
                                            </h2>
                                            {category.description && (
                                                <p>{category.description}</p>
                                            )}
                                        </div>

                                        <Link
                                            to={`/products?category=${category.id}`}
                                            className="nf-cat-shop-all"
                                        >
                                            Shop all <IconArrow />
                                        </Link>
                                    </header>

                                    {/* Feature card */}
                                    <div className="nf-category-feature">
                                        {/* Banner */}
                                        <Link
                                            to={`/products?category=${category.id}`}
                                            className="nf-category-feature-image"
                                            aria-label={`Explore ${category.name}`}
                                        >
                                            <img
                                                src={bannerImage}
                                                alt={category.name}
                                                loading="lazy"
                                            />
                                            <span className="nf-cat-overlay" aria-hidden="true" />

                                            <div className="nf-cat-feature-text">
                                                <span>Explore</span>
                                                <h3>{category.name}</h3>
                                                <small>
                                                    {productCount} product
                                                    {productCount === 1 ? "" : "s"}
                                                </small>
                                            </div>
                                        </Link>

                                        {/* Subcategories or direct shop */}
                                        <div className="nf-category-feature-side">
                                            {subcategories.length > 0 ? (
                                                <>
                                                    <p className="nf-subcat-label">
                                                        Subcategories
                                                    </p>
                                                    <div className="nf-subcategory-grid">
                                                        {subcategories.map((sub) => (
                                                            <Link
                                                                key={sub.id}
                                                                to={`/products?category=${sub.id}`}
                                                                className="nf-subcategory-card"
                                                            >
                                                                <div className="nf-subcategory-thumb">
                                                                    <img
                                                                        src={getCategoryImage(sub)}
                                                                        alt={sub.name}
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <strong>{sub.name}</strong>
                                                                    <span>
                                                                        {getCategoryProductCount(sub)}{" "}
                                                                        product
                                                                        {getCategoryProductCount(sub) === 1 ? "" : "s"}
                                                                    </span>
                                                                </div>
                                                                <IconArrow />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="nf-category-direct">
                                                    <div>
                                                        <strong>
                                                            {productCount} product
                                                            {productCount === 1 ? "" : "s"}
                                                        </strong>
                                                        <p>
                                                            Explore everything available
                                                            in this category.
                                                        </p>
                                                    </div>
                                                    <Link
                                                        to={`/products?category=${category.id}`}
                                                        className="nf-btn-primary"
                                                    >
                                                        Shop category <IconArrow />
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

            {/* ---- Footer ---- */}
            <footer className="marketplace-footer">
                <div className="marketplace-footer-grid">
                    <div>
                        <Link to="/" className="marketplace-logo footer-logo">
                            <span className="marketplace-logo-mark">NF</span>
                            <span>Nila<strong>Fashion</strong></span>
                        </Link>
                        <p>
                            A modern marketplace connecting customers with
                            trusted clothing sellers.
                        </p>
                    </div>

                    <div>
                        <h3>Marketplace</h3>
                        <Link to="/products">Products</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/stores">Stores</Link>
                    </div>

                    <div>
                        <h3>Customer</h3>
                        <Link to="/orders">Orders</Link>
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/cart">Cart</Link>
                    </div>

                    <div>
                        <h3>Sell with us</h3>
                        <Link to="/sell">Become a seller</Link>
                        <Link to="/seller">Seller dashboard</Link>
                    </div>
                </div>

                <div className="marketplace-footer-bottom">
                    <span>
                        © {new Date().getFullYear()} Nila Fashion. All rights reserved.
                    </span>
                    <span>Secure checkout • M-Pesa supported</span>
                </div>
            </footer>
        </div>
    );
};

/* =========================================================
   HEADER (small local component)
========================================================= */

function Header() {
    return (
        <header className="marketplace-header">
            <div className="marketplace-header-inner">
                <Link to="/" className="marketplace-logo" aria-label="Nila Fashion home">
                    <span className="marketplace-logo-mark">NF</span>
                    <span>Nila<strong>Fashion</strong></span>
                </Link>

                <form
                    className="marketplace-search"
                    role="search"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <label htmlFor="cat-header-search" className="nf-visually-hidden">
                        Search products
                    </label>
                    <input
                        id="cat-header-search"
                        type="text"
                        placeholder="Search products, brands and more..."
                    />
                    <button type="submit">Search</button>
                </form>

                <div className="marketplace-header-actions">
                    <Link to="/wishlist" className="nf-header-link">
                        <span aria-hidden="true">♡</span>
                        <span>Wishlist</span>
                    </Link>
                    <Link to="/cart" className="nf-header-link">
                        <span aria-hidden="true">🛍</span>
                        <span>Cart</span>
                    </Link>
                    <Link to="/login" className="marketplace-login">
                        Sign In
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Categories;
