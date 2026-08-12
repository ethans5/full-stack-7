import React from 'react';
import '../styles/Footer.css';

/**
 * Composant représentant le pied de page (footer) de l'application.
 * Affiche le logo, le nom du site et les droits d'auteur avec l'année en cours.
 */
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
