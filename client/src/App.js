import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public pages
import Home from './pages/Home';
import GameDetail from './pages/GameDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected pages (Client)
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import GameList from './pages/admin/GameList';
import GameForm from './pages/admin/GameForm';
import OrderManagement from './pages/admin/OrderManagement';
import CategoryManagement from './pages/admin/CategoryManagement';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/games/:id" element={<GameDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes (authenticated users) */}
                <Route path="/cart" element={
                  <ProtectedRoute><Cart /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute><OrderHistory /></ProtectedRoute>
                } />
                <Route path="/checkout/success" element={
                  <ProtectedRoute><CheckoutSuccess /></ProtectedRoute>
                } />
                <Route path="/checkout/cancel" element={
                  <ProtectedRoute><CheckoutCancel /></ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/admin" element={
                  <AdminRoute><Dashboard /></AdminRoute>
                } />
                <Route path="/admin/games" element={
                  <AdminRoute><GameList /></AdminRoute>
                } />
                <Route path="/admin/games/new" element={
                  <AdminRoute><GameForm /></AdminRoute>
                } />
                <Route path="/admin/games/:id/edit" element={
                  <AdminRoute><GameForm /></AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute><OrderManagement /></AdminRoute>
                } />
                <Route path="/admin/categories" element={
                  <AdminRoute><CategoryManagement /></AdminRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
