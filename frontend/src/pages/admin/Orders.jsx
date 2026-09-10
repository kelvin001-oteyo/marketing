import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";


const ORDER_STATUSES = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];


function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);

    const [newStatus, setNewStatus] = useState("");


    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/orders/");

            const data = response.data;

            if (Array.isArray(data)) {
                setOrders(data);
            } else if (Array.isArray(data.results)) {
                setOrders(data.results);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Failed to load orders:", err);

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to load orders."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchOrders();
    }, []);


    const getOrderId = (order) => {
        return (
            order.order_number ||
            order.orderNumber ||
            order.reference ||
            `#${order.id}`
        );
    };


    const getCustomerName = (order) => {
        const customer =
            order.customer ||
            order.user ||
            order.buyer;

        if (!customer) {
            return "Guest Customer";
        }

        const firstName =
            customer.first_name ||
            customer.firstName ||
            "";

        const lastName =
            customer.last_name ||
            customer.lastName ||
            "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        return (
            fullName ||
            customer.username ||
            customer.name ||
            "Customer"
        );
    };


    const getCustomerEmail = (order) => {
        return (
            order.customer?.email ||
            order.user?.email ||
            order.buyer?.email ||
            order.email ||
            "No email"
        );
    };


    const getSellerName = (order) => {
        return (
            order.seller?.store_name ||
            order.seller?.storeName ||
            order.seller_name ||
            order.store_name ||
            "Multiple / Marketplace"
        );
    };


    const getStatus = (order) => {
        return (
            order.status ||
            order.order_status ||
            "PENDING"
        ).toString().toUpperCase();
    };


    const getTotal = (order) => {
        const value =
            order.total_amount ??
            order.total ??
            order.grand_total ??
            order.amount ??
            0;

        const numericValue = Number(value);

        if (Number.isNaN(numericValue)) {
            return "KSh 0.00";
        }

        return `KSh ${numericValue.toLocaleString(
            "en-KE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    };


    const getItemCount = (order) => {
        if (Array.isArray(order.items)) {
            return order.items.reduce(
                (total, item) =>
                    total +
                    Number(
                        item.quantity ||
                        item.qty ||
                        1
                    ),
                0
            );
        }

        return (
            order.item_count ||
            order.items_count ||
            order.quantity ||
            0
        );
    };


    const getDate = (order) => {
        const date =
            order.created_at ||
            order.createdAt ||
            order.date_created ||
            order.created;

        if (!date) {
            return "—";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "—";
        }

        return parsed.toLocaleDateString(
            "en-KE",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };


    const getDateTime = (order) => {
        const date =
            order.created_at ||
            order.createdAt ||
            order.date_created ||
            order.created;

        if (!date) {
            return "Not available";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "Not available";
        }

        return parsed.toLocaleString("en-KE");
    };


    const getStatusClass = (status) => {
        switch (status) {
            case "DELIVERED":
                return "order-status-delivered";

            case "SHIPPED":
                return "order-status-shipped";

            case "PROCESSING":
                return "order-status-processing";

            case "CONFIRMED":
                return "order-status-confirmed";

            case "CANCELLED":
                return "order-status-cancelled";

            case "PENDING":
            default:
                return "order-status-pending";
        }
    };


    const filteredOrders = useMemo(() => {
        const query = search.trim().toLowerCase();

        return orders.filter((order) => {
            const orderId =
                getOrderId(order).toLowerCase();

            const customer =
                getCustomerName(order).toLowerCase();

            const email =
                getCustomerEmail(order).toLowerCase();

            const seller =
                getSellerName(order).toLowerCase();

            const status =
                getStatus(order);

            const matchesSearch =
                !query ||
                orderId.includes(query) ||
                customer.includes(query) ||
                email.includes(query) ||
                seller.includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [orders, search, statusFilter]);


    const statistics = useMemo(() => {
        const total = orders.length;

        const pending = orders.filter(
            (order) =>
                getStatus(order) === "PENDING"
        ).length;

        const processing = orders.filter(
            (order) =>
                ["CONFIRMED", "PROCESSING"].includes(
                    getStatus(order)
                )
        ).length;

        const shipped = orders.filter(
            (order) =>
                getStatus(order) === "SHIPPED"
        ).length;

        const delivered = orders.filter(
            (order) =>
                getStatus(order) === "DELIVERED"
        ).length;

        const cancelled = orders.filter(
            (order) =>
                getStatus(order) === "CANCELLED"
        ).length;

        const revenue = orders.reduce(
            (total, order) => {
                const status = getStatus(order);

                if (status === "CANCELLED") {
                    return total;
                }

                const amount = Number(
                    order.total_amount ??
                    order.total ??
                    order.grand_total ??
                    order.amount ??
                    0
                );

                return total + (
                    Number.isNaN(amount)
                        ? 0
                        : amount
                );
            },
            0
        );

        return {
            total,
            pending,
            processing,
            shipped,
            delivered,
            cancelled,
            revenue,
        };
    }, [orders]);


    const openOrder = (order) => {
        setSelectedOrder(order);
        setNewStatus(getStatus(order));
        setError("");
        setSuccess("");
    };


    const closeOrder = () => {
        if (!statusLoading) {
            setSelectedOrder(null);
            setNewStatus("");
        }
    };


    const updateOrderStatus = async () => {
        if (!selectedOrder) {
            return;
        }

        const orderId = selectedOrder.id;

        if (!orderId) {
            setError("Order ID is missing.");
            return;
        }

        const currentStatus =
            getStatus(selectedOrder);

        if (newStatus === currentStatus) {
            setSuccess("No status changes were made.");
            return;
        }

        try {
            setStatusLoading(true);
            setError("");
            setSuccess("");

            /*
             * The backend order update endpoint is used here.
             * We only send the status so other order information
             * remains unchanged.
             */
            await api.patch(
                `/orders/${orderId}/`,
                {
                    status: newStatus,
                }
            );

            setSuccess(
                `Order ${getOrderId(selectedOrder)} updated successfully.`
            );

            await fetchOrders();

            const updatedOrder = {
                ...selectedOrder,
                status: newStatus,
            };

            setSelectedOrder(updatedOrder);

        } catch (err) {
            console.error(
                "Failed to update order:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to update order status."
            );
        } finally {
            setStatusLoading(false);
        }
    };


    return (
        <div className="admin-page">

            {/* Header */}
            <div className="admin-page-header">

                <div>
                    <h1>Orders</h1>

                    <p>
                        Monitor orders, customers, sellers and fulfillment status.
                    </p>
                </div>

                <div className="admin-page-header-actions">

                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={fetchOrders}
                        disabled={loading}
                    >
                        {loading
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </div>

            </div>


            {/* Statistics */}
            <div className="orders-stats-grid">

                <div className="order-stat-card">
                    <span>Total Orders</span>
                    <strong>
                        {statistics.total}
                    </strong>
                </div>


                <div className="order-stat-card">
                    <span>Pending</span>
                    <strong>
                        {statistics.pending}
                    </strong>
                </div>


                <div className="order-stat-card">
                    <span>Processing</span>
                    <strong>
                        {statistics.processing}
                    </strong>
                </div>


                <div className="order-stat-card">
                    <span>Shipped</span>
                    <strong>
                        {statistics.shipped}
                    </strong>
                </div>


                <div className="order-stat-card">
                    <span>Delivered</span>
                    <strong>
                        {statistics.delivered}
                    </strong>
                </div>


                <div className="order-stat-card">
                    <span>Revenue</span>
                    <strong>
                        KSh{" "}
                        {statistics.revenue.toLocaleString(
                            "en-KE",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}
                    </strong>
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
            <div className="admin-card orders-toolbar">

                <div className="orders-search">

                    <input
                        type="text"
                        placeholder="Search order, customer, seller..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="orders-status-filter">

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        {ORDER_STATUSES.map(
                            (status) => (
                                <option
                                    key={status}
                                    value={status}
                                >
                                    {status === "ALL"
                                        ? "All Orders"
                                        : status}
                                </option>
                            )
                        )}

                    </select>

                </div>

            </div>


            {/* Orders Table */}
            <div className="admin-card orders-table-card">

                {loading ? (
                    <div className="admin-loading">
                        Loading orders...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="admin-empty-state">

                        <h3>
                            No orders found
                        </h3>

                        <p>
                            There are no orders matching your current filters.
                        </p>

                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table orders-table">

                            <thead>

                                <tr>

                                    <th>Order</th>

                                    <th>Customer</th>

                                    <th>Seller</th>

                                    <th>Items</th>

                                    <th>Total</th>

                                    <th>Status</th>

                                    <th>Date</th>

                                    <th>Action</th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredOrders.map(
                                    (order) => {

                                        const status =
                                            getStatus(order);

                                        return (
                                            <tr
                                                key={
                                                    order.id
                                                }
                                            >

                                                <td>

                                                    <strong className="order-number">
                                                        {getOrderId(
                                                            order
                                                        )}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <div className="order-customer">

                                                        <strong>
                                                            {getCustomerName(
                                                                order
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {getCustomerEmail(
                                                                order
                                                            )}
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>
                                                    {getSellerName(
                                                        order
                                                    )}
                                                </td>


                                                <td>
                                                    {getItemCount(
                                                        order
                                                    )}
                                                </td>


                                                <td>

                                                    <strong>
                                                        {getTotal(
                                                            order
                                                        )}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`order-status-badge ${getStatusClass(
                                                            status
                                                        )}`}
                                                    >
                                                        {status}
                                                    </span>

                                                </td>


                                                <td>
                                                    {getDate(
                                                        order
                                                    )}
                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        className="admin-btn admin-btn-small admin-btn-secondary"
                                                        onClick={() =>
                                                            openOrder(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>


            {/* Order Details Modal */}
            {selectedOrder && (
                <div
                    className="admin-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeOrder();
                        }
                    }}
                >

                    <div className="admin-modal order-details-modal">

                        <div className="admin-modal-header">

                            <div>

                                <h2>
                                    Order{" "}
                                    {getOrderId(
                                        selectedOrder
                                    )}
                                </h2>

                                <p>
                                    Review order details and update fulfillment status.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeOrder}
                                disabled={statusLoading}
                            >
                                ×
                            </button>

                        </div>


                        <div className="order-details-content">

                            {/* Summary */}
                            <div className="order-summary-grid">

                                <div className="order-detail-box">

                                    <span>
                                        Customer
                                    </span>

                                    <strong>
                                        {getCustomerName(
                                            selectedOrder
                                        )}
                                    </strong>

                                    <small>
                                        {getCustomerEmail(
                                            selectedOrder
                                        )}
                                    </small>

                                </div>


                                <div className="order-detail-box">

                                    <span>
                                        Seller
                                    </span>

                                    <strong>
                                        {getSellerName(
                                            selectedOrder
                                        )}
                                    </strong>

                                </div>


                                <div className="order-detail-box">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {getTotal(
                                            selectedOrder
                                        )}
                                    </strong>

                                </div>


                                <div className="order-detail-box">

                                    <span>
                                        Created
                                    </span>

                                    <strong>
                                        {getDateTime(
                                            selectedOrder
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {/* Status */}
                            <div className="order-status-editor">

                                <label htmlFor="order-status">
                                    Order Status
                                </label>

                                <div className="order-status-editor-row">

                                    <select
                                        id="order-status"
                                        value={newStatus}
                                        onChange={(event) =>
                                            setNewStatus(
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            statusLoading
                                        }
                                    >

                                        {ORDER_STATUSES
                                            .filter(
                                                (status) =>
                                                    status !==
                                                    "ALL"
                                            )
                                            .map(
                                                (
                                                    status
                                                ) => (
                                                    <option
                                                        key={
                                                            status
                                                        }
                                                        value={
                                                            status
                                                        }
                                                    >
                                                        {
                                                            status
                                                        }
                                                    </option>
                                                )
                                            )}

                                    </select>


                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-primary"
                                        onClick={
                                            updateOrderStatus
                                        }
                                        disabled={
                                            statusLoading ||
                                            newStatus ===
                                            getStatus(
                                                selectedOrder
                                            )
                                        }
                                    >
                                        {statusLoading
                                            ? "Updating..."
                                            : "Update Status"}
                                    </button>

                                </div>

                            </div>


                            {/* Items */}
                            {Array.isArray(
                                selectedOrder.items
                            ) && (
                                <div className="order-items-section">

                                    <h3>
                                        Order Items
                                    </h3>

                                    <div className="order-items-list">

                                        {selectedOrder.items.map(
                                            (
                                                item,
                                                index
                                            ) => {

                                                const product =
                                                    item.product ||
                                                    {};

                                                return (
                                                    <div
                                                        className="order-item-row"
                                                        key={
                                                            item.id ||
                                                            index
                                                        }
                                                    >

                                                        <div className="order-item-info">

                                                            <strong>
                                                                {product.name ||
                                                                    item.product_name ||
                                                                    item.name ||
                                                                    "Product"}
                                                            </strong>

                                                            <span>
                                                                SKU:{" "}
                                                                {item.sku ||
                                                                    product.sku ||
                                                                    "—"}
                                                            </span>

                                                        </div>


                                                        <div className="order-item-quantity">
                                                            ×{" "}
                                                            {item.quantity ||
                                                                item.qty ||
                                                                1}
                                                        </div>


                                                        <div className="order-item-price">

                                                            KSh{" "}
                                                            {Number(
                                                                item.total_price ||
                                                                item.total ||
                                                                item.price ||
                                                                0
                                                            ).toLocaleString(
                                                                "en-KE",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                }
                                                            )}

                                                        </div>

                                                    </div>
                                                );
                                            }
                                        )}

                                    </div>

                                </div>
                            )}


                            {/* Shipping */}
                            <div className="order-shipping-section">

                                <h3>
                                    Shipping Information
                                </h3>

                                <div className="order-shipping-box">

                                    <p>
                                        <strong>
                                            Address:
                                        </strong>{" "}
                                        {selectedOrder.shipping_address ||
                                            selectedOrder.shippingAddress ||
                                            selectedOrder.address ||
                                            "Not provided"}
                                    </p>

                                    <p>
                                        <strong>
                                            Phone:
                                        </strong>{" "}
                                        {selectedOrder.shipping_phone ||
                                            selectedOrder.phone ||
                                            selectedOrder.customer?.phone_number ||
                                            "Not provided"}
                                    </p>

                                    <p>
                                        <strong>
                                            City:
                                        </strong>{" "}
                                        {selectedOrder.shipping_city ||
                                            selectedOrder.city ||
                                            "Not provided"}
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="admin-modal-footer">

                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={closeOrder}
                                disabled={statusLoading}
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


export default Orders;