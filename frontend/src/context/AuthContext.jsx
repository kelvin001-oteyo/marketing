import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        try {
            return savedUser
                ? JSON.parse(savedUser)
                : null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token =
                localStorage.getItem("access_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response =
                    await api.get("/auth/me/");

                setUser(response.data);

                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data)
                );
            } catch {
                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "refresh_token"
                );

                localStorage.removeItem("user");

                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = (access, refresh, userData) => {
        localStorage.setItem(
            "access_token",
            access
        );

        localStorage.setItem(
            "refresh_token",
            refresh
        );

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "ADMIN",
        isSeller: user?.role === "SELLER",
        isCustomer: user?.role === "CUSTOMER",
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}