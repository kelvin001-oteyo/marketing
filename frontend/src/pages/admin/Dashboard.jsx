import { useEffect, useState } from "react";

import api from "../../services/api";

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response =
                    await api.get(
                        "/reports/dashboard/"
                    );

                setSummary(response.data);
            } catch (err) {
                console.error(
                    "Dashboard error:",
                    err
                );

                setError(
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div>
                <h1>Dashboard</h1>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>Dashboard</h1>
                <p>{error}</p>
            </div>
        );
    }

    const cards = [
        {
            label: "Total Revenue",
            value: `KES ${
                summary?.total_revenue ?? "0.00"
            }`,
        },
        {
            label: "Today's Revenue",
            value: `KES ${
                summary?.today_revenue ?? "0.00"
            }`,
        },
        {
            label: "Total Orders",
            value:
                summary?.total_orders ?? 0,
        },
        {
            label: "Pending Orders",
            value:
                summary?.pending_orders ?? 0,
        },
        {
            label: "Customers",
            value:
                summary?.total_customers ?? 0,
        },
        {
            label: "Sellers",
            value:
                summary?.total_sellers ?? 0,
        },
        {
            label: "Products",
            value:
                summary?.total_products ?? 0,
        },
        {
            label: "Low Stock",
            value:
                summary?.low_stock_products ?? 0,
        },
    ];

    return (
        <div className="dashboard-page">

            <div className="dashboard-heading">
                <div>
                    <h1>Dashboard</h1>
                    <p>
                        Overview of your clothing
                        marketplace.
                    </p>
                </div>
            </div>

            <div className="dashboard-cards">

                {cards.map((card) => (
                    <div
                        className="dashboard-card"
                        key={card.label}
                    >
                        <span>
                            {card.label}
                        </span>

                        <strong>
                            {card.value}
                        </strong>
                    </div>
                ))}

            </div>

        </div>
    );
}