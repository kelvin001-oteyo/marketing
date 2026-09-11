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
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

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

    console.log("Registration data:", registrationData);

    setLoading(true);

    try {
      await api.post("/auth/register/", registrationData);

      const tokenResponse = await api.post("/auth/token/", {
        username,
        password: form.password,
      });

      const { access, refresh } = tokenResponse.data;

      const userResponse = await api.get("/auth/me/", {
        headers: {
          Authorization: `Bearer ${access}`, // ✅ fixed: no trailing comma
        },
      });

      login(access, refresh, userResponse.data);

      navigate("/profile", { replace: true });
    } catch (requestError) {
      const data = requestError.response?.data;
      let message = "Unable to create your account.";

      if (data && typeof data === "object") {
        const messages = Object.values(data).flat().filter(Boolean);
        if (messages.length > 0) {
          message = messages.join(" ");
        }
      } else if (typeof data === "string") {
        message = data;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="register-title">
        <Link className="auth-brand" to="/">
          Oteyo<span>Market</span>
        </Link>

        <p className="auth-eyebrow">CREATE YOUR ACCOUNT</p>
        <h1 id="register-title">Start shopping today</h1>
        <p className="auth-intro">
          Create an account to save items, place orders, and apply as a seller.
        </p>

        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form auth-form-grid" onSubmit={handleSubmit}>
          <label htmlFor="first_name">
            First name
            <input
              id="first_name"
              name="first_name"
              autoComplete="given-name"
              value={form.first_name}
              onChange={handleChange}
              required
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
            />
          </label>

          <label htmlFor="register-username">
            Username
            <input
              id="register-username"
              name="username"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              required
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
            />
          </label>

          <label className="auth-form-full" htmlFor="phone_number">
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
            />
          </label>

          <label htmlFor="register-password">
            Password
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength="8"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="password_confirm">
            Confirm password
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              autoComplete="new-password"
              minLength="8"
              value={form.password_confirm}
              onChange={handleChange}
              required
            />
          </label>

          <button
            className="auth-form-full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
