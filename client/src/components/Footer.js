import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <span className="footer-logo">🎲</span>
          <span className="footer-title">BoardGame Shop</span>
        </div>
        <p className="footer-text">
          © {new Date().getFullYear()} BoardGame Shop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
