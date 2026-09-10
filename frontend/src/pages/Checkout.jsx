import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

const normalizePhone = (value) => {
    let phone = value.replace(/\s+/g, "").replace(/-/g, "");

    if (phone.startsWith("+254")) {
        return phone.substring(1);
    }

    if (phone.startsWith("254")) {
        return phone;
    }

    if (phone.startsWith("07") || phone.startsWith("01")) {
        return `254${phone.substring(1)}`;
    }

    if (phone.startsWith("7") || phone.startsWith("1")) {
        return `254${phone}`;
    }

    return phone;
};

const formatPhone = (value) => {
    const normalized = normalizePhone(value);

    if (normalized.startsWith("254") && normalized.length === 12) {
        return `0${normalized.substring(3)}`;
    }

    return value;
};

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

    const cartItems = useMemo(() => {
        if (!cart) return [];

        if (Array.isArray(cart)) return cart;

        return (
            cart.items ||
            cart.cart_items ||
            cart.results ||
            []
        );
    }, [cart]);

    const subtotal = useMemo(() => {
        if (!cartItems.length) {
            return Number(
                cart?.subtotal ||
                cart?.total ||
                0
            );
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

            const quantity = Number(
                item.quantity || 1
            );

            return sum + price * quantity;
        }, 0);
    }, [cart, cartItems]);

    const shipping = subtotal >= 5000 ? 0 : 300;

    const total = subtotal + shipping;

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
                setError(
                    "Please sign in before checking out."
                );
            } else {
                setError(
                    err.response?.data?.error ||
                    "Unable to load your cart."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const validateCheckout = () => {
        if (!form.full_name.trim()) {
            return "Please enter your full name.";
        }

        if (!form.phone.trim()) {
            return "Please enter your phone number.";
        }

        if (!form.address.trim()) {
            return "Please enter your delivery address.";
        }

        if (!form.city.trim()) {
            return "Please enter your city.";
        }

        if (!form.county.trim()) {
            return "Please enter your county.";
        }

        return "";
    };

    const validateMpesaPhone = () => {
        const phone = normalizePhone(mpesaPhone);

        if (!/^254(7|1)\d{8}$/.test(phone)) {
            return "Enter a valid Kenyan M-Pesa number, for example 0712345678.";
        }

        return "";
    };

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
                response = await api.post(
                    "/orders/checkout/",
                    payload
                );
            } catch (firstError) {
                if (
                    firstError.response?.status === 404 ||
                    firstError.response?.status === 405
                ) {
                    response = await api.post(
                        "/orders/create/",
                        payload
                    );
                } else {
                    throw firstError;
                }
            }

            const createdOrder =
                response.data?.order ||
                response.data;

            if (!createdOrder) {
                throw new Error(
                    "Order was not returned by the server."
                );
            }

            setOrder(createdOrder);

            return createdOrder;

        } catch (err) {
            console.error("Order creation error:", err);

            const backendError =
                err.response?.data?.error ||
                err.response?.data?.detail;

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
            setPaymentError(
                "The order number was not returned by the server."
            );
            return;
        }

        setPaymentLoading(true);
        setPaymentStatus("initiating");

        try {
            const response = await api.post(
                "/payments/mpesa/initiate/",
                {
                    order_number: orderNumber,
                    phone_number: normalizePhone(
                        mpesaPhone
                    ),
                }
            );

            console.log(
                "M-Pesa initiation response:",
                response.data
            );

            setPaymentStatus("pending");

            pollPaymentStatus(orderNumber);

        } catch (err) {
            console.error(
                "M-Pesa initiation error:",
                err
            );

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
                    `/payments/${encodeURIComponent(
                        orderNumber
                    )}/`
                );

                const payment = response.data;

                console.log(
                    "Payment status:",
                    payment
                );

                if (payment.status === "SUCCESS") {
                    setPaymentStatus("success");
                    setPaymentLoading(false);

                    navigate(
                        `/orders/success?order=${encodeURIComponent(
                            orderNumber
                        )}`
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

                setTimeout(
                    checkStatus,
                    3000
                );

            } catch (err) {
                console.error(
                    "Payment status error:",
                    err
                );

                if (attempts >= maxAttempts) {
                    setPaymentStatus("timeout");
                    setPaymentLoading(false);

                    setPaymentError(
                        "Unable to confirm the payment status. Please check your M-Pesa messages."
                    );

                    return;
                }

                setTimeout(
                    checkStatus,
                    3000
                );
            }
        };

        checkStatus();
    };

    const handlePayment = async (event) => {
        event.preventDefault();

        setError("");
        setPaymentError("");

        if (!mpesaPhone.trim()) {
            setPaymentError(
                "Please enter your M-Pesa phone number."
            );
            return;
        }

        let createdOrder = order;

        if (!createdOrder) {
            createdOrder = await createOrder();
        }

        if (!createdOrder) {
            return;
        }

        await initiateMpesaPayment(
            createdOrder
        );
    };

    if (loading) {
        return (
            <div className="marketplace-page">
                <header className="marketplace-header">
                    <div className="marketplace-container marketplace-header-inner">
                        <Link
                            to="/"
                            className="marketplace-logo"
                        >
                            Oteyo Market
                        </Link>
                    </div>
                </header>

                <main className="marketplace-container">
                    <div className="marketplace-state">
                        Loading checkout...
                    </div>
                </main>
            </div>
        );
    }

    if (error && !cartItems.length) {
        return (
            <div className="marketplace-page">
                <header className="marketplace-header">
                    <div className="marketplace-container marketplace-header-inner">
                        <Link
                            to="/"
                            className="marketplace-logo"
                        >
                            Oteyo Market
                        </Link>
                    </div>
                </header>

                <main className="marketplace-container">
                    <div className="marketplace-error">
                        {error}
                    </div>

                    <Link
                        to="/cart"
                        className="marketplace-primary-btn"
                    >
                        Back to Cart
                    </Link>
                </main>
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
                        Oteyo Market
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

            {/* MAIN */}
            <main className="marketplace-container checkout-page">

                <div className="checkout-breadcrumb">
                    <Link to="/cart">
                        Cart
                    </Link>

                    <span>/</span>

                    <span>Checkout</span>
                </div>

                <div className="checkout-heading">
                    <div>
                        <p className="marketplace-eyebrow">
                            Secure checkout
                        </p>

                        <h1>
                            Complete your order
                        </h1>

                        <p>
                            Enter your delivery details and
                            pay securely with M-Pesa.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="marketplace-error">
                        {error}
                    </div>
                )}

                <form
                    className="checkout-layout"
                    onSubmit={handlePayment}
                >

                    {/* DELIVERY */}
                    <section className="checkout-main">

                        <div className="checkout-card">

                            <div className="checkout-card-header">
                                <div>
                                    <span className="checkout-step">
                                        01
                                    </span>

                                    <div>
                                        <h2>
                                            Delivery information
                                        </h2>

                                        <p>
                                            Where should we deliver
                                            your order?
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="checkout-form-grid">

                                <div className="checkout-field checkout-field-full">
                                    <label>
                                        Full name
                                    </label>

                                    <input
                                        type="text"
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label>
                                        Phone number
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="0712 345 678"
                                        required
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div className="checkout-field checkout-field-full">
                                    <label>
                                        Delivery address
                                    </label>

                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Building, street, estate..."
                                        required
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label>
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="Kisumu"
                                        required
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label>
                                        County
                                    </label>

                                    <input
                                        type="text"
                                        name="county"
                                        value={form.county}
                                        onChange={handleChange}
                                        placeholder="Kisumu County"
                                        required
                                    />
                                </div>

                                <div className="checkout-field checkout-field-full">
                                    <label>
                                        Delivery notes
                                    </label>

                                    <textarea
                                        name="delivery_notes"
                                        value={form.delivery_notes}
                                        onChange={handleChange}
                                        placeholder="Any directions for the delivery..."
                                        rows="4"
                                    />
                                </div>

                            </div>

                        </div>

                        {/* MPESA */}
                        <div className="checkout-card">

                            <div className="checkout-card-header">
                                <div>
                                    <span className="checkout-step">
                                        02
                                    </span>

                                    <div>
                                        <h2>
                                            Pay with M-Pesa
                                        </h2>

                                        <p>
                                            A payment request will be
                                            sent directly to your phone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mpesa-payment-box">

                                <div className="mpesa-payment-brand">
                                    <div className="mpesa-icon">
                                        M
                                    </div>

                                    <div>
                                        <strong>
                                            M-Pesa
                                        </strong>

                                        <span>
                                            Fast and secure mobile payment
                                        </span>
                                    </div>
                                </div>

                                <div className="checkout-field">
                                    <label>
                                        M-Pesa phone number
                                    </label>

                                    <input
                                        type="tel"
                                        value={mpesaPhone}
                                        onChange={(event) =>
                                            setMpesaPhone(
                                                event.target.value
                                            )
                                        }
                                        placeholder="0712 345 678"
                                        disabled={
                                            paymentLoading
                                        }
                                    />

                                    <small>
                                        Use the Safaricom number
                                        that should receive the
                                        M-Pesa prompt.
                                    </small>
                                </div>

                                {paymentStatus === "pending" && (
                                    <div className="mpesa-processing">
                                        <div className="mpesa-spinner"></div>

                                        <div>
                                            <strong>
                                                Check your phone
                                            </strong>

                                            <p>
                                                An M-Pesa payment
                                                request has been sent.
                                                Enter your M-Pesa PIN
                                                on your phone.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {paymentStatus === "success" && (
                                    <div className="marketplace-success">
                                        Payment successful.
                                        Redirecting...
                                    </div>
                                )}

                                {paymentError && (
                                    <div className="marketplace-error">
                                        {paymentError}
                                    </div>
                                )}

                            </div>

                        </div>

                    </section>

                    {/* SUMMARY */}
                    <aside className="checkout-sidebar">

                        <div className="checkout-summary-card">

                            <h2>
                                Order summary
                            </h2>

                            <div className="checkout-summary-items">

                                {cartItems.map(
                                    (item, index) => {
                                        const product =
                                            item.product || {};

                                        const name =
                                            product.name ||
                                            item.product_name ||
                                            item.name ||
                                            "Product";

                                        const quantity =
                                            Number(
                                                item.quantity || 1
                                            );

                                        const price =
                                            Number(
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
                                                className="checkout-summary-item"
                                                key={
                                                    item.id ||
                                                    index
                                                }
                                            >
                                                <div>
                                                    <strong>
                                                        {name}
                                                    </strong>

                                                    <span>
                                                        Qty: {quantity}
                                                    </span>
                                                </div>

                                                <strong>
                                                    KSh{" "}
                                                    {(
                                                        price *
                                                        quantity
                                                    ).toLocaleString()}
                                                </strong>
                                            </div>
                                        );
                                    }
                                )}

                            </div>

                            <div className="checkout-summary-divider"></div>

                            <div className="checkout-summary-row">
                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    KSh{" "}
                                    {subtotal.toLocaleString()}
                                </strong>
                            </div>

                            <div className="checkout-summary-row">
                                <span>
                                    Delivery
                                </span>

                                <strong>
                                    {shipping === 0
                                        ? "FREE"
                                        : `KSh ${shipping.toLocaleString()}`}
                                </strong>
                            </div>

                            <div className="checkout-summary-divider"></div>

                            <div className="checkout-total-row">
                                <span>
                                    Total
                                </span>

                                <strong>
                                    KSh{" "}
                                    {total.toLocaleString()}
                                </strong>
                            </div>

                            {subtotal < 5000 && (
                                <div className="checkout-free-shipping">
                                    Spend KSh{" "}
                                    {(
                                        5000 - subtotal
                                    ).toLocaleString()}{" "}
                                    more to qualify for free
                                    delivery.
                                </div>
                            )}

                            <button
                                type="submit"
                                className="marketplace-primary-btn checkout-pay-btn"
                                disabled={
                                    submitting ||
                                    paymentLoading
                                }
                            >
                                {submitting
                                    ? "Creating order..."
                                    : paymentLoading
                                    ? "Waiting for M-Pesa..."
                                    : `Pay KSh ${total.toLocaleString()} with M-Pesa`}
                            </button>

                            <Link
                                to="/cart"
                                className="checkout-back-link"
                            >
                                ← Back to cart
                            </Link>

                        </div>

                        <div className="checkout-trust-card">

                            <strong>
                                Secure payment
                            </strong>

                            <p>
                                Your M-Pesa payment is processed
                                through Safaricom's secure payment
                                system.
                            </p>

                        </div>

                    </aside>

                </form>

            </main>

            {/* FOOTER */}
            <footer className="marketplace-footer">
                <div className="marketplace-container">
                    <div className="marketplace-footer-grid">

                        <div>
                            <h3>
                                Oteyo Market
                            </h3>

                            <p>
                                A modern marketplace connecting
                                customers with trusted clothing
                                sellers.
                            </p>
                        </div>

                        <div>
                            <h4>
                                Shop
                            </h4>

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
                            <h4>
                                Account
                            </h4>

                            <Link to="/profile">
                                Profile
                            </Link>

                            <Link to="/orders">
                                Orders
                            </Link>

                            <Link to="/wishlist">
                                Wishlist
                            </Link>
                        </div>

                    </div>
                </div>
            </footer>

        </div>
    );
}

export default Checkout;