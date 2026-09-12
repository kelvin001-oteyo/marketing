import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   INLINE ICONS
========================================================= */

const IconHeart = ({ filled = false }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
);

const IconCart = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

const IconTrash = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const IconWarning = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
    </svg>
);

/* =========================================================
   WISHLIST
========================================================= */

function Wishlist() {
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [addingId, setAddingId] = useState(null);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    /* ---------- toast auto-dismiss ---------- */
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/wishlist/");
            setWishlist(response.data);
        } catch (err) {
            console.error("Failed to load wishlist:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to load your wishlist."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const wishlistItems = Array.isArray(wishlist)
        ? wishlist
        : wishlist?.items ||
          wishlist?.wishlist_items ||
          wishlist?.results ||
          [];

    /* ---------- helpers (unchanged) ---------- */

    const getProduct = (item) =>
        item.product || item.variant?.product || item;

    const getProductId = (item) => {
        const product = getProduct(item);
        return product.id || item.product_id || item.product;
    };

    const getProductName = (item) => {
        const product = getProduct(item);
        return product.name || item.name || "Product";
    };

    const getProductImage = (item) => {
        const product = getProduct(item);
        return (
            product.image ||
            product.primary_image ||
            product.images?.[0]?.image ||
            ""
        );
    };

    const getProductPrice = (item) => {
        const product = getProduct(item);
        return Number(
            product.current_price ||
            product.discount_price ||
            product.price ||
            item.price ||
            0
        );
    };

    const getOriginalPrice = (item) => {
        const product = getProduct(item);
        const originalPrice = Number(product.price || 0);
        const currentPrice = getProductPrice(item);

        if (
            originalPrice > 0 &&
            currentPrice > 0 &&
            originalPrice > currentPrice
        ) {
            return originalPrice;
        }
        return null;
    };

    /* ---------- actions ---------- */

    const removeFromWishlist = async (item) => {
        const itemId =
            item.id ||
            item.wishlist_item_id ||
            item.product_id ||
            getProductId(item);

        if (!itemId) return;

        try {
            setRemovingId(itemId);
            setError("");

            await api.delete(`/wishlist/${itemId}/`);

            setWishlist((previous) => {
                if (!previous) return previous;

                if (Array.isArray(previous)) {
                    return previous.filter(
                        (wishlistItem) =>
                            (wishlistItem.id ||
                                wishlistItem.product_id ||
                                wishlistItem.wishlist_item_id) !== itemId
                    );
                }

                return {
                    ...previous,
                    items: (previous.items || []).filter(
                        (wishlistItem) =>
                            (wishlistItem.id ||
                                wishlistItem.product_id ||
                                wishlistItem.wishlist_item_id) !== itemId
                    ),
                };
            });

            await fetchWishlist();
        } catch (err) {
            console.error("Failed to remove wishlist item:", err);
            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to remove item from wishlist."
            );
        } finally {
            setRemovingId(null);
        }
    };

    const addToCart = async (item) => {
        const product = getProduct(item);
        const productId = getProductId(item);

        if (!productId) return;

        try {
            setAddingId(productId);
            setError("");

            await api.post("/cart/items/", {
                product: productId,
                quantity: 1,
            });

            setToast({
                type: "success",
                message: `${product.name || "Product"} has been added to your cart.`,
            });
        } catch (err) {
            console.error("Failed to add item to cart:", err);
            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to add this product to your cart."
            );
        } finally {
            setAddingId(null);
        }
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <Header minimal />
                <main className="nf-wish-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading your wishlist…</p>
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
            <Header count={wishlistItems.length} />

            <main className="nf-wish-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <span>Wishlist</span>
                </nav>

                {/* ---- Heading ---- */}
                <header className="nf-wish-heading">
                    <div>
                        <span className="section-eyebrow">SAVED FOR LATER</span>
                        <h1>My Wishlist</h1>
                        <p>
                            Save products you love and come back to them
                            anytime.
                        </p>
                    </div>

                    <Link to="/products" className="nf-btn-ghost">
                        Continue Shopping
                    </Link>
                </header>

                {error && (
                    <div className="marketplace-alert marketplace-alert-error" role="alert">
                        {error}
                    </div>
                )}

                {/* ================= EMPTY ================= */}
                {wishlistItems.length === 0 ? (
                    <section className="nf-wish-empty">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconHeart />
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>
                            You haven't saved any products yet. Browse the
                            marketplace and add products you want to keep an
                            eye on.
                        </p>
                        <Link to="/products" className="nf-btn-primary">
                            Explore Products <IconArrow />
                        </Link>
                    </section>
                ) : (
                    /* ================= GRID ================= */
                    <section
                        className="nf-wish-content"
                        aria-label="Saved products"
                    >
                        <div className="nf-wish-count">
                            <strong>{wishlistItems.length}</strong>{" "}
                            {wishlistItems.length === 1
                                ? "saved item"
                                : "saved items"}
                        </div>

                        <div className="nf-wish-grid">
                            {wishlistItems.map((item, index) => {
                                const product = getProduct(item);
                                const productId = getProductId(item);
                                const image = getProductImage(item);
                                const name = getProductName(item);
                                const price = getProductPrice(item);
                                const originalPrice = getOriginalPrice(item);

                                const discount =
                                    originalPrice && price
                                        ? Math.round(
                                              ((originalPrice - price) /
                                                  originalPrice) *
                                                  100
                                          )
                                        : null;

                                const rating = Number(product.rating || 0);
                                const isRemoving = removingId === itemIdFor(item);
                                const isAdding = addingId === productId;

                                const itemKey =
                                    item.id ||
                                    item.wishlist_item_id ||
                                    productId ||
                                    index;

                                return (
                                    <article
                                        key={itemKey}
                                        className={`nf-wish-card ${isRemoving ? "is-busy" : ""}`}
                                    >
                                        {/* ---- Image ---- */}
                                        <div className="nf-wish-img-wrap">
                                            <Link
                                                to={`/products/${productId}`}
                                                className="nf-wish-img-link"
                                                aria-label={name}
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={name}
                                                        className="nf-wish-img"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="nf-wish-img-placeholder">
                                                        No Image
                                                    </div>
                                                )}
                                            </Link>

                                            {discount && (
                                                <span className="nf-wish-discount">
                                                    -{discount}%
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                className="nf-wish-remove"
                                                onClick={() => removeFromWishlist(item)}
                                                disabled={isRemoving}
                                                aria-label={`Remove ${name} from wishlist`}
                                                title="Remove from wishlist"
                                            >
                                                <IconHeart filled />
                                            </button>
                                        </div>

                                        {/* ---- Content ---- */}
                                        <div className="nf-wish-body">
                                            {product.brand && (
                                                <span className="nf-wish-brand">
                                                    {product.brand}
                                                </span>
                                            )}

                                            <Link
                                                to={`/products/${productId}`}
                                                className="nf-wish-name"
                                            >
                                                {name}
                                            </Link>

                                            <div
                                                className="nf-wish-rating"
                                                aria-label={`Rated ${rating.toFixed(1)} out of 5`}
                                            >
                                                <span className="nf-wish-stars" aria-hidden="true">
                                                    {"★".repeat(
                                                        Math.min(
                                                            Math.round(rating),
                                                            5
                                                        )
                                                    )}
                                                </span>
                                                <span>
                                                    {rating > 0
                                                        ? rating.toFixed(1)
                                                        : "New"}
                                                </span>
                                            </div>

                                            <div className="nf-wish-price">
                                                <strong>
                                                    KSh {price.toLocaleString()}
                                                </strong>
                                                {originalPrice && (
                                                    <span>
                                                        KSh{" "}
                                                        {originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="nf-wish-actions">
                                                <button
                                                    type="button"
                                                    className="nf-wish-cart"
                                                    onClick={() => addToCart(item)}
                                                    disabled={isAdding || isRemoving}
                                                >
                                                    <IconCart />
                                                    {isAdding
                                                        ? "Adding…"
                                                        : "Add to Cart"}
                                                </button>

                                                <Link
                                                    to={`/products/${productId}`}
                                                    className="nf-wish-view"
                                                    aria-label={`View ${name}`}
                                                >
                                                    View
                                                </Link>
                                            </div>

                                            <button
                                                type="button"
                                                className="nf-wish-remove-text"
                                                onClick={() => removeFromWishlist(item)}
                                                disabled={isRemoving}
                                            >
                                                <IconTrash />
                                                {isRemoving
                                                    ? "Removing…"
                                                    : "Remove from wishlist"}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            {/* ---- Toast ---- */}
            {toast && (
                <div
                    className={`nf-toast nf-toast-${toast.type}`}
                    role={toast.type === "error" ? "alert" : "status"}
                >
                    <span className="nf-toast-icon" aria-hidden="true">
                        {toast.type === "error" ? <IconWarning /> : <IconCheck />}
                    </span>
                    <span className="nf-toast-msg">{toast.message}</span>
                </div>
            )}

            <Footer />
        </div>
    );

    /* ---------- helper used only inside render ---------- */
    function itemIdFor(item) {
        return (
            item.id ||
            item.wishlist_item_id ||
            item.product_id ||
            getProductId(item)
        );
    }
}

/* =========================================================
   HEADER (local)
========================================================= */

function Header({ count = 0, minimal = false }) {
    return (
        <header className="marketplace-header">
            <div className="marketplace-header-inner">
                <Link to="/" className="marketplace-logo" aria-label="Nila Fashion home">
                    <span className="marketplace-logo-mark">NF</span>
                    <span>Nila<strong>Fashion</strong></span>
                </Link>

                {!minimal && (
                    <>
                        <form
                            className="marketplace-search"
                            role="search"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <label htmlFor="wish-search" className="nf-visually-hidden">
                                Search products
                            </label>
                            <input
                                id="wish-search"
                                type="text"
                                placeholder="Search products, brands and more..."
                            />
                            <button type="submit">Search</button>
                        </form>

                        <div className="marketplace-header-actions">
                            <Link to="/wishlist" className="nf-header-link is-active">
                                <span aria-hidden="true">♡</span>
                                <span>Wishlist</span>
                                {count > 0 && (
                                    <span className="nf-cart-count" aria-hidden="true">
                                        {count}
                                    </span>
                                )}
                            </Link>
                            <Link to="/cart" className="nf-header-link">
                                <span aria-hidden="true">🛍</span>
                                <span>Cart</span>
                            </Link>
                            <Link to="/profile" className="marketplace-login">
                                My Account
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}

/* =========================================================
   FOOTER (local)
========================================================= */

function Footer() {
    return (
        <footer className="marketplace-footer">
            <div className="marketplace-footer-grid">
                <div>
                    <Link to="/" className="marketplace-logo footer-logo">
                        <span className="marketplace-logo-mark">NF</span>
                        <span>Nila<strong>Fashion</strong></span>
                    </Link>
                    <p>
                        Discover products from trusted sellers and shop with
                        confidence.
                    </p>
                </div>

                <div>
                    <h3>Shop</h3>
                    <Link to="/products">Products</Link>
                    <Link to="/categories">Categories</Link>
                    <Link to="/stores">Stores</Link>
                </div>

                <div>
                    <h3>Customer</h3>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/wishlist">Wishlist</Link>
                    <Link to="/cart">Cart</Link>
                </div>

                <div>
                    <h3>Support</h3>
                    <Link to="/contact">Contact</Link>
                    <Link to="/help">Help Center</Link>
                    <Link to="/returns">Returns</Link>
                </div>
            </div>

            <div className="marketplace-footer-bottom">
                <span>
                    © {new Date().getFullYear()} Nila Fashion. All rights reserved.
                </span>
                <span>Secure checkout • M-Pesa supported</span>
            </div>
        </footer>
    );
}

export default Wishlist;
