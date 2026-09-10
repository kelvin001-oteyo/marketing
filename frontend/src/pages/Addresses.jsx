import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/marketplace.css";

export default function Addresses() {
    const [showForm, setShowForm] =
        useState(false);

    const [addresses, setAddresses] =
        useState([]);

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        address: "",
        city: "",
        county: "",
        delivery_notes: "",
    });

    function handleChange(e) {
        setForm((previous) => ({
            ...previous,
            [e.target.name]: e.target.value,
        }));
    }

    function addAddress(e) {
        e.preventDefault();

        setAddresses((previous) => [
            ...previous,
            {
                id: Date.now(),
                ...form,
            },
        ]);

        setForm({
            full_name: "",
            phone: "",
            address: "",
            city: "",
            county: "",
            delivery_notes: "",
        });

        setShowForm(false);
    }

    function removeAddress(id) {
        setAddresses((previous) =>
            previous.filter(
                (address) =>
                    address.id !== id
            )
        );
    }

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <div className="marketplace-container marketplace-header-inner">
                    <Link
                        to="/"
                        className="marketplace-logo"
                    >
                        Oteyo<span>Market</span>
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

            <main className="marketplace-container marketplace-main">
                <div className="marketplace-breadcrumb">
                    <Link to="/">
                        Home
                    </Link>
                    <span>/</span>
                    <span>
                        Delivery Addresses
                    </span>
                </div>

                <section className="seller-page-heading">
                    <div>
                        <span className="seller-eyebrow">
                            MY ACCOUNT
                        </span>

                        <h1>
                            Delivery Addresses
                        </h1>

                        <p>
                            Save your delivery
                            information for faster
                            checkout.
                        </p>
                    </div>

                    <button
                        className="marketplace-primary-btn"
                        onClick={() =>
                            setShowForm(
                                !showForm
                            )
                        }
                    >
                        + Add Address
                    </button>
                </section>

                {showForm && (
                    <form
                        className="seller-form-card address-form"
                        onSubmit={addAddress}
                    >
                        <div className="seller-form-card-header">
                            <h2>
                                New Delivery
                                Address
                            </h2>
                        </div>

                        <div className="seller-form-grid">
                            <label>
                                Full Name
                                <input
                                    name="full_name"
                                    value={
                                        form.full_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </label>

                            <label>
                                Phone
                                <input
                                    name="phone"
                                    value={
                                        form.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </label>

                            <label>
                                Address
                                <input
                                    name="address"
                                    value={
                                        form.address
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Street, building or estate"
                                    required
                                />
                            </label>

                            <label>
                                City
                                <input
                                    name="city"
                                    value={
                                        form.city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </label>

                            <label>
                                County
                                <input
                                    name="county"
                                    value={
                                        form.county
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </label>

                            <label>
                                Delivery Notes
                                <input
                                    name="delivery_notes"
                                    value={
                                        form.delivery_notes
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Optional"
                                />
                            </label>
                        </div>

                        <div className="seller-form-submit">
                            <button
                                type="button"
                                className="marketplace-secondary-btn"
                                onClick={() =>
                                    setShowForm(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="marketplace-primary-btn"
                            >
                                Save Address
                            </button>
                        </div>
                    </form>
                )}

                {addresses.length === 0 ? (
                    <div className="marketplace-empty">
                        <h3>
                            No saved addresses
                        </h3>

                        <p>
                            Add a delivery address to
                            make checkout faster.
                        </p>
                    </div>
                ) : (
                    <section className="address-grid">
                        {addresses.map(
                            (address) => (
                                <div
                                    className="address-card"
                                    key={
                                        address.id
                                    }
                                >
                                    <div className="address-card-header">
                                        <strong>
                                            {
                                                address.full_name
                                            }
                                        </strong>

                                        <button
                                            onClick={() =>
                                                removeAddress(
                                                    address.id
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <p>
                                        {
                                            address.phone
                                        }
                                    </p>

                                    <p>
                                        {
                                            address.address
                                        }
                                    </p>

                                    <p>
                                        {
                                            address.city
                                        }
                                        ,{" "}
                                        {
                                            address.county
                                        }
                                    </p>

                                    {address.delivery_notes && (
                                        <small>
                                            {
                                                address.delivery_notes
                                            }
                                        </small>
                                    )}
                                </div>
                            )
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}