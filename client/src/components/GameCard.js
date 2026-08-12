import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/GameCard.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

/**
 * Composant affichant une carte individuelle pour un jeu de société.
 * Présente l'image, le titre, les caractéristiques (joueurs, âge, durée), le prix et le stock.
 * Cliquable pour rediriger vers la page de détails du jeu.
 */
export default function GameCard({ game }) {
  const imageUrl = game.image_url
    ? (game.image_url.startsWith('http') ? game.image_url : `${API_BASE}${game.image_url}`)
    : null;

  return (
    <Link to={`/games/${game.id}`} className="game-card glass fade-in">
      <div className="game-card-image-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt={game.title} className="game-card-image" />
        ) : (
          <div className="game-card-placeholder">🎲</div>
        )}
        {game.stock_quantity <= 0 && (
          <div className="game-card-out-of-stock">Out of Stock</div>
        )}
      </div>

      <div className="game-card-content">
        <h3 className="game-card-title">{game.title}</h3>

        <div className="game-card-meta">
          {game.player_count && (
            <span className="game-card-tag">👥 {game.player_count}</span>
          )}
          {game.min_age && (
            <span className="game-card-tag">🎂 {game.min_age}+</span>
          )}
          {game.play_duration && (
            <span className="game-card-tag">⏱️ {game.play_duration}</span>
          )}
        </div>

        <div className="game-card-footer">
          <span className="game-card-price">€{Number(game.price).toFixed(2)}</span>
          {game.stock_quantity > 0 && (
            <span className="game-card-stock">{game.stock_quantity} in stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
