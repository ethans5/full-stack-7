import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import OrderDetailModal from '../components/OrderDetailModal';
import '../styles/OrderHistory.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Composant affichant l'historique des commandes de l'utilisateur connecté.
 * Affiche chaque commande avec sa date, son statut, son total et les jeux achetés.
 */
export default function OrderHistory() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data.data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  /**
   * Retourne la classe CSS correspondante au badge de statut d'une commande.
   */
  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      paid: 'badge-success',
      shipped: 'badge-info',
    };
    return map[status] || 'badge-warning';
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="orders-page page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state fade-in">
            <span className="empty-icon">📦</span>
            <h2>No orders yet</h2>
            <p>Start shopping to see your orders here!</p>
            <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }}>
              Browse Games
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card glass fade-in">
                <div className="order-header">
                  <div>
                    <span className="order-id">Order #{order.user_order_number || order.id}</span>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="order-header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="order-total">€{Number(order.total_price).toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items?.map((item) => (
                    <div key={item.id} className="order-item">
                      <Link to={`/games/${item.game_id}`} className="order-item-name">
                        {item.title}
                      </Link>
                      <span className="order-item-qty">x{item.quantity}</span>
                      <span className="order-item-price">
                        €{(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    🔍 View Invoice Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de détail d'une commande */}
        {selectedOrderId && (
          <OrderDetailModal
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
          />
        )}
      </div>
    </div>
  );
}
