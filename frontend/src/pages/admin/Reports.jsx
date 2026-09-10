import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../../styles/admin.css";

function Reports() {
    const [dashboard, setDashboard] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getArray = (data) => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.results)) {
            return data.results;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    };

    const loadReports = async () => {
        try {
            setLoading(true);
            setError("");

            const [dashboardResponse, productsResponse, ordersResponse] =
                await Promise.all([
                    api.get("/reports/dashboard/"),
                    api.get("/reports/top-products/"),
                    api.get("/reports/recent-orders/"),
                ]);

            setDashboard(dashboardResponse.data || {});
            setTopProducts(getArray(productsResponse.data));
            setRecentOrders(getArray(ordersResponse.data));
        } catch (err) {
            console.error("Failed to load reports:", err);

            setError(
                err.response?.data?.detail ||
                    err.response?.data?.message ||
                    "Unable to load reports. Please check the backend."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const stats = useMemo(() => {
        const data = dashboard || {};

        return {
            revenue:
                data.total_revenue ??
                data.revenue ??
                data.total_sales ??
                0,

            orders:
                data.total_orders ??
                data.orders_count ??
                data.orders ??
                0,

            products:
                data.total_products ??
                data.products_count ??
                data.products ??
                0,

            customers:
                data.total_customers ??
                data.customers_count ??
                data.customers ??
                0,

            sellers:
                data.total_sellers ??
                data.sellers_count ??
                data.sellers ??
                0,
        };
    }, [dashboard]);

    const orderOverview = useMemo(() => {
        const data = dashboard || {};

        return {
            pending:
                data.pending_orders ??
                data.pending ??
                0,

            delivered:
                data.delivered_orders ??
                data.delivered ??
                0,

            cancelled:
                data.cancelled_orders ??
                data.cancelled ??
                0,
        };
    }, [dashboard]);

    const performance = useMemo(() => {
        const data = dashboard || {};

        return {
            averageOrderValue:
                data.average_order_value ??
                data.avg_order_value ??
                0,

            ordersPerCustomer:
                data.orders_per_customer ??
                0,

            revenuePerCustomer:
                data.revenue_per_customer ??
                0,
        };
    }, [dashboard]);

    const formatCurrency = (value) => {
        const number = Number(value || 0);

        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 2,
        }).format(number);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat("en-KE").format(Number(value || 0));
    };

    const getProductName = (product) => {
        return (
            product.product_name ||
            product.name ||
            product.product?.name ||
            "Unknown Product"
        );
    };

    const getProductSales = (product) => {
        return (
            product.total_sold ??
            product.quantity_sold ??
            product.sales ??
            product.units_sold ??
            0
        );
    };

    const getProductRevenue = (product) => {
        return (
            product.total_revenue ??
            product.revenue ??
            product.sales_value ??
            0
        );
    };

    const getOrderNumber = (order) => {
        return (
            order.order_number ||
            order.order_id ||
            order.number ||
            `#${order.id || "N/A"}`
        );
    };

    const getCustomerName = (order) => {
        return (
            order.customer_name ||
            order.customer?.name ||
            order.customer?.full_name ||
            order.user_name ||
            order.user?.username ||
            "Customer"
        );
    };

    const getOrderTotal = (order) => {
        return (
            order.total_amount ??
            order.total ??
            order.grand_total ??
            0
        );
    };

    const getOrderStatus = (order) => {
        return String(order.status || "PENDING").toUpperCase();
    };

    const getStatusClass = (status) => {
        const normalized = String(status).toLowerCase();

        return `report-status-${normalized}`;
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-page-header">
                    <div>
                        <h1>Reports</h1>
                        <p>Loading marketplace performance reports...</p>
                    </div>
                </div>

                <div className="admin-card admin-loading-card">
                    Loading reports...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Reports</h1>
                    <p>
                        Monitor sales, orders, customers, products, and overall
                        marketplace performance.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={loadReports}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="admin-alert admin-alert-error">
                    <span>!</span>

                    <div>
                        <strong>Reports could not be loaded</strong>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Main Statistics */}
            <div className="reports-stats-grid">
                <div className="admin-card report-stat-card">
                    <span className="report-stat-label">
                        Total Revenue
                    </span>

                    <strong className="report-stat-value">
                        {formatCurrency(stats.revenue)}
                    </strong>

                    <span className="report-stat-description">
                        Marketplace revenue
                    </span>
                </div>

                <div className="admin-card report-stat-card">
                    <span className="report-stat-label">
                        Total Orders
                    </span>

                    <strong className="report-stat-value">
                        {formatNumber(stats.orders)}
                    </strong>

                    <span className="report-stat-description">
                        Orders processed
                    </span>
                </div>

                <div className="admin-card report-stat-card">
                    <span className="report-stat-label">
                        Products
                    </span>

                    <strong className="report-stat-value">
                        {formatNumber(stats.products)}
                    </strong>

                    <span className="report-stat-description">
                        Products in marketplace
                    </span>
                </div>

                <div className="admin-card report-stat-card">
                    <span className="report-stat-label">
                        Customers
                    </span>

                    <strong className="report-stat-value">
                        {formatNumber(stats.customers)}
                    </strong>

                    <span className="report-stat-description">
                        Registered customers
                    </span>
                </div>

                <div className="admin-card report-stat-card">
                    <span className="report-stat-label">
                        Sellers
                    </span>

                    <strong className="report-stat-value">
                        {formatNumber(stats.sellers)}
                    </strong>

                    <span className="report-stat-description">
                        Marketplace sellers
                    </span>
                </div>
            </div>

            {/* Overview */}
            <div className="reports-overview-grid">
                <section className="admin-card reports-summary-card">
                    <div className="admin-section-heading">
                        <div>
                            <h2>Order Overview</h2>
                            <p>Current order distribution.</p>
                        </div>
                    </div>

                    <div className="order-overview-list">
                        <div className="order-overview-item">
                            <div>
                                <span className="overview-dot overview-pending"></span>
                                Pending
                            </div>

                            <strong>
                                {formatNumber(orderOverview.pending)}
                            </strong>
                        </div>

                        <div className="order-overview-item">
                            <div>
                                <span className="overview-dot overview-delivered"></span>
                                Delivered
                            </div>

                            <strong>
                                {formatNumber(orderOverview.delivered)}
                            </strong>
                        </div>

                        <div className="order-overview-item">
                            <div>
                                <span className="overview-dot overview-cancelled"></span>
                                Cancelled
                            </div>

                            <strong>
                                {formatNumber(orderOverview.cancelled)}
                            </strong>
                        </div>
                    </div>
                </section>

                <section className="admin-card reports-summary-card">
                    <div className="admin-section-heading">
                        <div>
                            <h2>Performance Summary</h2>
                            <p>Key marketplace indicators.</p>
                        </div>
                    </div>

                    <div className="performance-summary">
                        <div className="performance-item">
                            <span>Average Order Value</span>

                            <strong>
                                {formatCurrency(
                                    performance.averageOrderValue
                                )}
                            </strong>
                        </div>

                        <div className="performance-item">
                            <span>Orders / Customer</span>

                            <strong>
                                {Number(
                                    performance.ordersPerCustomer || 0
                                ).toFixed(2)}
                            </strong>
                        </div>

                        <div className="performance-item">
                            <span>Revenue / Customer</span>

                            <strong>
                                {formatCurrency(
                                    performance.revenuePerCustomer
                                )}
                            </strong>
                        </div>
                    </div>
                </section>
            </div>

            {/* Top Products */}
            <section className="admin-card reports-section">
                <div className="admin-section-heading">
                    <div>
                        <h2>Top Products</h2>
                        <p>
                            Products generating the strongest marketplace
                            performance.
                        </p>
                    </div>
                </div>

                {topProducts.length === 0 ? (
                    <div className="admin-empty-state">
                        No product performance data available.
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table reports-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Units Sold</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>

                            <tbody>
                                {topProducts.map((product, index) => (
                                    <tr
                                        key={
                                            product.id ||
                                            product.product_id ||
                                            index
                                        }
                                    >
                                        <td>
                                            <span className="report-rank">
                                                {index + 1}
                                            </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {getProductName(product)}
                                            </strong>
                                        </td>

                                        <td>
                                            {formatNumber(
                                                getProductSales(product)
                                            )}
                                        </td>

                                        <td>
                                            <strong>
                                                {formatCurrency(
                                                    getProductRevenue(product)
                                                )}
                                            </strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Recent Orders */}
            <section className="admin-card reports-section">
                <div className="admin-section-heading">
                    <div>
                        <h2>Recent Orders</h2>
                        <p>
                            Latest marketplace orders and their current status.
                        </p>
                    </div>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="admin-empty-state">
                        No recent orders available.
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table reports-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentOrders.map((order, index) => {
                                    const status = getOrderStatus(order);

                                    return (
                                        <tr
                                            key={
                                                order.id ||
                                                order.order_id ||
                                                index
                                            }
                                        >
                                            <td>
                                                <strong className="report-order-number">
                                                    {getOrderNumber(order)}
                                                </strong>
                                            </td>

                                            <td>
                                                {getCustomerName(order)}
                                            </td>

                                            <td>
                                                <span
                                                    className={`report-order-status ${getStatusClass(
                                                        status
                                                    )}`}
                                                >
                                                    {status}
                                                </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    {formatCurrency(
                                                        getOrderTotal(order)
                                                    )}
                                                </strong>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Reports;