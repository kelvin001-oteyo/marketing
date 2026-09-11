import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// ============================================================
// CUSTOMER PAGES
// ============================================================
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import Stores from "./pages/Stores";
import StoreDetails from "./pages/StoreDetails";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import Addresses from "./pages/Addresses";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";

// ============================================================
// SELLER PAGES
// ============================================================
import SellerApplication from "./pages/SellerApplication";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import SellerAddProduct from "./pages/SellerAddProduct";
import SellerEditProduct from "./pages/SellerEditProduct";
import SellerProductVariants from "./pages/SellerProductVariants";
import SellerInventory from "./pages/SellerInventory";
import SellerOrders from "./pages/SellerOrders";
import SellerStore from "./pages/SellerStore";

// ============================================================
// ADMIN PAGES
// ============================================================
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/admin/Dashboard";
import ProductsAdmin from "./pages/admin/Products";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import ProductVariants from "./components/admin/ProductVariants";
import InventoryAdmin from "./pages/admin/Inventory";
import CategoriesAdmin from "./pages/admin/Categories";
import SellersAdmin from "./pages/admin/Sellers";
import CustomersAdmin from "./pages/admin/Customers";
import OrdersAdmin from "./pages/admin/Orders";
import PromotionsAdmin from "./pages/admin/Promotions";
import ReviewsAdmin from "./pages/admin/Reviews";
import NotificationsAdmin from "./pages/admin/Notifications";
import ReportsAdmin from "./pages/admin/Reports";
import SettingsAdmin from "./pages/admin/Settings";

// ============================================================
// ROUTE GUARDS
// ============================================================
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ========================================================
                    PUBLIC CUSTOMER MARKETPLACE
                ========================================================= */}

                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/contact" element={<Contact />} />

                <Route
                    path="/products"
                    element={<Products />}
                />

                <Route
                    path="/products/:id"
                    element={<ProductDetails />}
                />

                <Route
                    path="/categories"
                    element={<Categories />}
                />

                <Route
                    path="/categories/:slug"
                    element={<CategoryProducts />}
                />

                <Route
                    path="/stores"
                    element={<Stores />}
                />

                <Route
                    path="/stores/:slug"
                    element={<StoreDetails />}
                />

                <Route
                    path="/search"
                    element={<Search />}
                />


                {/* ========================================================
                    AUTHENTICATED CUSTOMER AREA
                ========================================================= */}

                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/cart"
                        element={<Cart />}
                    />

                    <Route
                        path="/wishlist"
                        element={<Wishlist />}
                    />

                    <Route
                        path="/checkout"
                        element={<Checkout />}
                    />

                    <Route
                        path="/orders/success"
                        element={<OrderSuccess />}
                    />

                    <Route
                        path="/orders"
                        element={<Orders />}
                    />

                    <Route
                        path="/orders/:id"
                        element={<OrderDetails />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/addresses"
                        element={<Addresses />}
                    />

                    <Route
                        path="/sell"
                        element={<SellerApplication />}
                    />

                </Route>


                {/* ========================================================
                    SELLER DASHBOARD
                ========================================================= */}

                <Route
                    element={
                        <ProtectedRoute allowedRoles={["SELLER"]} />
                    }
                >

                    {/* Main seller dashboard */}

                    <Route
                        path="/sell/dashboard"
                        element={<SellerDashboard />}
                    />

                    {/* Alternative seller dashboard URLs */}

                    <Route
                        path="/seller"
                        element={
                            <Navigate
                                to="/sell/dashboard"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/seller/dashboard"
                        element={
                            <Navigate
                                to="/sell/dashboard"
                                replace
                            />
                        }
                    />


                    {/* Seller products */}

                    <Route
                        path="/seller/products"
                        element={<SellerProducts />}
                    />

                    <Route
                        path="/seller/products/new"
                        element={<SellerAddProduct />}
                    />

                    <Route
                        path="/seller/products/:id/edit"
                        element={<SellerEditProduct />}
                    />

                    <Route
                        path="/seller/products/:id/variants"
                        element={<SellerProductVariants />}
                    />


                    {/* Seller inventory */}

                    <Route
                        path="/seller/inventory"
                        element={<SellerInventory />}
                    />


                    {/* Seller orders */}

                    <Route
                        path="/seller/orders"
                        element={<SellerOrders />}
                    />


                    {/* Seller store */}

                    <Route
                        path="/seller/store"
                        element={<SellerStore />}
                    />

                </Route>


                {/* ========================================================
                    ADMIN DASHBOARD
                =========================================================
                    
                    IMPORTANT:
                    Every /admin/* page is protected by AdminRoute.
                    
                    Example:
                    /admin
                    /admin/products
                    /admin/orders
                    /admin/sellers
                    etc.
                ========================================================= */}

                <Route element={<AdminRoute />}>

                    <Route
                        path="/admin"
                        element={<AdminLayout />}
                    >

                        {/* ------------------------------------------------
                            ADMIN DASHBOARD
                        ------------------------------------------------- */}

                        <Route
                            index
                            element={<Dashboard />}
                        />


                        {/* ------------------------------------------------
                            PRODUCTS
                        ------------------------------------------------- */}

                        <Route
                            path="products"
                            element={<ProductsAdmin />}
                        />

                        <Route
                            path="products/add"
                            element={<AddProduct />}
                        />

                        <Route
                            path="products/:id/edit"
                            element={<EditProduct />}
                        />

                        <Route
                            path="products/:id/variants"
                            element={<ProductVariants />}
                        />


                        {/* ------------------------------------------------
                            INVENTORY
                        ------------------------------------------------- */}

                        <Route
                            path="inventory"
                            element={<InventoryAdmin />}
                        />


                        {/* ------------------------------------------------
                            CATEGORIES
                        ------------------------------------------------- */}

                        <Route
                            path="categories"
                            element={<CategoriesAdmin />}
                        />


                        {/* ------------------------------------------------
                            SELLERS
                        ------------------------------------------------- */}

                        <Route
                            path="sellers"
                            element={<SellersAdmin />}
                        />


                        {/* ------------------------------------------------
                            CUSTOMERS
                        ------------------------------------------------- */}

                        <Route
                            path="customers"
                            element={<CustomersAdmin />}
                        />


                        {/* ------------------------------------------------
                            ORDERS
                        ------------------------------------------------- */}

                        <Route
                            path="orders"
                            element={<OrdersAdmin />}
                        />


                        {/* ------------------------------------------------
                            PROMOTIONS
                        ------------------------------------------------- */}

                        <Route
                            path="promotions"
                            element={<PromotionsAdmin />}
                        />


                        {/* ------------------------------------------------
                            REVIEWS
                        ------------------------------------------------- */}

                        <Route
                            path="reviews"
                            element={<ReviewsAdmin />}
                        />


                        {/* ------------------------------------------------
                            NOTIFICATIONS
                        ------------------------------------------------- */}

                        <Route
                            path="notifications"
                            element={<NotificationsAdmin />}
                        />


                        {/* ------------------------------------------------
                            REPORTS
                        ------------------------------------------------- */}

                        <Route
                            path="reports"
                            element={<ReportsAdmin />}
                        />


                        {/* ------------------------------------------------
                            STORE SETTINGS
                        ------------------------------------------------- */}

                        <Route
                            path="settings"
                            element={<SettingsAdmin />}
                        />

                    </Route>

                </Route>


                {/* ========================================================
                    FALLBACK
                ========================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
