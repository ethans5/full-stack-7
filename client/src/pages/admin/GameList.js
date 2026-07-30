import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './GameList.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function GameList() {
  const { token } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${API_URL}/games`);
      if (response.ok) {
        const data = await response.json();
        setGames(data.data.games);
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gameId, gameTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${gameTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/games/${gameId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Pessimistic update: only remove from state after server confirms
        setGames((prev) => prev.filter((g) => g.id !== gameId));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete game.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="admin-games page">
      <div className="container">
        <div className="admin-header">
          <h1 className="page-title">Manage Games</h1>
          <Link to="/admin/games/new" className="btn btn-primary">
            + Add New Game
          </Link>
        </div>

        {games.length === 0 ? (
          <div className="empty-state fade-in">
            <span className="empty-icon">🎲</span>
            <h2>No games in catalog</h2>
            <p>Create your first game to get started!</p>
          </div>
        ) : (
          <div className="admin-table-wrapper glass fade-in">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Players</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td>
                      <div className="admin-game-thumb">
                        {game.image_url ? (
                          <img src={`${API_BASE}${game.image_url}`} alt={game.title} />
                        ) : (
                          <span>🎲</span>
                        )}
                      </div>
                    </td>
                    <td className="admin-game-title">{game.title}</td>
                    <td>€{Number(game.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${game.stock_quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {game.stock_quantity}
                      </span>
                    </td>
                    <td>{game.player_count || '—'}</td>
                    <td>
                      <div className="admin-actions">
                        <Link to={`/admin/games/${game.id}/edit`} className="btn btn-secondary btn-sm">
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(game.id, game.title)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
