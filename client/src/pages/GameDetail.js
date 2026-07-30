import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import './GameDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function GameDetail() {
  const { id } = useParams();
  const { addItem } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`${API_URL}/games/${id}`);
        if (response.ok) {
          const data = await response.json();
          setGame(data.data.game);
        }
      } catch (error) {
        console.error('Failed to fetch game:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [id]);

  const handleAddToCart = () => {
    if (game) {
      addItem(game, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (!game) {
    return (
      <div className="page container">
        <div className="empty-state">
          <h2>Game not found</h2>
          <Link to="/" className="btn btn-primary">Back to Catalog</Link>
        </div>
      </div>
    );
  }

  const imageUrl = game.image_url ? `${API_BASE}${game.image_url}` : null;

  return (
    <div className="game-detail-page page">
      <div className="container">
        <Link to="/" className="back-link">← Back to Catalog</Link>

        <div className="game-detail glass fade-in">
          <div className="game-detail-image-section">
            {imageUrl ? (
              <img src={imageUrl} alt={game.title} className="game-detail-image" />
            ) : (
              <div className="game-detail-placeholder">🎲</div>
            )}
          </div>

          <div className="game-detail-info">
            <h1 className="game-detail-title">{game.title}</h1>

            {game.categories && game.categories.length > 0 && (
              <div className="game-detail-categories">
                {game.categories.map((cat) => (
                  <span key={cat.id} className="badge badge-info">{cat.name}</span>
                ))}
              </div>
            )}

            <div className="game-detail-meta">
              {game.player_count && (
                <div className="meta-item">
                  <span className="meta-icon">👥</span>
                  <span className="meta-label">Players</span>
                  <span className="meta-value">{game.player_count}</span>
                </div>
              )}
              {game.min_age && (
                <div className="meta-item">
                  <span className="meta-icon">🎂</span>
                  <span className="meta-label">Min Age</span>
                  <span className="meta-value">{game.min_age}+</span>
                </div>
              )}
              {game.play_duration && (
                <div className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  <span className="meta-label">Duration</span>
                  <span className="meta-value">{game.play_duration}</span>
                </div>
              )}
            </div>

            {game.description && (
              <div className="game-detail-description">
                <h2>Description</h2>
                <p>{game.description}</p>
              </div>
            )}

            <div className="game-detail-actions">
              <div className="game-detail-price">
                €{Number(game.price).toFixed(2)}
              </div>

              {game.stock_quantity > 0 ? (
                <div className="game-detail-cart">
                  <div className="quantity-selector">
                    <button
                      className="quantity-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >−</button>
                    <span className="quantity-value">{quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => setQuantity(Math.min(game.stock_quantity, quantity + 1))}
                    >+</button>
                  </div>

                  {isAuthenticated ? (
                    <button
                      className={`btn btn-lg ${addedToCart ? 'btn-success' : 'btn-primary'}`}
                      onClick={handleAddToCart}
                    >
                      {addedToCart ? '✓ Added!' : '🛒 Add to Cart'}
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-primary btn-lg">
                      Login to Buy
                    </Link>
                  )}

                  <span className="stock-info">{game.stock_quantity} in stock</span>
                </div>
              ) : (
                <div className="out-of-stock-banner">Out of Stock</div>
              )}
            </div>

            {game.rules_pdf_url && (
              <a
                href={`${API_BASE}${game.rules_pdf_url}`}
                className="btn btn-secondary rules-download"
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                📄 Download Rules (PDF)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
