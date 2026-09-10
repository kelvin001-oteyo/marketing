import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


export default function ProtectedRoute({ allowedRoles }) {
    const { loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="route-loading">Loading...</div>;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
