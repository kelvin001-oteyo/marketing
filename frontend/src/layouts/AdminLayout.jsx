import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/admin.css";

const navigation = [
    {
        label: "Dashboard",
        path: "/admin",
        icon: "▦",
        end: true,
    },
    {
        label: "Products",
        path: "/admin/products",
        icon: "◈",
    },
    {
        label: "Categories",
        path: "/admin/categories",
        icon: "◇",
    },
    {
        label: "Sellers",
        path: "/admin/sellers",
        icon: "♙",
    },
    {
        label: "Customers",
        path: "/admin/customers",
        icon: "♙",
    },
    {
        label: "Inventory",
        path: "/admin/inventory",
        icon: "▤",
    },
    {
        label: "Orders",
        path: "/admin/orders",
        icon: "▣",
    },
    {
        label: "Promotions",
        path: "/admin/promotions",
        icon: "%",
    },
    {
        label: "Reviews",
        path: "/admin/reviews",
        icon: "★",
    },
    {
        label: "Notifications",
        path: "/admin/notifications",
        icon: "♢",
    },
    {
        label: "Reports",
        path: "/admin/reports",
        icon: "▥",
    },
    {
        label: "Store Settings",
        path: "/admin/settings",
        icon: "⚙",
    },
];

export default function AdminLayout() {
    const {
        user,
        logout,
    } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="admin-shell">

            <aside className="admin-sidebar">

                <div className="admin-brand">
                    <div className="admin-brand-mark">
                        CM
                    </div>

                    <div>
                        <h1>Clothing Market</h1>
                        <span>Administration</span>
                    </div>
                </div>

                <nav className="admin-navigation">

                    <p className="navigation-title">
                        MANAGEMENT
                    </p>

                    {navigation.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `admin-nav-link ${
                                    isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                        >
                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>
                        </NavLink>
                    ))}

                </nav>

                <div className="admin-sidebar-footer">

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            <div className="admin-main">

                <header className="admin-header">

                    <div>
                        <p className="header-label">
                            ADMINISTRATION
                        </p>

                        <h2>
                            Marketplace Management
                        </h2>
                    </div>

                    <div className="admin-user">

                        <div className="admin-user-avatar">
                            {user?.first_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                user?.username
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                "A"}
                        </div>

                        <div>
                            <strong>
                                {user?.first_name ||
                                    user?.username ||
                                    "Administrator"}
                            </strong>

                            <span>
                                Administrator
                            </span>
                        </div>

                    </div>

                </header>

                <main className="admin-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}