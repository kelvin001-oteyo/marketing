import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/auth.css";

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
   LOGIN
========================================================= */

export default function Login() {
    const { login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handlePasswordKey = (event) => {
        if (typeof event.getModifierState !== "function") return;
        setCapsLock(event.getModifierState("CapsLock"));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const tokenResponse = await api.post("/auth/token/", form);
            const { access, refresh } = tokenResponse.data;

            const userResponse = await api.get("/auth/me/", {
                headers: { Authorization: `Bearer ${access}` },
            });

            // Dev-only diagnostic — never expose user data in production
            if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.debug("[login] authenticated user:", userResponse.data);
            }

            login(access, refresh, userResponse.data);

            const destination =
                location.state?.from?.pathname ||
                (userResponse.data.role === "ADMIN" ? "/admin" : "/profile");

            navigate(destination, { replace: true });
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail ||
                "Unable to sign in with those credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page nf-auth-page">
            <section className="auth-card nf-auth-card" aria-labelledby="login-title">

                {/* ---------- Left: form ---------- */}
                <div className="nf-auth-form-col">

                    <Link className="auth-brand" to="/" aria-label="Nila Fashion home">
                        <span className="nf-auth-logo-mark">NF</span>
                        <span>Nila<strong>Fashion</strong></span>
                    </Link>

                    <p className="auth-eyebrow">WELCOME BACK</p>
                    <h1 id="login-title">Sign in to your account</h1>
                    <p className="auth-intro">
                        Manage orders, save favourites, and grow your store.
                    </p>

                    {error && (
                        <div className="auth-alert" role="alert">
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>

                        <label htmlFor="username">
                            Username
                            <input
                                id="username"
                                name="username"
                                autoComplete="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </label>

                        <label htmlFor="password">
                            Password
                            <div className="nf-password-wrap">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    onKeyUp={handlePasswordKey}
                                    onKeyDown={handlePasswordKey}
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

                            {capsLock && (
                                <small className="nf-caps-hint" role="status">
                                    Caps Lock is on
                                </small>
                            )}
                        </label>

                        <div className="nf-auth-row">
                            <label className="nf-auth-remember">
                                <input type="checkbox" name="remember" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="nf-auth-forgot">
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" disabled={loading} className="nf-auth-submit">
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        New to Nila Fashion?{" "}
                        <Link to="/register">Create an account</Link>
                    </p>

                    <div className="nf-auth-trust">
                        <span>
                            <IconShield /> Secure
                        </span>
                        <span>
                            <IconTruck /> Fast delivery
                        </span>
                        <span>
                            <IconTag /> Best prices
                        </span>
                    </div>
                </div>

                {/* ---------- Right: brand panel ---------- */}
                <aside className="nf-auth-aside" aria-hidden="true">
                    <div className="nf-auth-aside-bg" />
                    <div className="nf-auth-aside-overlay" />

                    <div className="nf-auth-aside-content">
                        <span className="section-eyebrow">NILA FASHION</span>
                        <h2>
                            Style that speaks
                            <br />
                            before you do.
                        </h2>
                        <p>
                            Thousands of pieces from trusted sellers —
                            with M-Pesa checkout in seconds.
                        </p>

                        <ul className="nf-auth-aside-list">
                            <li><span>✓</span> Verified sellers</li>
                            <li><span>✓</span> Secure M-Pesa payments</li>
                            <li><span>✓</span> Nationwide delivery</li>
                        </ul>
                    </div>
                </aside>

            </section>
        </main>
    );
}
