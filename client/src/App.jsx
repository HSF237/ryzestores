import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import ProtectedStaffRoute from './components/ProtectedStaffRoute'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'
import StaffGateway from './pages/StaffGateway'
import StaffDashboard from './pages/StaffDashboard'
import Seeder from './pages/Seeder'

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            {/* Store */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-success" element={<OrderSuccess />} />
            </Route>
            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Staff (hidden) — protected routes: staff/admin only */}
            <Route path="/staff-gateway" element={<StaffGateway />} />
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedStaffRoute>
                  <StaffDashboard />
                </ProtectedStaffRoute>
              }
            />
            {/* Database Seeder — staff/admin only */}
            <Route
              path="/seeder"
              element={
                <ProtectedStaffRoute>
                  <Seeder />
                </ProtectedStaffRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  )
}
