import { useState } from "react";
import "../../styles/admin.css";

function Settings() {
    const [settings, setSettings] = useState({
        storeName: "Clothing Marketplace",
        storeDescription:
            "A modern online marketplace for quality clothing and fashion products.",
        email: "support@clothingmarketplace.com",
        phone: "+254 700 000 000",
        location: "Kenya",
        currency: "KES",
        taxRate: "16",
        shippingFee: "300",
        freeShippingMinimum: "5000",
        minimumOrderAmount: "500",
        storeStatus: "OPEN",
        maintenanceMode: false,
        allowGuestCheckout: true,
        allowReviews: true,
        autoConfirmOrders: false,
    });

    const [saved, setSaved] = useState(false);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setSettings((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));

        setSaved(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        localStorage.setItem(
            "clothing_marketplace_settings",
            JSON.stringify(settings)
        );

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 3000);
    };

    const handleReset = () => {
        const confirmed = window.confirm(
            "Are you sure you want to reset the settings?"
        );

        if (!confirmed) {
            return;
        }

        setSettings({
            storeName: "Clothing Marketplace",
            storeDescription:
                "A modern online marketplace for quality clothing and fashion products.",
            email: "support@clothingmarketplace.com",
            phone: "+254 700 000 000",
            location: "Kenya",
            currency: "KES",
            taxRate: "16",
            shippingFee: "300",
            freeShippingMinimum: "5000",
            minimumOrderAmount: "500",
            storeStatus: "OPEN",
            maintenanceMode: false,
            allowGuestCheckout: true,
            allowReviews: true,
            autoConfirmOrders: false,
        });

        setSaved(false);
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Store Settings</h1>
                    <p>
                        Manage your marketplace configuration, store information,
                        shipping, orders, and customer settings.
                    </p>
                </div>
            </div>

            {saved && (
                <div className="admin-alert admin-alert-success">
                    <span>✓</span>
                    <div>
                        <strong>Settings saved</strong>
                        <p>Your store settings have been updated successfully.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="settings-layout">
                    <div className="settings-main">

                        {/* Store Information */}
                        <section className="admin-card settings-section">
                            <div className="settings-section-header">
                                <div>
                                    <h2>Store Information</h2>
                                    <p>
                                        Basic information displayed throughout your
                                        marketplace.
                                    </p>
                                </div>
                            </div>

                            <div className="admin-form-grid">
                                <div className="admin-form-group">
                                    <label htmlFor="storeName">
                                        Store Name
                                    </label>

                                    <input
                                        id="storeName"
                                        name="storeName"
                                        type="text"
                                        value={settings.storeName}
                                        onChange={handleChange}
                                        placeholder="Enter store name"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="email">
                                        Store Email
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={settings.email}
                                        onChange={handleChange}
                                        placeholder="support@example.com"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="phone">
                                        Store Phone
                                    </label>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        value={settings.phone}
                                        onChange={handleChange}
                                        placeholder="+254 700 000 000"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="location">
                                        Store Location
                                    </label>

                                    <input
                                        id="location"
                                        name="location"
                                        type="text"
                                        value={settings.location}
                                        onChange={handleChange}
                                        placeholder="Kenya"
                                    />
                                </div>

                                <div className="admin-form-group full-width">
                                    <label htmlFor="storeDescription">
                                        Store Description
                                    </label>

                                    <textarea
                                        id="storeDescription"
                                        name="storeDescription"
                                        rows="4"
                                        value={settings.storeDescription}
                                        onChange={handleChange}
                                        placeholder="Describe your store..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Regional Settings */}
                        <section className="admin-card settings-section">
                            <div className="settings-section-header">
                                <div>
                                    <h2>Regional Settings</h2>
                                    <p>
                                        Configure currency, tax, and marketplace
                                        location settings.
                                    </p>
                                </div>
                            </div>

                            <div className="admin-form-grid">
                                <div className="admin-form-group">
                                    <label htmlFor="currency">
                                        Currency
                                    </label>

                                    <select
                                        id="currency"
                                        name="currency"
                                        value={settings.currency}
                                        onChange={handleChange}
                                    >
                                        <option value="KES">
                                            KES - Kenyan Shilling
                                        </option>
                                        <option value="USD">
                                            USD - US Dollar
                                        </option>
                                        <option value="EUR">
                                            EUR - Euro
                                        </option>
                                        <option value="GBP">
                                            GBP - British Pound
                                        </option>
                                    </select>
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="taxRate">
                                        Tax Rate (%)
                                    </label>

                                    <input
                                        id="taxRate"
                                        name="taxRate"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={settings.taxRate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Shipping */}
                        <section className="admin-card settings-section">
                            <div className="settings-section-header">
                                <div>
                                    <h2>Shipping Settings</h2>
                                    <p>
                                        Configure delivery charges and free
                                        shipping rules.
                                    </p>
                                </div>
                            </div>

                            <div className="admin-form-grid">
                                <div className="admin-form-group">
                                    <label htmlFor="shippingFee">
                                        Standard Shipping Fee
                                    </label>

                                    <input
                                        id="shippingFee"
                                        name="shippingFee"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={settings.shippingFee}
                                        onChange={handleChange}
                                    />

                                    <small>
                                        Amount charged for standard delivery.
                                    </small>
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="freeShippingMinimum">
                                        Free Shipping Minimum
                                    </label>

                                    <input
                                        id="freeShippingMinimum"
                                        name="freeShippingMinimum"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={settings.freeShippingMinimum}
                                        onChange={handleChange}
                                    />

                                    <small>
                                        Orders above this amount qualify for
                                        free shipping.
                                    </small>
                                </div>
                            </div>
                        </section>

                        {/* Order Settings */}
                        <section className="admin-card settings-section">
                            <div className="settings-section-header">
                                <div>
                                    <h2>Order Settings</h2>
                                    <p>
                                        Control how customers and orders behave
                                        in your marketplace.
                                    </p>
                                </div>
                            </div>

                            <div className="admin-form-grid">
                                <div className="admin-form-group">
                                    <label htmlFor="minimumOrderAmount">
                                        Minimum Order Amount
                                    </label>

                                    <input
                                        id="minimumOrderAmount"
                                        name="minimumOrderAmount"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={settings.minimumOrderAmount}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="settings-toggle-list">
                                <label className="settings-toggle">
                                    <span>
                                        <strong>Automatically confirm orders</strong>
                                        <small>
                                            Automatically move newly created
                                            orders to confirmed status.
                                        </small>
                                    </span>

                                    <input
                                        type="checkbox"
                                        name="autoConfirmOrders"
                                        checked={settings.autoConfirmOrders}
                                        onChange={handleChange}
                                    />

                                    <span className="settings-switch"></span>
                                </label>

                                <label className="settings-toggle">
                                    <span>
                                        <strong>Allow guest checkout</strong>
                                        <small>
                                            Allow customers to purchase without
                                            creating an account.
                                        </small>
                                    </span>

                                    <input
                                        type="checkbox"
                                        name="allowGuestCheckout"
                                        checked={settings.allowGuestCheckout}
                                        onChange={handleChange}
                                    />

                                    <span className="settings-switch"></span>
                                </label>

                                <label className="settings-toggle">
                                    <span>
                                        <strong>Allow product reviews</strong>
                                        <small>
                                            Allow customers to submit product
                                            reviews.
                                        </small>
                                    </span>

                                    <input
                                        type="checkbox"
                                        name="allowReviews"
                                        checked={settings.allowReviews}
                                        onChange={handleChange}
                                    />

                                    <span className="settings-switch"></span>
                                </label>
                            </div>
                        </section>

                        {/* Store Status */}
                        <section className="admin-card settings-section">
                            <div className="settings-section-header">
                                <div>
                                    <h2>Store Status</h2>
                                    <p>
                                        Control whether customers can currently
                                        shop from your marketplace.
                                    </p>
                                </div>
                            </div>

                            <div className="admin-form-grid">
                                <div className="admin-form-group">
                                    <label htmlFor="storeStatus">
                                        Store Status
                                    </label>

                                    <select
                                        id="storeStatus"
                                        name="storeStatus"
                                        value={settings.storeStatus}
                                        onChange={handleChange}
                                    >
                                        <option value="OPEN">
                                            Open
                                        </option>
                                        <option value="CLOSED">
                                            Closed
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="settings-danger-box">
                                <div>
                                    <strong>Maintenance Mode</strong>
                                    <p>
                                        Temporarily disable customer access while
                                        you perform maintenance or updates.
                                    </p>
                                </div>

                                <label className="settings-toggle settings-toggle-inline">
                                    <input
                                        type="checkbox"
                                        name="maintenanceMode"
                                        checked={settings.maintenanceMode}
                                        onChange={handleChange}
                                    />

                                    <span className="settings-switch"></span>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Settings Sidebar */}
                    <aside className="settings-sidebar">
                        <div className="admin-card settings-sidebar-card">
                            <h3>Settings Summary</h3>

                            <div className="settings-summary-item">
                                <span>Store</span>
                                <strong>{settings.storeName}</strong>
                            </div>

                            <div className="settings-summary-item">
                                <span>Currency</span>
                                <strong>{settings.currency}</strong>
                            </div>

                            <div className="settings-summary-item">
                                <span>Tax</span>
                                <strong>{settings.taxRate}%</strong>
                            </div>

                            <div className="settings-summary-item">
                                <span>Shipping</span>
                                <strong>
                                    {settings.currency} {settings.shippingFee}
                                </strong>
                            </div>

                            <div className="settings-summary-item">
                                <span>Status</span>
                                <strong
                                    className={
                                        settings.storeStatus === "OPEN"
                                            ? "settings-status-open"
                                            : "settings-status-closed"
                                    }
                                >
                                    {settings.storeStatus === "OPEN"
                                        ? "Open"
                                        : "Closed"}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-card settings-actions-card">
                            <h3>Actions</h3>

                            <button
                                type="submit"
                                className="admin-btn admin-btn-primary settings-save-btn"
                            >
                                Save Changes
                            </button>

                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary settings-reset-btn"
                                onClick={handleReset}
                            >
                                Reset Settings
                            </button>
                        </div>
                    </aside>
                </div>
            </form>
        </div>
    );
}

export default Settings;