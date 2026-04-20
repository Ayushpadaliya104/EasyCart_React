import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryProvider } from './context/QueryContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { WalletProvider } from './context/WalletContext';

// User Pages
import Homepage from './pages/user/Homepage';
import ProductListing from './pages/user/ProductListing';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';
import OrderTracking from './pages/user/OrderTracking';
import ReturnHistory from './pages/user/ReturnHistory';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';
import Wishlist from './pages/user/Wishlist';
import UserProfile from './pages/user/UserProfile';
import QuerySupport from './pages/user/QuerySupport';
import Wallet from './pages/user/Wallet';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ReturnManagement from './pages/admin/ReturnManagement';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import AdminSettings from './pages/admin/AdminSettings';
import QueryManagement from './pages/admin/QueryManagement';

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <StoreSettingsProvider>
              <WalletProvider>
                <QueryProvider>
                  <Routes>
                {/* User Routes */}
                <Route path="/" element={<Homepage />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/order/:id/track" element={<OrderTracking />} />
                <Route path="/returns" element={<ReturnHistory />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/queries" element={<QuerySupport />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><ProductManagement /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><CategoryManagement /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><OrderManagement /></AdminRoute>} />
                <Route path="/admin/returns" element={<AdminRoute><ReturnManagement /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                <Route path="/admin/queries" element={<AdminRoute><QueryManagement /></AdminRoute>} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </QueryProvider>
              </WalletProvider>
            </StoreSettingsProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
