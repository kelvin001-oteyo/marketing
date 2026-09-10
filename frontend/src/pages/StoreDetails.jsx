import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const StoreDetails = () => {
    const { slug } = useParams();

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        fetchStore();
    }, [slug]);

    useEffect(() => {
        if (store) {
            fetchStoreProducts();
        }
    }, [store]);

    const fetchStore = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/sellers/${slug}/`);

            setStore(response.data);
        } catch (err) {
            console.error("Failed to load store:", err);

            setError(
                err.response?.data?.detail ||
                    "Unable to load this store."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchStoreProducts = async () => {
        try {
            setProductsLoading(true);

            const sellerId = store.id;

            const response = await api.get(
                `/products/?seller=${sellerId}&page_size=100`
            );

            const data = response.data;

            setProducts(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error(
                "Failed to load store products:",
                err
            );

            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    const getBanner = () => {
        return (
            store?.banner ||
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85"
        );
    };

    const getLogo = () => {
        return (
            store?.logo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                store?.store_name || "Store"
            )}&background=111111&color=ffffff&size=300`
        );
    };

    const formatPrice = (value) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0,
        }).format(Number(value || 0));
    };

    const filteredProducts = useMemo(() => {
        let result = [...products];

        const query = search.trim().toLowerCase();

        if (query) {
            result = result.filter((product) =>
                product.name
                    ?.toLowerCase()
                    .includes(query)
            );
        }

        if (sort === "price-low") {
            result.sort(
                (a, b) =>
                    Number(
                        a.current_price ??
                            a.discount_price ??
                            a.price ??
                            0
                    ) -
                    Number(
                        b.current_price ??
                            b.discount_price ??
                            b.price ??
                            0
                    )
            );
        }

        if (sort === "price-high") {
            result.sort(
                (a, b) =>
                    Number(
                        b.current_price ??
                            b.discount_price ??
                            b.price ??
                            0
                    ) -
                    Number(
                        a.current_price ??
                            a.discount_price ??
                            a.price ??
                            0
                    )
            );
        }

        if (sort === "rating") {
            result.sort(
                (a, b) =>
                    Number(b.rating || 0) -
                    Number(a.rating || 0)
            );
        }

        return result;
    }, [products, search, sort]);

    if (loading) {
        return (
            <div className="marketplace-page">
                <div className="marketplace-container">
                    <div className="marketplace-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading store...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="marketplace-page">
                <div className="marketplace-container">
                    <div className="marketplace-error">
                        <h2>Store unavailable</h2>

                        <p>
                            {error ||
                                "This store could not be found."}
                        </p>

                        <Link
                            to="/stores"
                            className="marketplace-primary-button"
                        >
                            Back to stores
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const productCount =
        store.product_count ??
        store.products_count ??
        products.length;

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
                        <Link to="/categories">
                            Categories
                        </Link>
                        <Link
                            to="/stores"
                            className="active"
                        >
                            Stores
                        </Link>
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

            {/* STORE BANNER */}
            <section className="store-details-banner">
                <img
                    src={getBanner()}
                    alt={`${store.store_name} banner`}
                />

                <div className="store-details-banner-overlay"></div>

                <div className="marketplace-container store-details-banner-content">
                    <div className="store-details-logo">
                        <img
                            src={getLogo()}
                            alt={store.store_name}
                        />
                    </div>

                    <div className="store-details-heading">
                        <div className="store-name-row">
                            <h1>{store.store_name}</h1>

                            {store.verified && (
                                <span className="store-details-verified">
                                    ✓ Verified
                                </span>
                            )}
                        </div>

                        {store.location && (
                            <p>📍 {store.location}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* STORE CONTENT */}
            <main className="marketplace-container store-details-page">
                {/* STORE STATS */}
                <section className="store-stat-grid">
                    <div>
                        <strong>
                            {Number(
                                store.rating || 0
                            ).toFixed(1)}
                        </strong>

                        <span>Store rating</span>
                    </div>

                    <div>
                        <strong>{productCount}</strong>

                        <span>Products</span>
                    </div>

                    <div>
                        <strong>
                            {store.verified ? "Verified" : "Active"}
                        </strong>

                        <span>Seller status</span>
                    </div>

                    <div>
                        <strong>
                            {store.created_at
                                ? new Date(
                                      store.created_at
                                  ).getFullYear()
                                : "—"}
                        </strong>

                        <span>Joined</span>
                    </div>
                </section>

                {/* ABOUT STORE */}
                <section className="store-about-section">
                    <div className="store-about-content">
                        <span className="store-section-label">
                            ABOUT THE STORE
                        </span>

                        <h2>
                            {store.store_name}
                        </h2>

                        <p>
                            {store.description ||
                                "Welcome to our marketplace store. Discover quality clothing and fashion products from our collection."}
                        </p>

                        <div className="store-contact-details">
                            {store.location && (
                                <div>
                                    <span>Location</span>
                                    <strong>
                                        {store.location}
                                    </strong>
                                </div>
                            )}

                            {store.phone && (
                                <div>
                                    <span>Contact</span>
                                    <strong>
                                        {store.phone}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="store-trust-card">
                        <div className="trust-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                {store.verified
                                    ? "Verified seller"
                                    : "Marketplace seller"}
                            </strong>

                            <p>
                                {store.verified
                                    ? "This seller has been verified by the marketplace."
                                    : "This seller is currently active on the marketplace."}
                            </p>
                        </div>
                    </div>
                </section>

                {/* PRODUCTS */}
                <section className="store-products-section">
                    <div className="store-products-header">
                        <div>
                            <span className="store-section-label">
                                STORE COLLECTION
                            </span>

                            <h2>
                                Products from{" "}
                                {store.store_name}
                            </h2>
                        </div>

                        <div className="store-products-controls">
                            <div className="store-product-search">
                                <span>⌕</span>

                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <select
                                value={sort}
                                onChange={(event) =>
                                    setSort(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="newest">
                                    Newest
                                </option>

                                <option value="price-low">
                                    Price: Low to high
                                </option>

                                <option value="price-high">
                                    Price: High to low
                                </option>

                                <option value="rating">
                                    Top rated
                                </option>
                            </select>
                        </div>
                    </div>

                    {productsLoading ? (
                        <div className="marketplace-loading">
                            <div className="loading-spinner"></div>
                            <p>
                                Loading store products...
                            </p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="store-products-empty">
                            <div>◇</div>

                            <h3>
                                {search
                                    ? "No matching products"
                                    : "No products yet"}
                            </h3>

                            <p>
                                {search
                                    ? "Try another search term."
                                    : "This seller has not listed any products yet."}
                            </p>

                            {search && (
                                <button
                                    type="button"
                                    className="marketplace-secondary-button"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="marketplace-product-grid">
                            {filteredProducts.map(
                                (product) => {
                                    const image =
                                        product.images?.[0]
                                            ?.image ||
                                        product.image ||
                                        "https://via.placeholder.com/500x500?text=No+Image";

                                    const currentPrice =
                                        product.current_price ??
                                        product.discount_price ??
                                        product.price ??
                                        0;

                                    const originalPrice =
                                        product.price ??
                                        currentPrice;

                                    const discount =
                                        Number(
                                            originalPrice
                                        ) >
                                        Number(
                                            currentPrice
                                        )
                                            ? Math.round(
                                                  ((Number(
                                                      originalPrice
                                                  ) -
                                                      Number(
                                                          currentPrice
                                                      )) /
                                                      Number(
                                                          originalPrice
                                                      )) *
                                                      100
                                              )
                                            : 0;

                                    return (
                                        <Link
                                            key={
                                                product.id
                                            }
                                            to={`/products/${product.id}`}
                                            className="marketplace-product-card"
                                        >
                                            <div className="product-card-image">
                                                <img
                                                    src={image}
                                                    alt={
                                                        product.name
                                                    }
                                                />

                                                {discount >
                                                    0 && (
                                                    <span className="product-card-discount">
                                                        -
                                                        {
                                                            discount
                                                        }
                                                        %
                                                    </span>
                                                )}
                                            </div>

                                            <div className="product-card-body">
                                                <span className="store-product-brand">
                                                    {product.brand ||
                                                        "Fashion"}
                                                </span>

                                                <h3>
                                                    {
                                                        product.name
                                                    }
                                                </h3>

                                                <div className="product-card-rating">
                                                    ★★★★★{" "}
                                                    <span>
                                                        (
                                                        {product.review_count ||
                                                            0}
                                                        )
                                                    </span>
                                                </div>

                                                <div className="product-card-price">
                                                    {formatPrice(
                                                        currentPrice
                                                    )}

                                                    {Number(
                                                        originalPrice
                                                    ) >
                                                        Number(
                                                            currentPrice
                                                        ) && (
                                                        <span>
                                                            {formatPrice(
                                                                originalPrice
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                }
                            )}
                        </div>
                    )}
                </section>
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

                        <Link to="/orders">
                            Orders
                        </Link>

                        <Link to="/wishlist">
                            Wishlist
                        </Link>

                        <Link to="/cart">
                            Cart
                        </Link>
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
                    © {new Date().getFullYear()}{" "}
                    KelvohMarket. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default StoreDetails;