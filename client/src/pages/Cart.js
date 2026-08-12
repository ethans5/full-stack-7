import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/Cart.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

/**
 * Composant représentant la page du panier de l'utilisateur.
 * Affiche la liste des articles, permet de modifier les quantités, 
 * de retirer des articles et de procéder au paiement (checkout).
 */
export default function Cart() {
  const { items, totalPrice, updateQuantity, removeItem, checkout } = useContext(CartContext);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  /**
   * Gère la validation du panier.
   * Appelle le CartContext pour créer la commande côté serveur
   * puis redirige l'utilisateur vers Stripe pour le paiement.
   */
  const handleCheckout = async () => {
    setError('');
    setLoading(true);

    const result = await checkout();

    if (result.success) {
      // Redirect to Stripe Checkout
      window.location.href = result.checkout_url;
    } else {
      setError(result.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state fade-in">
          <span className="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Browse our catalog and add some games!</p>
          <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }}>
            Browse Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>

        {error && <div className="message message-error">{error}</div>}

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.game_id} className="cart-item glass fade-in">
                <div className="cart-item-image-wrapper">
                  {item.image_url ? (
                    <img
                      src={item.image_url.startsWith('http') ? item.image_url : `${API_BASE}${item.image_url}`}
                      alt={item.title}
                      className="cart-item-image"
                    />
                  ) : (
                    <div className="cart-item-placeholder">🎲</div>
                  )}
                </div>

                <div className="cart-item-info">
                  <Link to={`/games/${item.game_id}`} className="cart-item-title">
                    {item.title}
                  </Link>
                  <span className="cart-item-unit-price">
                    €{Number(item.price).toFixed(2)} each
                  </span>
                </div>

                <div className="cart-item-quantity">
                  <div className="quantity-selector">
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.game_id, item.quantity - 1)}
                    >−</button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.game_id, item.quantity + 1)}
                    >+</button>
                  </div>
                </div>

                <div className="cart-item-total">
                  €{(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  className="cart-item-remove"
                  onClick={() => removeItem(item.game_id)}
                  aria-label={`Remove ${item.title}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary glass fade-in">
            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Items ({items.length})</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg cart-checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : '💳 Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
