import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import '../styles/Navbar.css';

/**
 * Composant de navigation principal (barre de navigation).
 * Gère l'affichage dynamique des liens selon l'état d'authentification (visiteur, client, admin)
 * et le nombre d'articles dans le panier.
 */
export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const { totalItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Gère la déconnexion de l'utilisateur.
   * Vide la session, redirige vers l'accueil et ferme le menu mobile.
   */
  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">🎲</span>
          <span className="navbar-title">BoardGame Shop</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Catalog
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className="navbar-link cart-link" onClick={() => setMenuOpen(false)}>
                🛒 Cart
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
              <Link to="/orders" className="navbar-link" onClick={() => setMenuOpen(false)}>
                My Orders
              </Link>
              {isAdmin && (
                <Link to="/admin" className="navbar-link navbar-admin" onClick={() => setMenuOpen(false)}>
                  ⚙️ Admin
                </Link>
              )}
              <div className="navbar-user">
                <span className="navbar-username">{user?.name}</span>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
