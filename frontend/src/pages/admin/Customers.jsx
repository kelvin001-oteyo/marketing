import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";


function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const [selectedCustomer, setSelectedCustomer] = useState(null);


    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/auth/admin/customers/");

            const data = response.data;

            if (Array.isArray(data)) {
                setCustomers(data);
            } else if (Array.isArray(data.results)) {
                setCustomers(data.results);
            } else {
                setCustomers([]);
            }
        } catch (err) {
            console.error("Failed to load customers:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to load customers."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchCustomers();
    }, []);


    const getName = (customer) => {
        const firstName =
            customer.first_name ||
            customer.user?.first_name ||
            "";

        const lastName =
            customer.last_name ||
            customer.user?.last_name ||
            "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        return (
            fullName ||
            customer.username ||
            customer.user?.username ||
            "Unknown Customer"
        );
    };


    const getEmail = (customer) => {
        return (
            customer.email ||
            customer.user?.email ||
            "No email"
        );
    };


    const getPhone = (customer) => {
        return (
            customer.phone_number ||
            customer.phone ||
            customer.user?.phone_number ||
            customer.user?.phone ||
            "No phone"
        );
    };


    const getRole = (customer) => {
        return (
            customer.role ||
            customer.user?.role ||
            "CUSTOMER"
        );
    };


    const getInitials = (customer) => {
        const name = getName(customer);

        const parts = name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }

        return name.substring(0, 2).toUpperCase();
    };


    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return customers.filter((customer) => {
            const name = getName(customer).toLowerCase();
            const email = getEmail(customer).toLowerCase();
            const phone = getPhone(customer).toLowerCase();
            const role = getRole(customer).toUpperCase();

            const matchesSearch =
                !query ||
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query);

            const matchesRole =
                roleFilter === "ALL" ||
                role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [customers, search, roleFilter]);


    const statistics = useMemo(() => {
        const total = customers.length;

        const active = customers.filter(
            (customer) =>
                customer.is_active !== false &&
                customer.user?.is_active !== false
        ).length;

        const inactive = total - active;

        return {
            total,
            active,
            inactive,
        };
    }, [customers]);


    const closeModal = () => {
        setSelectedCustomer(null);
    };


    return (
        <div className="admin-page">

            {/* Header */}
            <div className="admin-page-header">

                <div>
                    <h1>Customers</h1>

                    <p>
                        Manage marketplace customers and customer accounts.
                    </p>
                </div>

                <div className="admin-page-header-actions">

                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={fetchCustomers}
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
                        Total Customers
                    </div>

                    <div className="seller-stat-value">
                        {statistics.total}
                    </div>

                </div>


                <div className="seller-stat-card">

                    <div className="seller-stat-label">
                        Active Accounts
                    </div>

                    <div className="seller-stat-value">
                        {statistics.active}
                    </div>

                </div>


                <div className="seller-stat-card">

                    <div className="seller-stat-label">
                        Inactive Accounts
                    </div>

                    <div className="seller-stat-value">
                        {statistics.inactive}
                    </div>

                </div>

            </div>


            {/* Error */}
            {error && (
                <div className="admin-alert admin-alert-error">
                    {error}
                </div>
            )}


            {/* Toolbar */}
            <div className="admin-card sellers-toolbar">

                <div className="sellers-search">

                    <input
                        type="text"
                        placeholder="Search customers, email, phone..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>


                <div className="sellers-filter">

                    <select
                        value={roleFilter}
                        onChange={(event) =>
                            setRoleFilter(event.target.value)
                        }
                    >
                        <option value="ALL">
                            All Accounts
                        </option>

                        <option value="CUSTOMER">
                            Customers
                        </option>

                        <option value="SELLER">
                            Sellers
                        </option>

                        <option value="ADMIN">
                            Administrators
                        </option>

                    </select>

                </div>

            </div>


            {/* Table */}
            <div className="admin-card sellers-table-card">

                {loading ? (
                    <div className="admin-loading">
                        Loading customers...
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="admin-empty-state">

                        <h3>
                            No customers found
                        </h3>

                        <p>
                            No customer accounts match your current filters.
                        </p>

                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table sellers-table">

                            <thead>

                                <tr>

                                    <th>Customer</th>

                                    <th>Email</th>

                                    <th>Phone</th>

                                    <th>Role</th>

                                    <th>Status</th>

                                    <th>Joined</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredCustomers.map((customer) => {

                                    const active =
                                        customer.is_active !== false &&
                                        customer.user?.is_active !== false;

                                    const role =
                                        getRole(customer).toUpperCase();

                                    return (
                                        <tr key={customer.id}>

                                            <td>

                                                <div className="seller-person">

                                                    <div className="seller-avatar">
                                                        {getInitials(customer)}
                                                    </div>

                                                    <div>

                                                        <div className="seller-person-name">
                                                            {getName(customer)}
                                                        </div>

                                                        <div className="seller-person-email">
                                                            ID: {customer.id}
                                                        </div>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>
                                                {getEmail(customer)}
                                            </td>


                                            <td>
                                                {getPhone(customer)}
                                            </td>


                                            <td>

                                                <span className="customer-role-badge">
                                                    {role}
                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        active
                                                            ? "admin-status-badge admin-status-active"
                                                            : "admin-status-badge admin-status-inactive"
                                                    }
                                                >
                                                    {active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </td>


                                            <td>
                                                {customer.date_joined
                                                    ? new Date(
                                                        customer.date_joined
                                                    ).toLocaleDateString()
                                                    : customer.created_at
                                                        ? new Date(
                                                            customer.created_at
                                                        ).toLocaleDateString()
                                                        : "—"}
                                            </td>


                                            <td>

                                                <button
                                                    type="button"
                                                    className="admin-btn admin-btn-small admin-btn-secondary"
                                                    onClick={() =>
                                                        setSelectedCustomer(
                                                            customer
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>


            {/* Customer Modal */}
            {selectedCustomer && (
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
                                    Customer Details
                                </h2>

                                <p>
                                    Review customer account information.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeModal}
                            >
                                ×
                            </button>

                        </div>


                        <div className="seller-details-content">

                            <div className="seller-details-profile">

                                <div className="seller-details-avatar">
                                    {getInitials(selectedCustomer)}
                                </div>

                                <div>

                                    <h3>
                                        {getName(selectedCustomer)}
                                    </h3>

                                    <p>
                                        {getEmail(selectedCustomer)}
                                    </p>

                                </div>

                            </div>


                            <div className="seller-details-grid">

                                <div className="seller-detail-item">

                                    <span>
                                        Customer ID
                                    </span>

                                    <strong>
                                        {selectedCustomer.id}
                                    </strong>

                                </div>


                                <div className="seller-detail-item">

                                    <span>
                                        Username
                                    </span>

                                    <strong>
                                        {selectedCustomer.username ||
                                            selectedCustomer.user?.username ||
                                            "Not available"}
                                    </strong>

                                </div>


                                <div className="seller-detail-item">

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {getEmail(selectedCustomer)}
                                    </strong>

                                </div>


                                <div className="seller-detail-item">

                                    <span>
                                        Phone
                                    </span>

                                    <strong>
                                        {getPhone(selectedCustomer)}
                                    </strong>

                                </div>


                                <div className="seller-detail-item">

                                    <span>
                                        Role
                                    </span>

                                    <strong>
                                        {getRole(selectedCustomer)}
                                    </strong>

                                </div>


                                <div className="seller-detail-item">

                                    <span>
                                        Account Status
                                    </span>

                                    <strong>
                                        {selectedCustomer.is_active !== false &&
                                        selectedCustomer.user?.is_active !== false
                                            ? "Active"
                                            : "Inactive"}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="admin-modal-footer">

                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={closeModal}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}


export default Customers;
