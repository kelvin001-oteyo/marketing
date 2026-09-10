import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/auth.css";


export default function Login() {
    const { login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
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

            login(access, refresh, userResponse.data);

            const destination = location.state?.from?.pathname ||
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
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="login-title">
                <Link className="auth-brand" to="/">Oteyo<span>Market</span></Link>
                <p className="auth-eyebrow">WELCOME BACK</p>
                <h1 id="login-title">Sign in to your account</h1>
                <p className="auth-intro">Manage orders, save favourites, and grow your store.</p>

                {error && <div className="auth-alert" role="alert">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username
                        <input id="username" name="username" autoComplete="username" value={form.username} onChange={handleChange} required />
                    </label>
                    <label htmlFor="password">Password
                        <input id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} required />
                    </label>
                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="auth-footer">New to OteyoMarket? <Link to="/register">Create an account</Link></p>
            </section>
        </main>
    );
}
