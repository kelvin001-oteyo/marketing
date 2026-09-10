import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

function Products() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    const [selectedCategory, setSelectedCategory] = useState(
        searchParams.get("category") || ""
    );

    const [sortBy, setSortBy] = useState(
        searchParams.get("sort") || "featured"
    );

    const [minPrice, setMinPrice] = useState(
        searchParams.get("min_price") || ""
    );

    const [maxPrice, setMaxPrice] = useState(
        searchParams.get("max_price") || ""
    );

    const getArray = (data) => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.results)) {
            return data.results;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [productsResponse, categoriesResponse] =
                    await Promise.all([
                        api.get("/products/"),
                        api.get("/categories/"),
                    ]);

                setProducts(
                    getArray(productsResponse.data)
                );

                setCategories(
                    getArray(categoriesResponse.data)
                );
            } catch (err) {
                console.error(
                    "Failed to load products:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                        err.response?.data?.message ||
                        "Unable to load marketplace products."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const getProductImage = (product) => {
        return (
            product.image ||
            product.thumbnail ||
            product.main_image ||
            product.images?.[0]?.image ||
            product.product_images?.[0]?.image ||
            ""
        );
    };

    const getProductPrice = (product) => {
        return Number(
            product.current_price ??
                product.discount_price ??
                product.price ??
                0
        );
    };

    const getOriginalPrice = (product) => {
        return Number(product.price ?? 0);
    };

    const hasDiscount = (product) => {
        return (
            getOriginalPrice(product) >
            getProductPrice(product)
        );
    };

    const getDiscountPercentage = (product) => {
        const original = getOriginalPrice(product);
        const current = getProductPrice(product);

        if (!original || current >= original) {
            return 0;
        }

        return Math.round(
            ((original - current) / original) * 100
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(Number(price || 0));
    };

    const getRating = (product) => {
        return Number(product.rating || 0);
    };

    const filteredProducts = useMemo(() => {
        let result = [...products];

        const searchTerm = search
            .trim()
            .toLowerCase();

        if (searchTerm) {
            result = result.filter((product) => {
                const name = String(
                    product.name || ""
                ).toLowerCase();

                const brand = String(
                    product.brand || ""
                ).toLowerCase();

                const description = String(
                    product.description || ""
                ).toLowerCase();

                return (
                    name.includes(searchTerm) ||
                    brand.includes(searchTerm) ||
                    description.includes(searchTerm)
                );
            });
        }

        if (selectedCategory) {
            result = result.filter((product) => {
                const categoryId =
                    product.category?.id ??
                    product.category_id ??
                    product.category;

                return String(categoryId) ===
                    String(selectedCategory);
            });
        }

        if (minPrice !== "") {
            result = result.filter(
                (product) =>
                    getProductPrice(product) >=
                    Number(minPrice)
            );
        }

        if (maxPrice !== "") {
            result = result.filter(
                (product) =>
                    getProductPrice(product) <=
                    Number(maxPrice)
            );
        }

        if (sortBy === "price-low") {
            result.sort(
                (a, b) =>
                    getProductPrice(a) -
                    getProductPrice(b)
            );
        }

        if (sortBy === "price-high") {
            result.sort(
                (a, b) =>
                    getProductPrice(b) -
                    getProductPrice(a)
            );
        }

        if (sortBy === "rating") {
            result.sort(
                (a, b) =>
                    getRating(b) -
                    getRating(a)
            );
        }

        if (sortBy === "newest") {
            result.sort((a, b) => {
                const dateA = new Date(
                    a.created_at || 0
                ).getTime();

                const dateB = new Date(
                    b.created_at || 0
                ).getTime();

                return dateB - dateA;
            });
        }

        if (sortBy === "featured") {
            result.sort((a, b) => {
                const featuredA =
                    a.featured === true ||
                    a.featured === "true";

                const featuredB =
                    b.featured === true ||
                    b.featured === "true";

                return (
                    Number(featuredB) -
                    Number(featuredA)
                );
            });
        }

        return result;
    }, [
        products,
        search,
        selectedCategory,
        sortBy,
        minPrice,
        maxPrice,
    ]);

    const updateUrl = (
        newSearch = search,
        newCategory = selectedCategory,
        newSort = sortBy,
        newMinPrice = minPrice,
        newMaxPrice = maxPrice
    ) => {
        const params = {};

        if (newSearch.trim()) {
            params.search = newSearch.trim();
        }

        if (newCategory) {
            params.category = newCategory;
        }

        if (newSort && newSort !== "featured") {
            params.sort = newSort;
        }

        if (newMinPrice) {
            params.min_price = newMinPrice;
        }

        if (newMaxPrice) {
            params.max_price = newMaxPrice;
        }

        setSearchParams(params);
    };

    const handleSearch = (event) => {
        event.preventDefault();

        updateUrl();
    };

    const handleCategoryChange = (event) => {
        const value = event.target.value;

        setSelectedCategory(value);

        updateUrl(
            search,
            value,
            sortBy,
            minPrice,
            maxPrice
        );
    };

    const handleSortChange = (event) => {
        const value = event.target.value;

        setSortBy(value);

        updateUrl(
            search,
            selectedCategory,
            value,
            minPrice,
            maxPrice
        );
    };

    const handleClearFilters = () => {
        setSearch("");
        setSelectedCategory("");
        setSortBy("featured");
        setMinPrice("");
        setMaxPrice("");

        setSearchParams({});
    };

    return (
        <div className="marketplace">

            {/* Header */}
            <header className="marketplace-header">
                <div className="marketplace-header-inner">

                    <Link
                        to="/"
                        className="marketplace-logo"
                    >
                        <span className="marketplace-logo-mark">
                            CM
                        </span>

                        <span>
                            Clothing
                            <strong>
                                Marketplace
                            </strong>
                        </span>
                    </Link>

                    <form
                        className="marketplace-search"
                        onSubmit={handleSearch}
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search for products, brands and more..."
                        />

                        <button type="submit">
                            Search
                        </button>
                    </form>

                    <div className="marketplace-header-actions">

                        <Link to="/wishlist">
                            Wishlist
                        </Link>

                        <Link to="/cart">
                            Cart
                        </Link>

                        <Link
                            to="/login"
                            className="marketplace-login"
                        >
                            Sign In
                        </Link>

                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="marketplace-nav">
                <div className="marketplace-nav-inner">

                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/products">
                        All Products
                    </Link>

                    <Link to="/categories">
                        Categories
                    </Link>

                    <Link to="/stores">
                        Stores
                    </Link>

                    <Link to="/products?new=true">
                        New Arrivals
                    </Link>

                    <Link to="/products?featured=true">
                        Featured
                    </Link>

                    <Link to="/products?sale=true">
                        Deals
                    </Link>

                </div>
            </nav>

            {/* Page */}
            <main className="products-page">

                <div className="products-page-header">

                    <div>
                        <span className="section-eyebrow">
                            MARKETPLACE
                        </span>

                        <h1>
                            Discover products
                        </h1>

                        <p>
                            Explore clothing and fashion
                            products from marketplace sellers.
                        </p>
                    </div>

                    <div className="products-count">
                        <strong>
                            {filteredProducts.length}
                        </strong>

                        <span>
                            products
                        </span>
                    </div>

                </div>

                {/* Filters */}
                <div className="products-layout">

                    <aside className="products-filters">

                        <div className="filter-header">
                            <h2>
                                Filters
                            </h2>

                            <button
                                type="button"
                                onClick={
                                    handleClearFilters
                                }
                            >
                                Clear
                            </button>
                        </div>

                        <div className="filter-group">

                            <label>
                                Category
                            </label>

                            <select
                                value={
                                    selectedCategory
                                }
                                onChange={
                                    handleCategoryChange
                                }
                            >
                                <option value="">
                                    All categories
                                </option>

                                {categories.map(
                                    (category) => (
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

                        <div className="filter-group">

                            <label>
                                Minimum price
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={minPrice}
                                onChange={(event) =>
                                    setMinPrice(
                                        event.target.value
                                    )
                                }
                                placeholder="KES 0"
                            />

                        </div>

                        <div className="filter-group">

                            <label>
                                Maximum price
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={maxPrice}
                                onChange={(event) =>
                                    setMaxPrice(
                                        event.target.value
                                    )
                                }
                                placeholder="KES 100000"
                            />

                        </div>

                        <button
                            type="button"
                            className="apply-filter-btn"
                            onClick={() =>
                                updateUrl()
                            }
                        >
                            Apply Filters
                        </button>

                    </aside>

                    {/* Products */}
                    <section className="products-results">

                        <div className="products-toolbar">

                            <span>
                                {loading
                                    ? "Loading..."
                                    : `${filteredProducts.length} products`}
                            </span>

                            <select
                                value={sortBy}
                                onChange={
                                    handleSortChange
                                }
                            >
                                <option value="featured">
                                    Featured
                                </option>

                                <option value="newest">
                                    Newest
                                </option>

                                <option value="price-low">
                                    Price: Low to High
                                </option>

                                <option value="price-high">
                                    Price: High to Low
                                </option>

                                <option value="rating">
                                    Highest Rated
                                </option>
                            </select>

                        </div>

                        {error && (
                            <div className="marketplace-error">
                                <strong>
                                    Unable to load products
                                </strong>

                                <p>
                                    {error}
                                </p>
                            </div>
                        )}

                        {loading ? (
                            <div className="products-loading">
                                Loading products...
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="products-empty">

                                <div className="empty-icon">
                                    ◇
                                </div>

                                <h2>
                                    No products found
                                </h2>

                                <p>
                                    Try changing your search
                                    or filters.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        handleClearFilters
                                    }
                                >
                                    Clear Filters
                                </button>

                            </div>
                        ) : (
                            <div className="product-grid">

                                {filteredProducts.map(
                                    (product) => {
                                        const image =
                                            getProductImage(
                                                product
                                            );

                                        return (
                                            <Link
                                                key={
                                                    product.id
                                                }
                                                to={`/products/${product.id}`}
                                                className="marketplace-product-card"
                                            >
                                                <div className="product-image">

                                                    {hasDiscount(
                                                        product
                                                    ) && (
                                                        <span className="product-sale">
                                                            -
                                                            {
                                                                getDiscountPercentage(
                                                                    product
                                                                )
                                                            }
                                                            %
                                                        </span>
                                                    )}

                                                    {image ? (
                                                        <img
                                                            src={
                                                                image
                                                            }
                                                            alt={
                                                                product.name
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="product-image-placeholder">
                                                            <span>
                                                                {product.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}

                                                </div>

                                                <div className="product-card-content">

                                                    <span className="product-brand">
                                                        {product.brand ||
                                                            "Fashion"}
                                                    </span>

                                                    <h3>
                                                        {
                                                            product.name
                                                        }
                                                    </h3>

                                                    <div className="product-rating">

                                                        <span>
                                                            ★
                                                        </span>

                                                        <span>
                                                            {getRating(
                                                                product
                                                            ).toFixed(
                                                                1
                                                            )}
                                                        </span>

                                                        <small>
                                                            (
                                                            {product.review_count ??
                                                                0}
                                                            )
                                                        </small>

                                                    </div>

                                                    <div className="product-price">

                                                        <strong>
                                                            {formatPrice(
                                                                getProductPrice(
                                                                    product
                                                                )
                                                            )}
                                                        </strong>

                                                        {hasDiscount(
                                                            product
                                                        ) && (
                                                            <del>
                                                                {formatPrice(
                                                                    getOriginalPrice(
                                                                        product
                                                                    )
                                                                )}
                                                            </del>
                                                        )}

                                                    </div>

                                                    <span className="product-view-link">
                                                        View Product →
                                                    </span>

                                                </div>
                                            </Link>
                                        );
                                    }
                                )}

                            </div>
                        )}

                    </section>

                </div>

            </main>

            {/* Footer */}
            <footer className="marketplace-footer">

                <div className="marketplace-footer-grid">

                    <div>
                        <Link
                            to="/"
                            className="marketplace-logo footer-logo"
                        >
                            <span className="marketplace-logo-mark">
                                CM
                            </span>

                            <span>
                                Clothing
                                <strong>
                                    Marketplace
                                </strong>
                            </span>
                        </Link>

                        <p>
                            Your destination for discovering
                            clothing, fashion and trusted sellers.
                        </p>
                    </div>

                    <div>
                        <h3>
                            Marketplace
                        </h3>

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
                        <h3>
                            Customer
                        </h3>

                        <Link to="/cart">
                            Cart
                        </Link>

                        <Link to="/wishlist">
                            Wishlist
                        </Link>

                        <Link to="/orders">
                            My Orders
                        </Link>
                    </div>

                    <div>
                        <h3>
                            Sell
                        </h3>

                        <Link to="/sell">
                            Become a Seller
                        </Link>

                        <Link to="/seller">
                            Seller Center
                        </Link>
                    </div>

                </div>

                <div className="marketplace-footer-bottom">

                    <span>
                        © 2026 Clothing Marketplace.
                        All rights reserved.
                    </span>

                    <span>
                        Built for modern fashion commerce.
                    </span>

                </div>

            </footer>

        </div>
    );
}

export default Products;