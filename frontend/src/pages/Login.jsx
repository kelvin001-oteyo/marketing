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
        <main className="nf-auth-page">
            <section className="nf-auth-card" aria-labelledby="login-title">

                {/* ---------- Left: form ---------- */}
                <div className="nf-auth-form-col">

                    <Link className="nf-auth-brand" to="/" aria-label="Nila Fashion home">
                        <span className="nf-auth-logo-mark">NF</span>
                        <span className="nf-auth-wordmark">
                            Nila<em>Fashion</em>
                        </span>
                    </Link>

                    <header className="nf-auth-head">
                        <span className="nf-auth-eyebrow">WELCOME BACK</span>
                        <h1 id="login-title">Sign in to your account</h1>
                        <p className="nf-auth-sub">
                            Manage orders, save favourites, and grow your store.
                        </p>
                    </header>

                    {error && (
                        <div className="nf-auth-alert" role="alert">
                            {error}
                        </div>
                    )}

                    <form className="nf-auth-form" onSubmit={handleSubmit} noValidate>

                        <label className="nf-auth-field" htmlFor="username">
                            <span className="nf-auth-label">Username</span>
                            <input
                                id="username"
                                name="username"
                                autoComplete="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                required
                                disabled={loading}
                            />
                        </label>

                        <label className="nf-auth-field" htmlFor="password">
                            <span className="nf-auth-label">Password</span>
                            <div className="nf-auth-input-wrap">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    onKeyUp={handlePasswordKey}
                                    onKeyDown={handlePasswordKey}
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="nf-auth-toggle"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    tabIndex={-1}
                                >
                                    <IconEye off={showPassword} />
                                </button>
                            </div>

                            {capsLock && (
                                <small className="nf-auth-caps" role="status">
                                    Caps Lock is on
                                </small>
                            )}
                        </label>

                        <div className="nf-auth-row">
                            <label className="nf-auth-remember">
                                <input type="checkbox" name="remember" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="nf-auth-link">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="nf-auth-submit"
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </form>

                    <p className="nf-auth-footer">
                        New to Nila Fashion?{" "}
                        <Link to="/register">Create an account</Link>
                    </p>

                    <ul className="nf-auth-trust">
                        <li><IconShield /> Secure</li>
                        <li><IconTruck /> Fast delivery</li>
                        <li><IconTag /> Best prices</li>
                    </ul>
                </div>

                {/* ---------- Right: brand panel ---------- */}
                <aside className="nf-auth-aside" aria-hidden="true">
                    <div className="nf-auth-aside-bg" />
                    <div className="nf-auth-aside-overlay" />

                    <div className="nf-auth-aside-content">
                        <span className="nf-auth-aside-eyebrow">NILA FASHION</span>

                        <h2 className="nf-auth-aside-title">
                            Style that speaks
                            <br />
                            before you do.
                        </h2>

                        <p className="nf-auth-aside-text">
                            Thousands of pieces from trusted sellers — with
                            M-Pesa checkout in seconds.
                        </p>

                        <ul className="nf-auth-aside-list">
                            <li><span aria-hidden="true">✓</span> Verified sellers</li>
                            <li><span aria-hidden="true">✓</span> Secure M-Pesa payments</li>
                            <li><span aria-hidden="true">✓</span> Nationwide delivery</li>
                        </ul>
                    </div>
                </aside>

            </section>
        </main>
    );
}
