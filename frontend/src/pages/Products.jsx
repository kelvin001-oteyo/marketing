import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

const IconSliders = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 6h10" />
        <path d="M18 6h2" />
        <circle cx="16" cy="6" r="2" />
        <path d="M4 12h4" />
        <path d="M12 12h8" />
        <circle cx="10" cy="12" r="2" />
        <path d="M4 18h10" />
        <path d="M18 18h2" />
        <circle cx="16" cy="18" r="2" />
    </svg>
);

const IconClose = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

const IconHeart = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
);

const IconSpark = () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
    </svg>
);

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product, helpers }) {
    const {
        getProductImage,
        getProductPrice,
        getOriginalPrice,
        hasDiscount,
        getDiscountPercentage,
        formatPrice,
        getRating,
    } = helpers;

    const image = getProductImage(product);
    const name = product.name || "Product";

    return (
        <Link
            to={`/products/${product.id}`}
            className="marketplace-product-card nf-product-card"
            aria-label={name}
        >
            <div className="product-image">
                {hasDiscount(product) && (
                    <span className="product-sale">
                        -{getDiscountPercentage(product)}%
                    </span>
                )}

                <button
                    type="button"
                    className="nf-wishlist-btn"
                    aria-label={`Add ${name} to wishlist`}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                >
                    <IconHeart />
                </button>

                {image ? (
                    <img src={image} alt={name} loading="lazy" />
                ) : (
                    <div className="product-image-placeholder">
                        <span>{name.charAt(0).toUpperCase()}</span>
                    </div>
                )}
            </div>

            <div className="product-card-content">
                <span className="product-brand">
                    {product.brand || "Nila Fashion"}
                </span>

                <h3>{name}</h3>

                <div
                    className="product-rating"
                    aria-label={`Rated ${getRating(product).toFixed(1)} out of 5`}
                >
                    <span aria-hidden="true">★</span>
                    <span>{getRating(product).toFixed(1)}</span>
                    <small>({product.review_count ?? 0})</small>
                </div>

                <div className="product-price">
                    <strong>{formatPrice(getProductPrice(product))}</strong>
                    {hasDiscount(product) && (
                        <del>{formatPrice(getOriginalPrice(product))}</del>
                    )}
                </div>
            </div>
        </Link>
    );
}

/* =========================================================
   PRODUCTS
========================================================= */

function Products() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState(searchParams.get("search") || "");
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

    const [filtersOpen, setFiltersOpen] = useState(false);

    /* ---------- helpers (unchanged behaviour) ---------- */

    const getArray = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        if (Array.isArray(data?.data)) return data.data;
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

                setProducts(getArray(productsResponse.data));
                setCategories(getArray(categoriesResponse.data));
            } catch (err) {
                console.error("Failed to load products:", err);
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

    const getProductImage = (product) =>
        product.image ||
        product.thumbnail ||
        product.main_image ||
        product.images?.[0]?.image ||
        product.product_images?.[0]?.image ||
        "";

    const getProductPrice = (product) =>
        Number(
            product.current_price ??
            product.discount_price ??
            product.price ??
            0
        );

    const getOriginalPrice = (product) => Number(product.price ?? 0);

    const hasDiscount = (product) =>
        getOriginalPrice(product) > getProductPrice(product);

    const getDiscountPercentage = (product) => {
        const original = getOriginalPrice(product);
        const current = getProductPrice(product);
        if (!original || current >= original) return 0;
        return Math.round(((original - current) / original) * 100);
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(Number(price || 0));

    const getRating = (product) => Number(product.rating || 0);

    /* ---------- filtering / sorting (unchanged) ---------- */

    const filteredProducts = useMemo(() => {
        let result = [...products];
        const searchTerm = search.trim().toLowerCase();

        if (searchTerm) {
            result = result.filter((product) => {
                const name = String(product.name || "").toLowerCase();
                const brand = String(product.brand || "").toLowerCase();
                const description = String(product.description || "").toLowerCase();
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
                return String(categoryId) === String(selectedCategory);
            });
        }

        if (minPrice !== "") {
            result = result.filter(
                (product) => getProductPrice(product) >= Number(minPrice)
            );
        }

        if (maxPrice !== "") {
            result = result.filter(
                (product) => getProductPrice(product) <= Number(maxPrice)
            );
        }

        if (sortBy === "price-low") {
            result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        }
        if (sortBy === "price-high") {
            result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        }
        if (sortBy === "rating") {
            result.sort((a, b) => getRating(b) - getRating(a));
        }
        if (sortBy === "newest") {
            result.sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            });
        }
        if (sortBy === "featured") {
            result.sort((a, b) => {
                const featuredA = a.featured === true || a.featured === "true";
                const featuredB = b.featured === true || b.featured === "true";
                return Number(featuredB) - Number(featuredA);
            });
        }

        return result;
    }, [products, search, selectedCategory, sortBy, minPrice, maxPrice]);

    /* ---------- URL sync (unchanged) ---------- */

    const updateUrl = (
        newSearch = search,
        newCategory = selectedCategory,
        newSort = sortBy,
        newMinPrice = minPrice,
        newMaxPrice = maxPrice
    ) => {
        const params = {};

        if (newSearch.trim()) params.search = newSearch.trim();
        if (newCategory) params.category = newCategory;
        if (newSort && newSort !== "featured") params.sort = newSort;
        if (newMinPrice) params.min_price = newMinPrice;
        if (newMaxPrice) params.max_price = newMaxPrice;

        setSearchParams(params);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        updateUrl();
    };

    const handleCategoryChange = (event) => {
        const value = event.target.value;
        setSelectedCategory(value);
        updateUrl(search, value, sortBy, minPrice, maxPrice);
    };

    const handleSortChange = (event) => {
        const value = event.target.value;
        setSortBy(value);
        updateUrl(search, selectedCategory, value, minPrice, maxPrice);
    };

    const handleClearFilters = () => {
        setSearch("");
        setSelectedCategory("");
        setSortBy("featured");
        setMinPrice("");
        setMaxPrice("");
        setSearchParams({});
    };

    const activeFilterCount = [
        search,
        selectedCategory,
        minPrice,
        maxPrice,
        sortBy !== "featured" ? sortBy : "",
    ].filter(Boolean).length;

    const helpers = {
        getProductImage,
        getProductPrice,
        getOriginalPrice,
        hasDiscount,
        getDiscountPercentage,
        formatPrice,
        getRating,
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="marketplace">

            {/* ================= HEADER ================= */}
            <header className="marketplace-header">
                <div className="marketplace-header-inner">
                    <Link to="/" className="marketplace-logo" aria-label="Nila Fashion home">
                        <span className="marketplace-logo-mark">NF</span>
                        <span>Nila<strong>Fashion</strong></span>
                    </Link>

                    <form
                        className="marketplace-search"
                        role="search"
                        onSubmit={handleSearch}
                    >
                        <label htmlFor="products-header-search" className="nf-visually-hidden">
                            Search products
                        </label>
                        <input
                            id="products-header-search"
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search for products, brands and more..."
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

            {/* ================= NAV ================= */}
            <nav className="marketplace-nav" aria-label="Primary">
                <div className="marketplace-nav-inner">
                    <Link to="/">Home</Link>
                    <Link to="/products" className="active">All Products</Link>
                    <Link to="/categories">Categories</Link>
                    <Link to="/stores">Stores</Link>
                    <Link to="/products?new=true">New Arrivals</Link>
                    <Link to="/products?featured=true">Featured</Link>
                    <Link to="/products?sale=true">Deals</Link>
                </div>
            </nav>

            <main className="products-page nf-products-page">

                {/* ---- Page heading ---- */}
                <header className="nf-products-heading">
                    <div>
                        <span className="section-eyebrow">MARKETPLACE</span>
                        <h1>Discover products</h1>
                        <p>
                            Explore clothing and fashion products from
                            marketplace sellers.
                        </p>
                    </div>

                    <div className="nf-products-count" aria-live="polite">
                        <strong>{filteredProducts.length}</strong>
                        <span>
                            product{filteredProducts.length === 1 ? "" : "s"}
                        </span>
                    </div>
                </header>

                {/* ---- Mobile filter toggle ---- */}
                <button
                    type="button"
                    className="nf-filters-toggle"
                    onClick={() => setFiltersOpen((v) => !v)}
                    aria-expanded={filtersOpen}
                    aria-controls="nf-products-filters"
                >
                    {filtersOpen ? <IconClose /> : <IconSliders />}
                    <span>
                        {filtersOpen ? "Hide filters" : "Show filters"}
                    </span>
                    {activeFilterCount > 0 && (
                        <span className="nf-filter-badge">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* ---- Layout ---- */}
                <div className="nf-products-layout">

                    {/* ------- Filters ------- */}
                    <aside
                        id="nf-products-filters"
                        className={`nf-products-filters ${filtersOpen ? "is-open" : ""}`}
                        aria-label="Product filters"
                    >
                        <div className="nf-filters-head">
                            <div>
                                <span className="section-eyebrow">REFINE</span>
                                <h2>Filters</h2>
                            </div>

                            {activeFilterCount > 0 && (
                                <button
                                    type="button"
                                    className="nf-clear-btn"
                                    onClick={handleClearFilters}
                                >
                                    Clear ({activeFilterCount})
                                </button>
                            )}
                        </div>

                        <div className="nf-filter-group">
                            <label htmlFor="filter-category">Category</label>
                            <select
                                id="filter-category"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="">All categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="nf-filter-group">
                            <label htmlFor="filter-min">Minimum price</label>
                            <input
                                id="filter-min"
                                type="number"
                                min="0"
                                value={minPrice}
                                onChange={(event) => setMinPrice(event.target.value)}
                                placeholder="KES 0"
                            />
                        </div>

                        <div className="nf-filter-group">
                            <label htmlFor="filter-max">Maximum price</label>
                            <input
                                id="filter-max"
                                type="number"
                                min="0"
                                value={maxPrice}
                                onChange={(event) => setMaxPrice(event.target.value)}
                                placeholder="KES 100000"
                            />
                        </div>

                        <button
                            type="button"
                            className="nf-btn-primary nf-apply-btn"
                            onClick={() => {
                                updateUrl();
                                setFiltersOpen(false);
                            }}
                        >
                            Apply Filters
                        </button>
                    </aside>

                    {/* ------- Results ------- */}
                    <section className="nf-products-results" aria-label="Product results">
                        <div className="nf-results-toolbar">
                            <span className="nf-results-count">
                                {loading
                                    ? "Loading products…"
                                    : `${filteredProducts.length} product${
                                          filteredProducts.length === 1 ? "" : "s"
                                      } found`}
                            </span>

                            <div className="nf-sort">
                                <label htmlFor="sort-select" className="nf-visually-hidden">
                                    Sort products
                                </label>
                                <select
                                    id="sort-select"
                                    value={sortBy}
                                    onChange={handleSortChange}
                                >
                                    <option value="featured">Featured</option>
                                    <option value="newest">Newest</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="marketplace-error nf-error" role="alert">
                                <strong>Unable to load products</strong>
                                <p>{error}</p>
                            </div>
                        )}

                        {loading ? (
                            <div className="nf-products-skeleton" aria-hidden="true">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div className="nf-skeleton-card" key={i}>
                                        <div className="nf-skeleton-image" />
                                        <div className="nf-skeleton-line" />
                                        <div className="nf-skeleton-line short" />
                                        <div className="nf-skeleton-line tiny" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="nf-products-empty">
                                <div className="nf-empty-icon" aria-hidden="true">
                                    <IconSpark />
                                </div>
                                <h2>No products found</h2>
                                <p>Try changing your search or filters.</p>
                                <button
                                    type="button"
                                    className="nf-btn-primary"
                                    onClick={handleClearFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="product-grid">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        helpers={helpers}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* ================= FOOTER ================= */}
            <footer className="marketplace-footer">
                <div className="marketplace-footer-grid">
                    <div>
                        <Link to="/" className="marketplace-logo footer-logo">
                            <span className="marketplace-logo-mark">NF</span>
                            <span>Nila<strong>Fashion</strong></span>
                        </Link>
                        <p>
                            Your destination for discovering clothing, fashion
                            and trusted sellers.
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
                        <Link to="/cart">Cart</Link>
                        <Link to="/wishlist">Wishlist</Link>
                        <Link to="/orders">My Orders</Link>
                    </div>

                    <div>
                        <h3>Sell</h3>
                        <Link to="/sell">Become a Seller</Link>
                        <Link to="/seller">Seller Center</Link>
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
}

export default Products;
