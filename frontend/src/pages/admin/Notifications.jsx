import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function getItems(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
}

function getNotificationId(notification) {
    return notification.id ?? notification.notification_id;
}

function getNotificationTitle(notification) {
    return (
        notification.title ||
        notification.subject ||
        notification.type ||
        "Notification"
    );
}

function getNotificationMessage(notification) {
    return (
        notification.message ||
        notification.body ||
        notification.content ||
        "No message available."
    );
}

function getRecipientName(notification) {
    if (notification.recipient_name) {
        return notification.recipient_name;
    }

    if (notification.user?.first_name || notification.user?.last_name) {
        return `${notification.user?.first_name || ""} ${
            notification.user?.last_name || ""
        }`.trim();
    }

    return (
        notification.user?.username ||
        notification.user?.email ||
        notification.recipient?.name ||
        notification.recipient?.email ||
        "All users"
    );
}

function getNotificationType(notification) {
    return (
        notification.notification_type ||
        notification.type ||
        notification.category ||
        "GENERAL"
    );
}

function isRead(notification) {
    return (
        notification.is_read === true ||
        notification.read === true ||
        notification.status === "READ"
    );
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const [selectedNotification, setSelectedNotification] =
        useState(null);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/notifications/");

            setNotifications(getItems(response.data));
        } catch (err) {
            console.error("Failed to load notifications:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to load notifications. Make sure the notifications API is available."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const markAsRead = async (notification) => {
        const notificationId = getNotificationId(notification);

        if (!notificationId) return;

        try {
            setActionLoading(notificationId);
            setError("");

            await api.patch(`/notifications/${notificationId}/`, {
                is_read: true,
            });

            await loadNotifications();
        } catch (err) {
            console.error("Failed to mark notification as read:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to mark notification as read."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const markAsUnread = async (notification) => {
        const notificationId = getNotificationId(notification);

        if (!notificationId) return;

        try {
            setActionLoading(notificationId);
            setError("");

            await api.patch(`/notifications/${notificationId}/`, {
                is_read: false,
            });

            await loadNotifications();
        } catch (err) {
            console.error("Failed to mark notification as unread:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to mark notification as unread."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const deleteNotification = async (notification) => {
        const notificationId = getNotificationId(notification);

        if (!notificationId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this notification?"
        );

        if (!confirmed) return;

        try {
            setActionLoading(notificationId);
            setError("");

            await api.delete(`/notifications/${notificationId}/`);

            await loadNotifications();

            if (
                selectedNotification &&
                getNotificationId(selectedNotification) === notificationId
            ) {
                setSelectedNotification(null);
            }
        } catch (err) {
            console.error("Failed to delete notification:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to delete notification."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const statistics = useMemo(() => {
        const total = notifications.length;

        const read = notifications.filter(isRead).length;

        const unread = notifications.filter(
            (notification) => !isRead(notification)
        ).length;

        const orderNotifications = notifications.filter((notification) =>
            getNotificationType(notification)
                .toLowerCase()
                .includes("order")
        ).length;

        const sellerNotifications = notifications.filter((notification) =>
            getNotificationType(notification)
                .toLowerCase()
                .includes("seller")
        ).length;

        return {
            total,
            read,
            unread,
            orderNotifications,
            sellerNotifications,
        };
    }, [notifications]);

    const notificationTypes = useMemo(() => {
        const types = notifications
            .map(getNotificationType)
            .filter(Boolean);

        return [...new Set(types)];
    }, [notifications]);

    const filteredNotifications = useMemo(() => {
        const query = search.trim().toLowerCase();

        return notifications.filter((notification) => {
            const title = getNotificationTitle(notification);
            const message = getNotificationMessage(notification);
            const recipient = getRecipientName(notification);
            const type = getNotificationType(notification);

            const searchableText = [
                title,
                message,
                recipient,
                type,
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !query || searchableText.includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "READ" && isRead(notification)) ||
                (statusFilter === "UNREAD" && !isRead(notification));

            const matchesType =
                typeFilter === "ALL" || type === typeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );
        });
    }, [
        notifications,
        search,
        statusFilter,
        typeFilter,
    ]);

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Notifications</h1>
                    <p>
                        Monitor marketplace notifications and manage
                        notification status.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={loadNotifications}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {error && (
                <div className="admin-alert admin-alert-error">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Close error"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="notifications-stats-grid">
                <div className="notification-stat-card">
                    <span className="notification-stat-label">
                        Total
                    </span>
                    <strong className="notification-stat-value">
                        {statistics.total}
                    </strong>
                </div>

                <div className="notification-stat-card">
                    <span className="notification-stat-label">
                        Unread
                    </span>
                    <strong className="notification-stat-value">
                        {statistics.unread}
                    </strong>
                </div>

                <div className="notification-stat-card">
                    <span className="notification-stat-label">
                        Read
                    </span>
                    <strong className="notification-stat-value">
                        {statistics.read}
                    </strong>
                </div>

                <div className="notification-stat-card">
                    <span className="notification-stat-label">
                        Order Notifications
                    </span>
                    <strong className="notification-stat-value">
                        {statistics.orderNotifications}
                    </strong>
                </div>

                <div className="notification-stat-card">
                    <span className="notification-stat-label">
                        Seller Notifications
                    </span>
                    <strong className="notification-stat-value">
                        {statistics.sellerNotifications}
                    </strong>
                </div>
            </div>

            <div className="notifications-toolbar">
                <div className="notifications-search">
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>

                <select
                    className="notifications-filter"
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                >
                    <option value="ALL">All Statuses</option>
                    <option value="UNREAD">Unread</option>
                    <option value="READ">Read</option>
                </select>

                <select
                    className="notifications-filter"
                    value={typeFilter}
                    onChange={(event) =>
                        setTypeFilter(event.target.value)
                    }
                >
                    <option value="ALL">All Types</option>

                    {notificationTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            <div className="admin-table-card notifications-table-card">
                {loading ? (
                    <div className="admin-loading">
                        Loading notifications...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="admin-empty">
                        <h3>No notifications found</h3>
                        <p>
                            Try changing your search or filter settings.
                        </p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table notifications-table">
                            <thead>
                                <tr>
                                    <th>Notification</th>
                                    <th>Recipient</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredNotifications.map(
                                    (notification) => {
                                        const notificationId =
                                            getNotificationId(
                                                notification
                                            );

                                        const read =
                                            isRead(notification);

                                        return (
                                            <tr
                                                key={
                                                    notificationId
                                                }
                                                className={
                                                    !read
                                                        ? "notification-unread-row"
                                                        : ""
                                                }
                                            >
                                                <td>
                                                    <div className="notification-main">
                                                        <div className="notification-icon">
                                                            {getNotificationType(
                                                                notification
                                                            )
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="notification-copy">
                                                            <strong>
                                                                {getNotificationTitle(
                                                                    notification
                                                                )}
                                                            </strong>

                                                            <span>
                                                                {getNotificationMessage(
                                                                    notification
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {getRecipientName(
                                                            notification
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="notification-type-badge">
                                                        {getNotificationType(
                                                            notification
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`notification-status-badge ${
                                                            read
                                                                ? "notification-status-read"
                                                                : "notification-status-unread"
                                                        }`}
                                                    >
                                                        {read
                                                            ? "READ"
                                                            : "UNREAD"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        notification.created_at ||
                                                            notification.created ||
                                                            notification.timestamp
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="admin-actions">
                                                        <button
                                                            type="button"
                                                            className="admin-action-btn"
                                                            onClick={() =>
                                                                setSelectedNotification(
                                                                    notification
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        {!read ? (
                                                            <button
                                                                type="button"
                                                                className="admin-action-btn admin-action-success"
                                                                disabled={
                                                                    actionLoading ===
                                                                    notificationId
                                                                }
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        notification
                                                                    )
                                                                }
                                                            >
                                                                Mark Read
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="admin-action-btn"
                                                                disabled={
                                                                    actionLoading ===
                                                                    notificationId
                                                                }
                                                                onClick={() =>
                                                                    markAsUnread(
                                                                        notification
                                                                    )
                                                                }
                                                            >
                                                                Unread
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className="admin-action-btn admin-action-danger"
                                                            disabled={
                                                                actionLoading ===
                                                                notificationId
                                                            }
                                                            onClick={() =>
                                                                deleteNotification(
                                                                    notification
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
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

            {selectedNotification && (
                <div
                    className="admin-modal-overlay"
                    onClick={() =>
                        setSelectedNotification(null)
                    }
                >
                    <div
                        className="admin-modal notification-details-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="admin-modal-header">
                            <div>
                                <h2>Notification Details</h2>
                                <p>
                                    Full notification information.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={() =>
                                    setSelectedNotification(null)
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div className="notification-details-content">
                            <div className="notification-details-top">
                                <div className="notification-large-icon">
                                    {getNotificationType(
                                        selectedNotification
                                    )
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <h3>
                                        {getNotificationTitle(
                                            selectedNotification
                                        )}
                                    </h3>

                                    <span className="notification-type-badge">
                                        {getNotificationType(
                                            selectedNotification
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="notification-detail-message">
                                <h4>Message</h4>

                                <p>
                                    {getNotificationMessage(
                                        selectedNotification
                                    )}
                                </p>
                            </div>

                            <div className="notification-detail-grid">
                                <div>
                                    <span>Recipient</span>
                                    <strong>
                                        {getRecipientName(
                                            selectedNotification
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>
                                        {isRead(
                                            selectedNotification
                                        )
                                            ? "READ"
                                            : "UNREAD"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Type</span>
                                    <strong>
                                        {getNotificationType(
                                            selectedNotification
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>Date</span>
                                    <strong>
                                        {formatDate(
                                            selectedNotification.created_at ||
                                                selectedNotification.created ||
                                                selectedNotification.timestamp
                                        )}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            {!isRead(
                                selectedNotification
                            ) ? (
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-success"
                                    onClick={() =>
                                        markAsRead(
                                            selectedNotification
                                        )
                                    }
                                >
                                    Mark as Read
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() =>
                                        markAsUnread(
                                            selectedNotification
                                        )
                                    }
                                >
                                    Mark as Unread
                                </button>
                            )}

                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={() =>
                                    setSelectedNotification(null)
                                }
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