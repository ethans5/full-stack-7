import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/OrderManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Composant de gestion globale des commandes pour les administrateurs.
 * Permet de visualiser toutes les commandes de la plateforme,
 * de les filtrer par statut et de modifier leur statut d'avancement.
 */
export default function OrderManagement() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  /**
   * Récupère la liste des commandes en appliquant un éventuel filtre de statut.
   */
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await fetch(`${API_URL}/orders${params}`, {
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

  /**
   * Met à jour le statut d'une commande via un appel API
   * et met à jour l'interface en cas de succès.
   */
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Pessimistic update: only update state after server confirms
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update status.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  /**
   * Retourne la classe CSS correspondante au badge de statut.
   */
  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      paid: 'badge-success',
      shipped: 'badge-info',
    };
    return map[status] || 'badge-warning';
  };

  return (
    <div className="admin-orders page">
      <div className="container">
        <div className="admin-header">
          <h1 className="page-title">Manage Orders</h1>
          <select
            className="input"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="filter-order-status"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : orders.length === 0 ? (
          <div className="empty-state fade-in">
            <span className="empty-icon">📦</span>
            <h2>No orders found</h2>
          </div>
        ) : (
          <div className="admin-orders-list">
            {orders.map((order) => (
              <div key={order.id} className="admin-order-card glass fade-in">
                <div className="admin-order-header">
                  <div>
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="admin-order-meta">
                    <span className="order-customer">
                      {order.user_name} ({order.user_email})
                    </span>
                    <span className="order-total">€{Number(order.total_price).toFixed(2)}</span>
                  </div>
                </div>

                <div className="admin-order-items">
                  {order.items?.map((item) => (
                    <div key={item.id} className="order-item">
                      <span className="order-item-name">{item.title}</span>
                      <span className="order-item-qty">x{item.quantity}</span>
                      <span className="order-item-price">
                        €{(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="admin-order-footer">
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                  <div className="admin-status-actions">
                    {order.status === 'pending' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleStatusUpdate(order.id, 'paid')}
                      >
                        Mark as Paid
                      </button>
                    )}
                    {order.status === 'paid' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                      >
                        Mark as Shipped
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
