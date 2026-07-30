import React from 'react';
import { Link } from 'react-router-dom';

export default function CheckoutCancel() {
  return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="fade-in">
          <span style={{ fontSize: '5rem', display: 'block', marginBottom: '1rem' }}>😔</span>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Payment Cancelled</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Your payment was cancelled. No charges were made. Your cart items are still saved.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/cart" className="btn btn-primary btn-lg">Return to Cart</Link>
            <Link to="/" className="btn btn-secondary btn-lg">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
