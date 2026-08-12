import React, { useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CartContext } from '../context/CartContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Composant affiché suite à un paiement réussi sur Stripe.
 * Remercie l'utilisateur et propose de retourner à l'accueil ou à l'historique.
 */
export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { token } = useAuth();
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    // Clear cart immediately on successful checkout page
    if (clearCart) {
      clearCart();
    }

    // Confirm session with backend to mark order as paid
    if (sessionId && token) {
      fetch(`${API_URL}/orders/confirm-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log('✅ Order confirmed and marked as paid!');
          }
        })
        .catch((err) => console.error('Error confirming session:', err));
    }
  }, [sessionId, token, clearCart]);

  return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="fade-in">
          <span style={{ fontSize: '5rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Payment Successful!</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Thank you for your order! Your payment has been processed successfully.
            You'll receive a confirmation shortly.
          </p>
          {sessionId && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '2rem' }}>
              Session: {sessionId}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/orders" className="btn btn-primary btn-lg">View My Orders</Link>
            <Link to="/" className="btn btn-secondary btn-lg">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
