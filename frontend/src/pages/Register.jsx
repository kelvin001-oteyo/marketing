import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/auth.css";

const initialForm = {
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirm: "",
};

/* =========================================================
   INLINE ICONS
========================================================= */

const IconEye = ({ off = false }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {off ? (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M1 1l22 22" />
                <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
            </>
        ) : (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        )}
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const IconTruck = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h11v9H3z" />
        <path d="M14 9h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
    </svg>
);

const IconTag = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <path d="M7 7h.01" />
    </svg>
);

/* =========================================================
   PASSWORD STRENGTH
========================================================= */

const scorePassword = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: "", tone: "" };
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score, label: "Weak", tone: "weak" };
    if (score <= 4) return { score, label: "Good", tone: "good" };
    return { score, label: "Strong", tone: "strong" };
};

/* =========================================================
   REGISTER
========================================================= */

export default function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const strength = useMemo(
        () => scorePassword(form.password),
        [form.password]
    );

    const passwordsMatch =
        form.password_confirm.length > 0 &&
        form.password === form.password_confirm;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const email = form.email.trim();
        const username = form.username.trim();
        const phoneNumber = form.phone_number.trim();

        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        if (!phoneNumber) {
            setError("Please enter your phone number.");
            return;
        }
        if (phoneNumber.includes("@")) {
            setError("Please enter a valid phone number, not an email address.");
            return;
        }
        if (phoneNumber.length > 20) {
            setError("Phone number must not be more than 20 characters.");
            return;
        }
        if (form.password !== form.password_confirm) {
            setError("Passwords do not match.");
            return;
        }

        const registrationData = {
            username,
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            email,
            phone_number: phoneNumber,
            password: form.password,
            password_confirm: form.password_confirm,
        };

        setLoading(true);

        try {
            await api.post("/auth/register/", registrationData);

            const tokenResponse = await api.post("/auth/token/", {
                username,
                password: form.password,
            });

            const { access, refresh } = tokenResponse.data;

            const userResponse = await api.get("/auth/me/", {
                headers: { Authorization: `Bearer ${access}` },
            });

            login(access, refresh, userResponse.data);
            navigate("/profile", { replace: true });
        } catch (requestError) {
            const data = requestError.response?.data;
            let message = "Unable to create your account.";

            if (data && typeof data === "object") {
                const messages = Object.values(data).flat().filter(Boolean);
                if (messages.length > 0) message = messages.join(" ");
            } else if (typeof data === "string") {
                message = data;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page nf-auth-page">
            <section className="auth-card nf-auth-card" aria-labelledby="register-title">

                {/* ---------- Left: form ---------- */}
                <div className="nf-auth-form-col nf-register-col">

                    <Link className="auth-brand" to="/" aria-label="Nila Fashion home">
                        <span className="nf-auth-logo-mark">NF</span>
                        <span>Nila<strong>Fashion</strong></span>
                    </Link>

                    <p className="auth-eyebrow">CREATE YOUR ACCOUNT</p>
                    <h1 id="register-title">Start shopping today</h1>
                    <p className="auth-intro">
                        Create an account to save items, place orders, and apply
                        as a seller.
                    </p>

                    {error && (
                        <div className="auth-alert" role="alert">
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>

                        {/* -------- Personal -------- */}
                        <fieldset className="nf-fieldset">
                            <legend>Personal details</legend>

                            <div className="nf-form-grid">
                                <label htmlFor="first_name">
                                    First name
                                    <input
                                        id="first_name"
                                        name="first_name"
                                        autoComplete="given-name"
                                        value={form.first_name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </label>

                                <label htmlFor="last_name">
                                    Last name
                                    <input
                                        id="last_name"
                                        name="last_name"
                                        autoComplete="family-name"
                                        value={form.last_name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </label>

                                <label htmlFor="email">
                                    Email
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </label>

                                <label htmlFor="phone_number">
                                    Phone number
                                    <input
                                        id="phone_number"
                                        name="phone_number"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder="e.g. 0712345678"
                                        value={form.phone_number}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        </fieldset>

                        {/* -------- Account -------- */}
                        <fieldset className="nf-fieldset">
                            <legend>Account</legend>

                            <label htmlFor="register-username">
                                Username
                                <input
                                    id="register-username"
                                    name="username"
                                    autoComplete="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </label>
                        </fieldset>

                        {/* -------- Security -------- */}
                        <fieldset className="nf-fieldset">
                            <legend>Security</legend>

                            <div className="nf-form-grid">
                                <label htmlFor="register-password">
                                    Password
                                    <div className="nf-password-wrap">
                                        <input
                                            id="register-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            minLength="8"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="nf-password-toggle"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            aria-pressed={showPassword}
                                            tabIndex={-1}
                                        >
                                            <IconEye off={showPassword} />
                                        </button>
                                    </div>

                                    {form.password.length > 0 && (
                                        <div
                                            className={`nf-strength nf-strength-${strength.tone}`}
                                            aria-live="polite"
                                        >
                                            <div className="nf-strength-bars" aria-hidden="true">
                                                <span />
                                                <span />
                                                <span />
                                                <span />
                                                <span />
                                            </div>
                                            <small>{strength.label} password</small>
                                        </div>
                                    )}
                                </label>

                                <label htmlFor="password_confirm">
                                    Confirm password
                                    <div className="nf-password-wrap">
                                        <input
                                            id="password_confirm"
                                            name="password_confirm"
                                            type={showConfirm ? "text" : "password"}
                                            autoComplete="new-password"
                                            minLength="8"
                                            value={form.password_confirm}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            className={
                                                form.password_confirm.length > 0 && !passwordsMatch
                                                    ? "nf-input-error"
                                                    : ""
                                            }
                                            aria-invalid={
                                                form.password_confirm.length > 0 && !passwordsMatch
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="nf-password-toggle"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            aria-label={showConfirm ? "Hide password" : "Show password"}
                                            aria-pressed={showConfirm}
                                            tabIndex={-1}
                                        >
                                            <IconEye off={showConfirm} />
                                        </button>
                                    </div>

                                    {form.password_confirm.length > 0 && (
                                        <small
                                            className={
                                                passwordsMatch
                                                    ? "nf-match-hint is-ok"
                                                    : "nf-match-hint is-bad"
                                            }
                                            role="status"
                                        >
                                            {passwordsMatch
                                                ? "✓ Passwords match"
                                                : "Passwords don't match yet"}
                                        </small>
                                    )}
                                </label>
                            </div>
                        </fieldset>

                        <button
                            type="submit"
                            disabled={loading}
                            className="nf-auth-submit"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>

                        <p className="nf-terms">
                            By creating an account you agree to our{" "}
                            <Link to="/terms">Terms</Link> and{" "}
                            <Link to="/privacy">Privacy Policy</Link>.
                        </p>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>

                    <div className="nf-auth-trust">
                        <span><IconShield /> Secure</span>
                        <span><IconTruck /> Fast delivery</span>
                        <span><IconTag /> Best prices</span>
                    </div>
                </div>

                {/* ---------- Right: brand panel ---------- */}
                <aside className="nf-auth-aside nf-register-aside" aria-hidden="true">
                    <div className="nf-auth-aside-bg" />
                    <div className="nf-auth-aside-overlay" />

                    <div className="nf-auth-aside-content">
                        <span className="section-eyebrow">JOIN NILA FASHION</span>
                        <h2>
                            Your closet,
                            <br />
                            upgraded.
                        </h2>
                        <p>
                            Join thousands of shoppers discovering fashion from
                            trusted sellers across Kenya.
                        </p>

                        <ul className="nf-auth-aside-list">
                            <li><span>✓</span> Free account, no fees</li>
                            <li><span>✓</span> Save favourites to your wishlist</li>
                            <li><span>✓</span> Track every order in real time</li>
                            <li><span>✓</span> M-Pesa checkout in seconds</li>
                        </ul>
                    </div>
                </aside>

            </section>
        </main>
    );
}
