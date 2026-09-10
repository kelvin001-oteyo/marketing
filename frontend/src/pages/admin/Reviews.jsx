import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function getItems(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
}

function getReviewId(review) {
    return review.id ?? review.review_id;
}

function getProductName(review) {
    return (
        review.product_name ||
        review.product?.name ||
        review.product?.title ||
        "Unknown product"
    );
}

function getCustomerName(review) {
    if (review.customer_name) return review.customer_name;

    if (review.user?.first_name || review.user?.last_name) {
        return `${review.user?.first_name || ""} ${
            review.user?.last_name || ""
        }`.trim();
    }

    return (
        review.user?.username ||
        review.user?.email ||
        review.customer?.name ||
        review.customer?.email ||
        "Unknown customer"
    );
}

function getRating(review) {
    return Number(review.rating || 0);
}

function getStatus(review) {
    if (
        review.is_approved === true ||
        review.approved === true ||
        review.status === "APPROVED"
    ) {
        return "APPROVED";
    }

    if (
        review.is_rejected === true ||
        review.rejected === true ||
        review.status === "REJECTED"
    ) {
        return "REJECTED";
    }

    return review.status || "PENDING";
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function StarRating({ rating }) {
    return (
        <div className="review-stars" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={
                        star <= rating
                            ? "review-star review-star-active"
                            : "review-star"
                    }
                >
                    ★
                </span>
            ))}
        </div>
    );
}

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [ratingFilter, setRatingFilter] = useState("ALL");

    const [selectedReview, setSelectedReview] = useState(null);

    const loadReviews = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/reviews/");
            setReviews(getItems(response.data));
        } catch (err) {
            console.error("Failed to load reviews:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to load reviews. Make sure the reviews API is available."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const approveReview = async (review) => {
        const reviewId = getReviewId(review);

        if (!reviewId) return;

        try {
            setActionLoading(reviewId);
            setError("");

            await api.patch(`/reviews/${reviewId}/`, {
                status: "APPROVED",
                is_approved: true,
            });

            await loadReviews();

            if (selectedReview && getReviewId(selectedReview) === reviewId) {
                setSelectedReview(null);
            }
        } catch (err) {
            console.error("Failed to approve review:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to approve the review."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const rejectReview = async (review) => {
        const reviewId = getReviewId(review);

        if (!reviewId) return;

        try {
            setActionLoading(reviewId);
            setError("");

            await api.patch(`/reviews/${reviewId}/`, {
                status: "REJECTED",
                is_approved: false,
            });

            await loadReviews();

            if (selectedReview && getReviewId(selectedReview) === reviewId) {
                setSelectedReview(null);
            }
        } catch (err) {
            console.error("Failed to reject review:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to reject the review."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const deleteReview = async (review) => {
        const reviewId = getReviewId(review);

        if (!reviewId) return;

        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this review?"
        );

        if (!confirmed) return;

        try {
            setActionLoading(reviewId);
            setError("");

            await api.delete(`/reviews/${reviewId}/`);

            await loadReviews();

            if (selectedReview && getReviewId(selectedReview) === reviewId) {
                setSelectedReview(null);
            }
        } catch (err) {
            console.error("Failed to delete review:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to delete the review."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const statistics = useMemo(() => {
        const total = reviews.length;

        const approved = reviews.filter(
            (review) => getStatus(review) === "APPROVED"
        ).length;

        const pending = reviews.filter(
            (review) => getStatus(review) === "PENDING"
        ).length;

        const rejected = reviews.filter(
            (review) => getStatus(review) === "REJECTED"
        ).length;

        const ratings = reviews
            .map(getRating)
            .filter((rating) => rating > 0);

        const averageRating =
            ratings.length > 0
                ? (
                      ratings.reduce((sum, rating) => sum + rating, 0) /
                      ratings.length
                  ).toFixed(1)
                : "0.0";

        return {
            total,
            approved,
            pending,
            rejected,
            averageRating,
        };
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        const query = search.trim().toLowerCase();

        return reviews.filter((review) => {
            const status = getStatus(review);
            const rating = getRating(review);

            const searchableText = [
                getProductName(review),
                getCustomerName(review),
                review.title,
                review.comment,
                review.body,
                review.text,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !query || searchableText.includes(query);

            const matchesStatus =
                statusFilter === "ALL" || status === statusFilter;

            const matchesRating =
                ratingFilter === "ALL" ||
                rating === Number(ratingFilter);

            return matchesSearch && matchesStatus && matchesRating;
        });
    }, [reviews, search, statusFilter, ratingFilter]);

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Reviews</h1>
                    <p>
                        Manage customer reviews and moderate marketplace
                        feedback.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={loadReviews}
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

            <div className="reviews-stats-grid">
                <div className="review-stat-card">
                    <span className="review-stat-label">Total Reviews</span>
                    <strong className="review-stat-value">
                        {statistics.total}
                    </strong>
                </div>

                <div className="review-stat-card">
                    <span className="review-stat-label">Approved</span>
                    <strong className="review-stat-value">
                        {statistics.approved}
                    </strong>
                </div>

                <div className="review-stat-card">
                    <span className="review-stat-label">Pending</span>
                    <strong className="review-stat-value">
                        {statistics.pending}
                    </strong>
                </div>

                <div className="review-stat-card">
                    <span className="review-stat-label">Rejected</span>
                    <strong className="review-stat-value">
                        {statistics.rejected}
                    </strong>
                </div>

                <div className="review-stat-card">
                    <span className="review-stat-label">
                        Average Rating
                    </span>
                    <strong className="review-stat-value">
                        {statistics.averageRating} / 5
                    </strong>
                </div>
            </div>

            <div className="reviews-toolbar">
                <div className="reviews-search">
                    <input
                        type="text"
                        placeholder="Search product, customer or review..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <select
                    className="reviews-filter"
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>

                <select
                    className="reviews-filter"
                    value={ratingFilter}
                    onChange={(event) =>
                        setRatingFilter(event.target.value)
                    }
                >
                    <option value="ALL">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            <div className="admin-table-card reviews-table-card">
                {loading ? (
                    <div className="admin-loading">
                        Loading reviews...
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="admin-empty">
                        <h3>No reviews found</h3>
                        <p>
                            Try changing your search or filter settings.
                        </p>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table reviews-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Rating</th>
                                    <th>Review</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredReviews.map((review) => {
                                    const reviewId = getReviewId(review);
                                    const status = getStatus(review);
                                    const rating = getRating(review);

                                    return (
                                        <tr key={reviewId}>
                                            <td>
                                                <div className="review-customer">
                                                    <div className="review-avatar">
                                                        {getCustomerName(
                                                            review
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {getCustomerName(
                                                                review
                                                            )}
                                                        </strong>

                                                        {review.user?.email && (
                                                            <small>
                                                                {
                                                                    review.user
                                                                        .email
                                                                }
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <strong className="review-product-name">
                                                    {getProductName(review)}
                                                </strong>
                                            </td>

                                            <td>
                                                <StarRating rating={rating} />
                                                <span className="review-rating-number">
                                                    {rating}/5
                                                </span>
                                            </td>

                                            <td>
                                                <div className="review-preview">
                                                    {review.title && (
                                                        <strong>
                                                            {review.title}
                                                        </strong>
                                                    )}

                                                    <span>
                                                        {review.comment ||
                                                            review.body ||
                                                            review.text ||
                                                            "No review text"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`review-status-badge review-status-${status.toLowerCase()}`}
                                                >
                                                    {status}
                                                </span>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    review.created_at ||
                                                        review.created ||
                                                        review.date
                                                )}
                                            </td>

                                            <td>
                                                <div className="admin-actions">
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn"
                                                        onClick={() =>
                                                            setSelectedReview(
                                                                review
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    {status !== "APPROVED" && (
                                                        <button
                                                            type="button"
                                                            className="admin-action-btn admin-action-success"
                                                            disabled={
                                                                actionLoading ===
                                                                reviewId
                                                            }
                                                            onClick={() =>
                                                                approveReview(
                                                                    review
                                                                )
                                                            }
                                                        >
                                                            Approve
                                                        </button>
                                                    )}

                                                    {status !== "REJECTED" && (
                                                        <button
                                                            type="button"
                                                            className="admin-action-btn admin-action-warning"
                                                            disabled={
                                                                actionLoading ===
                                                                reviewId
                                                            }
                                                            onClick={() =>
                                                                rejectReview(
                                                                    review
                                                                )
                                                            }
                                                        >
                                                            Reject
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="admin-action-btn admin-action-danger"
                                                        disabled={
                                                            actionLoading ===
                                                            reviewId
                                                        }
                                                        onClick={() =>
                                                            deleteReview(
                                                                review
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
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

            {selectedReview && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setSelectedReview(null)}
                >
                    <div
                        className="admin-modal review-details-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-modal-header">
                            <div>
                                <h2>Review Details</h2>
                                <p>
                                    Full customer feedback and moderation
                                    controls.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={() => setSelectedReview(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="review-details-content">
                            <div className="review-details-top">
                                <div className="review-large-avatar">
                                    {getCustomerName(selectedReview)
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <h3>
                                        {getCustomerName(selectedReview)}
                                    </h3>

                                    <p>
                                        {getProductName(selectedReview)}
                                    </p>

                                    <StarRating
                                        rating={getRating(selectedReview)}
                                    />
                                </div>
                            </div>

                            {selectedReview.title && (
                                <div className="review-detail-section">
                                    <h4>Title</h4>
                                    <p>{selectedReview.title}</p>
                                </div>
                            )}

                            <div className="review-detail-section">
                                <h4>Review</h4>
                                <p>
                                    {selectedReview.comment ||
                                        selectedReview.body ||
                                        selectedReview.text ||
                                        "No review text available."}
                                </p>
                            </div>

                            <div className="review-detail-grid">
                                <div>
                                    <span>Status</span>
                                    <strong>
                                        {getStatus(selectedReview)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Rating</span>
                                    <strong>
                                        {getRating(selectedReview)} / 5
                                    </strong>
                                </div>

                                <div>
                                    <span>Date</span>
                                    <strong>
                                        {formatDate(
                                            selectedReview.created_at ||
                                                selectedReview.created ||
                                                selectedReview.date
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>Review ID</span>
                                    <strong>
                                        #{getReviewId(selectedReview)}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            {getStatus(selectedReview) !== "APPROVED" && (
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-success"
                                    disabled={
                                        actionLoading ===
                                        getReviewId(selectedReview)
                                    }
                                    onClick={() =>
                                        approveReview(selectedReview)
                                    }
                                >
                                    Approve Review
                                </button>
                            )}

                            {getStatus(selectedReview) !== "REJECTED" && (
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-warning"
                                    disabled={
                                        actionLoading ===
                                        getReviewId(selectedReview)
                                    }
                                    onClick={() =>
                                        rejectReview(selectedReview)
                                    }
                                >
                                    Reject Review
                                </button>
                            )}

                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setSelectedReview(null)}
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