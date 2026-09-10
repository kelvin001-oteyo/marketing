import { useState } from "react";
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


export default function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (form.password !== form.password_confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register/", form);
            const tokenResponse = await api.post("/auth/token/", {
                username: form.username,
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
            const message = typeof data === "object"
                ? Object.values(data).flat().find(Boolean)
                : data;
            setError(message || "Unable to create your account.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="register-title">
                <Link className="auth-brand" to="/">Oteyo<span>Market</span></Link>
                <p className="auth-eyebrow">CREATE YOUR ACCOUNT</p>
                <h1 id="register-title">Start shopping today</h1>
                <p className="auth-intro">Create an account to save items, place orders, and apply as a seller.</p>

                {error && <div className="auth-alert" role="alert">{error}</div>}

                <form className="auth-form auth-form-grid" onSubmit={handleSubmit}>
                    <label htmlFor="first_name">First name
                        <input id="first_name" name="first_name" autoComplete="given-name" value={form.first_name} onChange={handleChange} required />
                    </label>
                    <label htmlFor="last_name">Last name
                        <input id="last_name" name="last_name" autoComplete="family-name" value={form.last_name} onChange={handleChange} required />
                    </label>
                    <label htmlFor="register-username">Username
                        <input id="register-username" name="username" autoComplete="username" value={form.username} onChange={handleChange} required />
                    </label>
                    <label htmlFor="email">Email
                        <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
                    </label>
                    <label className="auth-form-full" htmlFor="phone_number">Phone number
                        <input id="phone_number" name="phone_number" type="tel" autoComplete="tel" value={form.phone_number} onChange={handleChange} required />
                    </label>
                    <label htmlFor="register-password">Password
                        <input id="register-password" name="password" type="password" autoComplete="new-password" minLength="8" value={form.password} onChange={handleChange} required />
                    </label>
                    <label htmlFor="password_confirm">Confirm password
                        <input id="password_confirm" name="password_confirm" type="password" autoComplete="new-password" minLength="8" value={form.password_confirm} onChange={handleChange} required />
                    </label>
                    <button className="auth-form-full" type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
            </section>
        </main>
    );
}
