import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Composant Modal pour afficher les détails complets d'une commande via GET /api/orders/:id.
 * Affiche la facture détaillée avec la liste des articles, prix unitaires, statut et infos client.
 */
export default function OrderDetailModal({ orderId, onClose }) {
  const { token, isAdmin } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.ok) {
          setOrder(data.data.order);
        } else {
          setError(data.message || 'Failed to load order details.');
        }
      } catch (err) {
        console.error('Error fetching order detail:', err);
        setError('Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, token]);

  if (!orderId) return null;

  return (
    <div
      className="modal-overlay fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content glass"
        style={{
          background: 'var(--color-bg-card, #1e293b)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '650px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          color: '#fff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>Loading invoice details...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="message message-error">{error}</p>
            <button className="btn btn-secondary" onClick={onClose} style={{ marginTop: '1rem' }}>
              Close
            </button>
          </div>
        ) : order ? (
          <div>
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                  Invoice Details #{order.user_order_number || order.id}
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.7, fontSize: '0.85rem' }}>
                  Date: {new Date(order.created_at).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onClose}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Customer Info (Admin only) */}
            {isAdmin && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <div><strong>Customer Name:</strong> {order.user_name}</div>
                <div><strong>Customer Email:</strong> {order.user_email}</div>
                {order.stripe_session_id && (
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>
                    <strong>Stripe Session ID:</strong> {order.stripe_session_id}
                  </div>
                )}
              </div>
            )}

            {/* Order Items Table */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Purchased Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {item.image_url && (
                      <img
                        src={item.image_url.startsWith('http') ? item.image_url : `${API_URL.replace('/api', '')}${item.image_url}`}
                        alt={item.title}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                        €{Number(item.unit_price).toFixed(2)} x {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    €{(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & Status */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '1rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Status: </span>
                <span
                  className={`badge ${
                    order.status === 'paid'
                      ? 'badge-success'
                      : order.status === 'shipped'
                      ? 'badge-info'
                      : 'badge-warning'
                  }`}
                >
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Paid: </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary, #6366f1)' }}>
                  €{Number(order.total_price).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer button */}
            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Close Details
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
