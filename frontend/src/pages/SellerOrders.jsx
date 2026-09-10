import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/marketplace.css";

function getOrders(data) {
    if (Array.isArray(data)) return data;

    return (
        data?.results ||
        data?.orders ||
        data?.items ||
        []
    );
}

function getOrderItems(order) {
    return (
        order.items ||
        order.order_items ||
        order.orderItems ||
        []
    );
}

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/orders/?page_size=100"
            );

            setOrders(getOrders(response.data));
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                setError(
                    "Please sign in to view your seller orders."
                );
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load orders."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const number =
                order.order_number ||
                order.orderNumber ||
                order.id ||
                "";

            const currentStatus =
                order.status ||
                order.order_status ||
                "PENDING";

            const matchesSearch =
                String(number)
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const matchesStatus =
                status === "ALL" ||
                currentStatus === status;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [orders, search, status]);

    const totalValue = orders.reduce(
        (sum, order) =>
            sum +
            Number(
                order.total ||
                    order.total_amount ||
                    order.grand_total ||
                    0
            ),
        0
    );

    const pending = orders.filter((order) => {
        const value =
            order.status ||
            order.order_status;

        return value === "PENDING";
    }).length;

    const completed = orders.filter((order) => {
        const value =
            order.status ||
            order.order_status;

        return value === "COMPLETED";
    }).length;

    return (
        <div className="marketplace-page seller-orders-page">
            <header className="marketplace-header">
                <div className="marketplace-container marketplace-header-inner">
                    <Link to="/" className="marketplace-logo">
                        Oteyo<span>Market</span>
                    </Link>

                    <nav className="marketplace-nav">
                        <Link to="/seller/dashboard">
                            Dashboard
                        </Link>
                        <Link to="/seller/products">
                            Products
                        </Link>
                        <Link to="/seller/inventory">
                            Inventory
                        </Link>
                        <Link
                            className="active"
                            to="/seller/orders"
                        >
                            Orders
                        </Link>
                        <Link to="/seller/store">
                            My Store
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="marketplace-container marketplace-main">
                <div className="marketplace-breadcrumb">
                    <Link to="/seller/dashboard">
                        Seller Center
                    </Link>
                    <span>/</span>
                    <span>Orders</span>
                </div>

                <section className="seller-page-heading">
                    <div>
                        <span className="seller-eyebrow">
                            SALES MANAGEMENT
                        </span>

                        <h1>Orders</h1>

                        <p>
                            Track and manage customer orders.
                        </p>
                    </div>
                </section>

                {error && (
                    <div className="marketplace-error">
                        {error}
                    </div>
                )}

                <section className="seller-stats-grid">
                    <div className="seller-stat-card">
                        <span>Total Orders</span>
                        <strong>
                            {orders.length}
                        </strong>
                    </div>

                    <div className="seller-stat-card">
                        <span>Pending</span>
                        <strong>{pending}</strong>
                    </div>

                    <div className="seller-stat-card">
                        <span>Completed</span>
                        <strong>{completed}</strong>
                    </div>

                    <div className="seller-stat-card">
                        <span>Order Value</span>
                        <strong>
                            KSh{" "}
                            {totalValue.toLocaleString()}
                        </strong>
                    </div>
                </section>

                <section className="seller-products-toolbar">
                    <div className="marketplace-search-box">
                        <input
                            placeholder="Search order number..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(
                                e.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Orders
                        </option>
                        <option value="PENDING">
                            Pending
                        </option>
                        <option value="PROCESSING">
                            Processing
                        </option>
                        <option value="SHIPPED">
                            Shipped
                        </option>
                        <option value="COMPLETED">
                            Completed
                        </option>
                        <option value="CANCELLED">
                            Cancelled
                        </option>
                    </select>
                </section>

                {loading ? (
                    <div className="marketplace-state">
                        Loading orders...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="marketplace-empty">
                        <h3>No orders found</h3>
                        <p>
                            Orders will appear here when customers
                            purchase your products.
                        </p>
                    </div>
                ) : (
                    <section className="seller-products-table-section">
                        <div className="seller-products-table-wrap">
                            <table className="seller-products-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredOrders.map(
                                        (order) => {
                                            const number =
                                                order.order_number ||
                                                order.orderNumber ||
                                                `#${order.id}`;

                                            const orderStatus =
                                                order.status ||
                                                order.order_status ||
                                                "PENDING";

                                            const paymentStatus =
                                                order.payment_status ||
                                                order.paymentStatus ||
                                                "PENDING";

                                            const total =
                                                order.total ||
                                                order.total_amount ||
                                                order.grand_total ||
                                                0;

                                            return (
                                                <tr
                                                    key={
                                                        order.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                number
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {order.created_at
                                                            ? new Date(
                                                                  order.created_at
                                                              ).toLocaleDateString()
                                                            : "—"}
                                                    </td>

                                                    <td>
                                                        {
                                                            getOrderItems(
                                                                order
                                                            ).length
                                                        }
                                                    </td>

                                                    <td>
                                                        KSh{" "}
                                                        {Number(
                                                            total
                                                        ).toLocaleString()}
                                                    </td>

                                                    <td>
                                                        <span className="seller-status">
                                                            {
                                                                paymentStatus
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`seller-status seller-status-${String(
                                                                orderStatus
                                                            ).toLowerCase()}`}
                                                        >
                                                            {
                                                                orderStatus
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <Link
                                                            className="marketplace-small-btn"
                                                            to={`/orders/${order.id}`}
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}