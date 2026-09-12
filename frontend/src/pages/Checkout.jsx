import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

/* =========================================================
   HELPERS (unchanged)
========================================================= */

const normalizePhone = (value) => {
    let phone = value.replace(/\s+/g, "").replace(/-/g, "");

    if (phone.startsWith("+254")) return phone.substring(1);
    if (phone.startsWith("254")) return phone;
    if (phone.startsWith("07") || phone.startsWith("01")) {
        return `254${phone.substring(1)}`;
    }
    if (phone.startsWith("7") || phone.startsWith("1")) {
        return `254${phone}`;
    }

    return phone;
};

/* =========================================================
   INLINE ICONS
========================================================= */

const IconShield = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const IconPhone = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M11 18h2" />
    </svg>
);

const IconMapPin = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const IconLock = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
);

/* =========================================================
   CHECKOUT
========================================================= */

function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [error, setError] = useState("");
    const [paymentError, setPaymentError] = useState("");

    const [order, setOrder] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState("");

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        county: "",
        delivery_notes: "",
    });

    const [mpesaPhone, setMpesaPhone] = useState("");

    /* ---------- derived (unchanged) ---------- */

    const cartItems = useMemo(() => {
        if (!cart) return [];
        if (Array.isArray(cart)) return cart;
        return cart.items || cart.cart_items || cart.results || [];
    }, [cart]);

    const subtotal = useMemo(() => {
        if (!cartItems.length) {
            return Number(cart?.subtotal || cart?.total || 0);
        }

        return cartItems.reduce((sum, item) => {
            const product = item.product || {};
            const price = Number(
                item.price ||
                item.unit_price ||
                item.current_price ||
                product.current_price ||
                product.discount_price ||
                product.price ||
                0
            );
            const quantity = Number(item.quantity || 1);
            return sum + price * quantity;
        }, 0);
    }, [cart, cartItems]);

    const shipping = subtotal >= 5000 ? 0 : 300;
    const total = subtotal + shipping;

    const FREE_SHIPPING_THRESHOLD = 5000;
    const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const freeShippingProgress = Math.min(
        100,
        (subtotal / FREE_SHIPPING_THRESHOLD) * 100
    );

    const formatPrice = (v) => `KSh ${Number(v || 0).toLocaleString()}`;

    /* ---------- effects ---------- */

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/cart/");
            setCart(response.data);
        } catch (err) {
            console.error("Checkout cart error:", err);

            if (err.response?.status === 401) {
                setError("Please sign in before checking out.");
            } else {
                setError(
                    err.response?.data?.error || "Unable to load your cart."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    /* ---------- form ---------- */

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const validateCheckout = () => {
        if (!form.full_name.trim()) return "Please enter your full name.";
        if (!form.phone.trim()) return "Please enter your phone number.";
        if (!form.address.trim()) return "Please enter your delivery address.";
        if (!form.city.trim()) return "Please enter your city.";
        if (!form.county.trim()) return "Please enter your county.";
        return "";
    };

    const validateMpesaPhone = () => {
        const phone = normalizePhone(mpesaPhone);
        if (!/^254(7|1)\d{8}$/.test(phone)) {
            return "Enter a valid Kenyan M-Pesa number, for example 0712345678.";
        }
        return "";
    };

    /* ---------- order + payment (unchanged) ---------- */

    const createOrder = async () => {
        const validationError = validateCheckout();
        if (validationError) {
            setError(validationError);
            return null;
        }

        setSubmitting(true);
        setError("");

        try {
            const payload = {
                full_name: form.full_name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                address: form.address.trim(),
                city: form.city.trim(),
                county: form.county.trim(),
                delivery_notes: form.delivery_notes.trim(),
            };

            let response;

            try {
                response = await api.post("/orders/checkout/", payload);
            } catch (firstError) {
                if (
                    firstError.response?.status === 404 ||
                    firstError.response?.status === 405
                ) {
                    response = await api.post("/orders/create/", payload);
                } else {
                    throw firstError;
                }
            }

            const createdOrder = response.data?.order || response.data;

            if (!createdOrder) {
                throw new Error("Order was not returned by the server.");
            }

            setOrder(createdOrder);
            return createdOrder;
        } catch (err) {
            console.error("Order creation error:", err);

            const backendError =
                err.response?.data?.error || err.response?.data?.detail;

            setError(
                backendError ||
                "Unable to create your order. Please try again."
            );

            return null;
        } finally {
            setSubmitting(false);
        }
    };

    const initiateMpesaPayment = async (createdOrder) => {
        setPaymentError("");

        const phoneError = validateMpesaPhone();
        if (phoneError) {
            setPaymentError(phoneError);
            return;
        }

        const orderNumber =
            createdOrder.order_number ||
            createdOrder.orderNumber ||
            createdOrder.number;

        if (!orderNumber) {
            setPaymentError("The order number was not returned by the server.");
            return;
        }

        setPaymentLoading(true);
        setPaymentStatus("initiating");

        try {
            await api.post("/payments/mpesa/initiate/", {
                order_number: orderNumber,
                phone_number: normalizePhone(mpesaPhone),
            });

            setPaymentStatus("pending");
            pollPaymentStatus(orderNumber);
        } catch (err) {
            console.error("M-Pesa initiation error:", err);

            setPaymentStatus("failed");
            setPaymentError(
                err.response?.data?.error ||
                "Unable to send the M-Pesa payment request. Please try again."
            );
            setPaymentLoading(false);
        }
    };

    const pollPaymentStatus = async (orderNumber) => {
        let attempts = 0;
        const maxAttempts = 40;

        const checkStatus = async () => {
            attempts += 1;

            try {
                const response = await api.get(
                    `/payments/${encodeURIComponent(orderNumber)}/`
                );

                const payment = response.data;

                if (payment.status === "SUCCESS") {
                    setPaymentStatus("success");
                    setPaymentLoading(false);
                    navigate(
                        `/orders/success?order=${encodeURIComponent(orderNumber)}`
                    );
                    return;
                }

                if (payment.status === "FAILED") {
                    setPaymentStatus("failed");
                    setPaymentLoading(false);
                    setPaymentError(
                        payment.result_description ||
                        "The M-Pesa payment failed or was cancelled."
                    );
                    return;
                }

                if (attempts >= maxAttempts) {
                    setPaymentStatus("timeout");
                    setPaymentLoading(false);
                    setPaymentError(
                        "We are still waiting for the M-Pesa confirmation. Please check your M-Pesa messages before trying again."
                    );
                    return;
                }

                setTimeout(checkStatus, 3000);
            } catch (err) {
                console.error("Payment status error:", err);

                if (attempts >= maxAttempts) {
                    setPaymentStatus("timeout");
                    setPaymentLoading(false);
                    setPaymentError(
                        "Unable to confirm the payment status. Please check your M-Pesa messages."
                    );
                    return;
                }

                setTimeout(checkStatus, 3000);
            }
        };

        checkStatus();
    };

    const handlePayment = async (event) => {
        event.preventDefault();

        setError("");
        setPaymentError("");

        if (!mpesaPhone.trim()) {
            setPaymentError("Please enter your M-Pesa phone number.");
            return;
        }

        let createdOrder = order;
        if (!createdOrder) {
            createdOrder = await createOrder();
        }
        if (!createdOrder) return;

        await initiateMpesaPayment(createdOrder);
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="marketplace">
                <Header minimal />
                <main className="nf-checkout-main">
                    <div className="cart-loading">
                        <div className="cart-loading-spinner" />
                        <p>Loading checkout…</p>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       EMPTY / AUTH ERROR
    ========================================================= */

    if (error && !cartItems.length) {
        return (
            <div className="marketplace">
                <Header minimal />

                <main className="nf-checkout-main">
                    <div className="nf-checkout-blocked" role="alert">
                        <div className="nf-empty-icon" aria-hidden="true">
                            <IconShield />
                        </div>
                        <h2>Checkout unavailable</h2>
                        <p>{error}</p>
                        <div className="nf-empty-actions">
                            <Link to="/cart" className="nf-btn-primary">
                                Back to Cart
                            </Link>
                            <Link to="/login" className="nf-btn-ghost">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* =========================================================
       MAIN
    ========================================================= */

    const isBusy = submitting || paymentLoading;

    return (
        <div className="marketplace">
            <Header />

            <main className="nf-checkout-main">

                {/* ---- Breadcrumb ---- */}
                <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link to="/cart">Cart</Link>
                    <span aria-hidden="true">/</span>
                    <span>Checkout</span>
                </nav>

                {/* ---- Heading ---- */}
                <header className="nf-checkout-heading">
                    <span className="section-eyebrow">SECURE CHECKOUT</span>
                    <h1>Complete your order</h1>
                    <p>
                        Enter your delivery details and pay securely with
                        M-Pesa.
                    </p>
                </header>

                {error && (
                    <div className="marketplace-error nf-error" role="alert">
                        {error}
                    </div>
                )}

                <form className="nf-checkout-layout" onSubmit={handlePayment}>

                    {/* =============== LEFT =============== */}
                    <div className="nf-checkout-main-col">

                        {/* ---- Delivery ---- */}
                        <section className="nf-checkout-card" aria-labelledby="nf-step-1">
                            <header className="nf-checkout-card-head">
                                <span className="nf-step">01</span>
                                <div>
                                    <h2 id="nf-step-1">Delivery information</h2>
                                    <p>Where should we deliver your order?</p>
                                </div>
                            </header>

                            <div className="nf-checkout-grid">
                                <label className="nf-field nf-field-full">
                                    Full name
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        required
                                        disabled={isBusy}
                                    />
                                </label>

                                <label className="nf-field">
                                    Phone number
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="0712 345 678"
                                        autoComplete="tel"
                                        required
                                        disabled={isBusy}
                                    />
                                </label>

                                <label className="nf-field">
                                    Email
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        disabled={isBusy}
                                    />
                                </label>

                                <label className="nf-field nf-field-full">
                                    Delivery address
                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Building, street, estate…"
                                        autoComplete="street-address"
                                        required
                                        disabled={isBusy}
                                    />
                                </label>

                                <label className="nf-field">
                                    City
                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="Kisumu"
                                        autoComplete="address-level2"
                                        required
                                        disabled={isBusy}
                                    />
                                </label>

                                <label className="nf-field">
                                    County
                                    <input
                                        type="text"
                                        name="county"
                                        value={form.county}
                                        onChange={handleChange}
                                        placeholder="Kisumu County"
                                        autoComplete="address-level1"
                                        required
                                        disabled={isBusy}
                                    />
                                </label>

                                <label className="nf-field nf-field-full">
                                    Delivery notes <span>(optional)</span>
                                    <textarea
                                        name="delivery_notes"
                                        value={form.delivery_notes}
                                        onChange={handleChange}
                                        placeholder="Gate code, landmark, preferred time…"
                                        rows="4"
                                        disabled={isBusy}
                                    />
                                </label>
                            </div>
                        </section>

                        {/* ---- M-Pesa ---- */}
                        <section className="nf-checkout-card" aria-labelledby="nf-step-2">
                            <header className="nf-checkout-card-head">
                                <span className="nf-step">02</span>
                                <div>
                                    <h2 id="nf-step-2">Pay with M-Pesa</h2>
                                    <p>
                                        A payment request will be sent directly
                                        to your phone.
                                    </p>
                                </div>
                            </header>

                            <div className="nf-mpesa-box">
                                <div className="nf-mpesa-brand">
                                    <span className="nf-mpesa-icon" aria-hidden="true">
                                        M
                                    </span>
                                    <div>
                                        <strong>M-Pesa</strong>
                                        <span>Fast and secure mobile payment</span>
                                    </div>
                                </div>

                                <label className="nf-field nf-field-full">
                                    M-Pesa phone number
                                    <div className="nf-input-prefix">
                                        <span className="nf-input-prefix-icon" aria-hidden="true">
                                            <IconPhone />
                                        </span>
                                        <input
                                            type="tel"
                                            inputMode="tel"
                                            value={mpesaPhone}
                                            onChange={(e) => setMpesaPhone(e.target.value)}
                                            placeholder="0712 345 678"
                                            autoComplete="tel"
                                            disabled={isBusy}
                                        />
                                    </div>
                                    <small>
                                        Use the Safaricom number that should
                                        receive the M-Pesa prompt.
                                    </small>
                                </label>

                                {/* ---- Status panel ---- */}
                                {paymentStatus === "pending" && (
                                    <div className="nf-mpesa-status nf-mpesa-pending" role="status">
                                        <div className="mpesa-spinner" aria-hidden="true" />
                                        <div>
                                            <strong>Check your phone</strong>
                                            <p>
                                                An M-Pesa payment request has
                                                been sent. Enter your M-Pesa PIN
                                                on your phone to complete the
                                                payment.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {paymentStatus === "initiating" && (
                                    <div className="nf-mpesa-status nf-mpesa-pending" role="status">
                                        <div className="mpesa-spinner" aria-hidden="true" />
                                        <div>
                                            <strong>Sending request…</strong>
                                            <p>
                                                We're sending the M-Pesa prompt
                                                to your phone. This takes a few
                                                seconds.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {paymentStatus === "success" && (
                                    <div className="marketplace-success" role="status">
                                        Payment successful. Redirecting…
                                    </div>
                                )}

                                {paymentStatus === "timeout" && (
                                    <div className="marketplace-error" role="alert">
                                        {paymentError}
                                    </div>
                                )}

                                {paymentError && paymentStatus !== "timeout" && (
                                    <div className="marketplace-error" role="alert">
                                        {paymentError}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* =============== RIGHT =============== */}
                    <aside className="nf-checkout-aside" aria-label="Order summary">
                        <div className="nf-checkout-summary">

                            {/* Free-shipping progress */}
                            {amountToFreeShipping > 0 ? (
                                <div className="nf-ship-progress">
                                    <p>
                                        Add <strong>{formatPrice(amountToFreeShipping)}</strong>{" "}
                                        more for <strong>FREE delivery</strong>.
                                    </p>
                                    <div
                                        className="nf-ship-bar"
                                        role="progressbar"
                                        aria-valuemin={0}
                                        aria-valuemax={FREE_SHIPPING_THRESHOLD}
                                        aria-valuenow={subtotal}
                                    >
                                        <span style={{ width: `${freeShippingProgress}%` }} />
                                    </div>
                                </div>
                            ) : (
                                <div className="nf-ship-progress is-unlocked">
                                    <IconShield />
                                    <span>
                                        You've unlocked <strong>free delivery</strong>.
                                    </span>
                                </div>
                            )}

                            <h2>Order summary</h2>

                            <div className="nf-summary-items">
                                {cartItems.map((item, index) => {
                                    const product = item.product || {};
                                    const name =
                                        product.name ||
                                        item.product_name ||
                                        item.name ||
                                        "Product";
                                    const quantity = Number(item.quantity || 1);
                                    const price = Number(
                                        item.price ||
                                        item.unit_price ||
                                        item.current_price ||
                                        product.current_price ||
                                        product.discount_price ||
                                        product.price ||
                                        0
                                    );

                                    return (
                                        <div
                                            className="nf-summary-item"
                                            key={item.id || index}
                                        >
                                            <div>
                                                <strong>{name}</strong>
                                                <span>Qty: {quantity}</span>
                                            </div>
                                            <strong>
                                                {formatPrice(price * quantity)}
                                            </strong>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="nf-summary-divider" />

                            <div className="nf-summary-row">
                                <span>Subtotal</span>
                                <strong>{formatPrice(subtotal)}</strong>
                            </div>

                            <div className="nf-summary-row">
                                <span>Delivery</span>
                                <strong>
                                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                                </strong>
                            </div>

                            <div className="nf-summary-divider" />

                            <div className="nf-summary-total">
                                <span>Total</span>
                                <strong>{formatPrice(total)}</strong>
                            </div>

                            <button
                                type="submit"
                                className="nf-checkout-btn"
                                disabled={isBusy}
                            >
                                {submitting
                                    ? "Creating order…"
                                    : paymentLoading
                                    ? "Waiting for M-Pesa…"
                                    : `Pay ${formatPrice(total)} with M-Pesa`}
                            </button>

                            <Link to="/cart" className="nf-back-link">
                                <span aria-hidden="true">←</span> Back to cart
                            </Link>
                        </div>

                        <div className="nf-checkout-trust">
                            <IconLock />
                            <div>
                                <strong>Secure payment</strong>
                                <p>
                                    Your M-Pesa payment is processed through
                                    Safaricom's secure payment system.
                                </p>
                            </div>
                        </div>
                    </aside>
                </form>
            </main>
        </div>
    );
}

/* =========================================================
   HEADER (local)
========================================================= */

function Header({ minimal = false }) {
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
                            <label htmlFor="co-search" className="nf-visually-hidden">
                                Search products
                            </label>
                            <input
                                id="co-search"
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
                    </>
                )}
            </div>
        </header>
    );
}

export default Checkout;
