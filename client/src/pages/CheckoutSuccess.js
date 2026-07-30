import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

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
