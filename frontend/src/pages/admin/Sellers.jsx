import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";


function Sellers() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedSeller, setSelectedSeller] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);


    const fetchSellers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/sellers/admin/all/");

            const data = response.data;

            if (Array.isArray(data)) {
                setSellers(data);
            } else if (Array.isArray(data.results)) {
                setSellers(data.results);
            } else {
                setSellers([]);
            }
        } catch (err) {
            console.error("Failed to load sellers:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to load sellers."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchSellers();
    }, []);


    const filteredSellers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sellers.filter((seller) => {
            const storeName = (
                seller.store_name ||
                seller.storeName ||
                ""
            ).toLowerCase();

            const location = (
                seller.location ||
                ""
            ).toLowerCase();

            const description = (
                seller.description ||
                ""
            ).toLowerCase();

            const username = (
                seller.user?.username ||
                seller.username ||
                ""
            ).toLowerCase();

            const email = (
                seller.user?.email ||
                seller.email ||
                ""
            ).toLowerCase();

            const matchesSearch =
                !query ||
                storeName.includes(query) ||
                location.includes(query) ||
                description.includes(query) ||
                username.includes(query) ||
                email.includes(query);

            const verified = Boolean(
                seller.verified
            );

            let matchesStatus = true;

            if (statusFilter === "VERIFIED") {
                matchesStatus = verified;
            }

            if (statusFilter === "UNVERIFIED") {
                matchesStatus = !verified;
            }

            return matchesSearch && matchesStatus;
        });
    }, [sellers, search, statusFilter]);


    const statistics = useMemo(() => {
        const total = sellers.length;

        const verified = sellers.filter(
            (seller) => Boolean(seller.verified)
        ).length;

        const unverified = total - verified;

        return {
            total,
            verified,
            unverified,
        };
    }, [sellers]);


    const getSellerName = (seller) => {
        if (seller.user?.first_name || seller.user?.last_name) {
            return `${seller.user?.first_name || ""} ${
                seller.user?.last_name || ""
            }`.trim();
        }

        return (
            seller.user?.username ||
            seller.username ||
            seller.owner_name ||
            "Unknown seller"
        );
    };


    const getInitials = (seller) => {
        const name = getSellerName(seller);

        const parts = name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }

        return name.substring(0, 2).toUpperCase();
    };


    const getStoreName = (seller) => {
        return (
            seller.store_name ||
            seller.storeName ||
            "Unnamed Store"
        );
    };


    const getEmail = (seller) => {
        return (
            seller.user?.email ||
            seller.email ||
            "No email"
        );
    };


    const getPhone = (seller) => {
        return (
            seller.phone ||
            seller.user?.phone_number ||
            seller.user?.phone ||
            "No phone"
        );
    };


    const getLocation = (seller) => {
        return seller.location || "Not provided";
    };


    const handleApprove = async (seller) => {
        const sellerId = seller.id;

        if (!sellerId) {
            setError("Seller ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Approve ${getStoreName(seller)} as a verified seller?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            await api.post(
                `/sellers/admin/${sellerId}/approve/`
            );

            setSuccess(
                `${getStoreName(seller)} has been approved successfully.`
            );

            setSelectedSeller(null);

            await fetchSellers();
        } catch (err) {
            console.error("Failed to approve seller:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to approve seller."
            );
        } finally {
            setActionLoading(false);
        }
    };


    const handleReject = async (seller) => {
        const sellerId = seller.id;

        if (!sellerId) {
            setError("Seller ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Reject ${getStoreName(seller)}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            await api.post(
                `/sellers/admin/${sellerId}/reject/`
            );

            setSuccess(
                `${getStoreName(seller)} has been rejected.`
            );

            setSelectedSeller(null);

            await fetchSellers();
        } catch (err) {
            console.error("Failed to reject seller:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to reject seller."
            );
        } finally {
            setActionLoading(false);
        }
    };


    const handleViewSeller = (seller) => {
        setSelectedSeller(seller);
        setError("");
        setSuccess("");
    };


    const closeModal = () => {
        if (!actionLoading) {
            setSelectedSeller(null);
        }
    };


    return (
        <div className="admin-page">

            {/* Page Header */}
            <div className="admin-page-header">

                <div>
                    <h1>Sellers</h1>

                    <p>
                        Manage seller applications, stores and verification.
                    </p>
                </div>

                <div className="admin-page-header-actions">

                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={fetchSellers}
                        disabled={loading}
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>

                </div>

            </div>


            {/* Statistics */}
            <div className="seller-stats-grid">

                <div className="seller-stat-card">

                    <div className="seller-stat-label">
                        Total Sellers
                    </div>

                    <div className="seller-stat-value">
                        {statistics.total}
                    </div>

                </div>


                <div className="seller-stat-card">

                    <div className="seller-stat-label">
                        Verified
                    </div>

                    <div className="seller-stat-value">
                        {statistics.verified}
                    </div>

                </div>


                <div className="seller-stat-card">

                    <div className="seller-stat-label">
                        Awaiting Verification
                    </div>

                    <div className="seller-stat-value">
                        {statistics.unverified}
                    </div>

                </div>

            </div>


            {/* Alerts */}
            {error && (
                <div className="admin-alert admin-alert-error">
                    {error}
                </div>
            )}


            {success && (
                <div className="admin-alert admin-alert-success">
                    {success}
                </div>
            )}


            {/* Toolbar */}
            <div className="admin-card sellers-toolbar">

                <div className="sellers-search">

                    <input
                        type="text"
                        placeholder="Search sellers, stores, email..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>


                <div className="sellers-filter">

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="ALL">
                            All Sellers
                        </option>

                        <option value="VERIFIED">
                            Verified
                        </option>

                        <option value="UNVERIFIED">
                            Awaiting Verification
                        </option>
                    </select>

                </div>

            </div>


            {/* Sellers Table */}
            <div className="admin-card sellers-table-card">

                {loading ? (
                    <div className="admin-loading">
                        Loading sellers...
                    </div>
                ) : filteredSellers.length === 0 ? (
                    <div className="admin-empty-state">

                        <h3>No sellers found</h3>

                        <p>
                            There are no sellers matching your current filters.
                        </p>

                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table sellers-table">

                            <thead>

                                <tr>

                                    <th>Seller</th>

                                    <th>Store</th>

                                    <th>Contact</th>

                                    <th>Location</th>

                                    <th>Status</th>

                                    <th>Rating</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredSellers.map((seller) => {

                                    const verified = Boolean(
                                        seller.verified
                                    );

                                    return (
                                        <tr key={seller.id}>

                                            <td>

                                                <div className="seller-person">

                                                    <div className="seller-avatar">
                                                        {getInitials(seller)}
                                                    </div>

                                                    <div>

                                                        <div className="seller-person-name">
                                                            {getSellerName(seller)}
                                                        </div>

                                                        <div className="seller-person-email">
                                                            {getEmail(seller)}
                                                        </div>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <div className="seller-store-name">
                                                    {getStoreName(seller)}
                                                </div>

                                            </td>


                                            <td>

                                                <div>
                                                    {getPhone(seller)}
                                                </div>

                                            </td>


                                            <td>

                                                <div>
                                                    {getLocation(seller)}
                                                </div>

                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        verified
                                                            ? "admin-status-badge admin-status-active"
                                                            : "admin-status-badge admin-status-pending"
                                                    }
                                                >
                                                    {verified
                                                        ? "Verified"
                                                        : "Pending"}
                                                </span>

                                            </td>


                                            <td>

                                                <div className="seller-rating">

                                                    <span>
                                                        ★
                                                    </span>

                                                    <span>
                                                        {seller.rating ?? "0.00"}
                                                    </span>

                                                </div>

                                            </td>


                                            <td>

                                                <div className="admin-table-actions">

                                                    <button
                                                        type="button"
                                                        className="admin-btn admin-btn-small admin-btn-secondary"
                                                        onClick={() =>
                                                            handleViewSeller(seller)
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    {!verified && (
                                                        <button
                                                            type="button"
                                                            className="admin-btn admin-btn-small admin-btn-primary"
                                                            onClick={() =>
                                                                handleApprove(seller)
                                                            }
                                                            disabled={actionLoading}
                                                        >
                                                            Approve
                                                        </button>
                                                    )}


                                                    {verified && (
                                                        <button
                                                            type="button"
                                                            className="admin-btn admin-btn-small admin-btn-danger"
                                                            onClick={() =>
                                                                handleReject(seller)
                                                            }
                                                            disabled={actionLoading}
                                                        >
                                                            Reject
                                                        </button>
                                                    )}

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>


            {/* Seller Details Modal */}
            {selectedSeller && (
                <div
                    className="admin-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >

                    <div className="admin-modal seller-details-modal">

                        <div className="admin-modal-header">

                            <div>

                                <h2>
                                    Seller Details
                                </h2>

                                <p>
                                    Review the seller and store information.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeModal}
                                disabled={actionLoading}
                            >
                                ×
                            </button>

                        </div>


                        <div className="seller-details-content">

                            <div className="seller-details-profile">

                                <div className="seller-details-avatar">
                                    {getInitials(selectedSeller)}
                                </div>

                                <div>

                                    <h3>
                                        {getSellerName(selectedSeller)}
                                    </h3>

                                    <p>
                                        {getStoreName(selectedSeller)}
                                    </p>

                                </div>

                            </div>


                            <div className="seller-details-grid">

                                <div className="seller-detail-item">

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {getEmail(selectedSeller)}
                                    </strong>

                                </div>


                                <div className="seller-detail-item">

                                    <span>
                                        Phone
                                    </span>

                                    <strong>
                                        {getPhone(selectedSeller)}
                                    </strong>

                                </div>


                                <div className="seller-detail-item">

                                    <span>
                                        Location
                                    </span>

                                    <strong>
                                        {getLocation(selectedSeller)}
                                    </strong>

                                </div>


                                <div className="seller-detail-item">

                                    <span>
                                        Rating
                                    </span>

                                    <strong>
                                        ★ {selectedSeller.rating ?? "0.00"}
                                    </strong>

                                </div>


                                <div className="seller-detail-item">

                                    <span>
                                        Verification
                                    </span>

                                    <strong>
                                        {selectedSeller.verified
                                            ? "Verified"
                                            : "Pending"}
                                    </strong>

                                </div>


                                <div className="seller-detail-item">

                                    <span>
                                        Store Slug
                                    </span>

                                    <strong>
                                        {selectedSeller.store_slug ||
                                            selectedSeller.slug ||
                                            "Not available"}
                                    </strong>

                                </div>

                            </div>


                            <div className="seller-description">

                                <h4>
                                    Store Description
                                </h4>

                                <p>
                                    {selectedSeller.description ||
                                        "No store description provided."}
                                </p>

                            </div>

                        </div>


                        <div className="admin-modal-footer">

                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={closeModal}
                                disabled={actionLoading}
                            >
                                Close
                            </button>


                            {!selectedSeller.verified && (
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-primary"
                                    onClick={() =>
                                        handleApprove(selectedSeller)
                                    }
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Processing..."
                                        : "Approve Seller"}
                                </button>
                            )}


                            {selectedSeller.verified && (
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-danger"
                                    onClick={() =>
                                        handleReject(selectedSeller)
                                    }
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Processing..."
                                        : "Reject Seller"}
                                </button>
                            )}

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}


export default Sellers;