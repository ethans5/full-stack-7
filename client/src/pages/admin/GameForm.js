import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './GameForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function GameForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // BGG search
  const [bggQuery, setBggQuery] = useState('');
  const [bggResults, setBggResults] = useState([]);
  const [bggLoading, setBggLoading] = useState(false);

  // Form data
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stock_quantity: '',
    player_count: '',
    min_age: '',
    play_duration: '',
    category_ids: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch game data if editing
  useEffect(() => {
    if (!isEditing) return;

    const fetchGame = async () => {
      try {
        const response = await fetch(`${API_URL}/games/${id}`);
        if (response.ok) {
          const data = await response.json();
          const game = data.data.game;
          setForm({
            title: game.title || '',
            description: game.description || '',
            price: game.price || '',
            stock_quantity: game.stock_quantity || '',
            player_count: game.player_count || '',
            min_age: game.min_age || '',
            play_duration: game.play_duration || '',
            category_ids: game.categories?.map((c) => c.id) || [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch game:', error);
      }
    };
    fetchGame();
  }, [id, isEditing]);

  // BGG Search
  const handleBggSearch = async () => {
    if (!bggQuery.trim()) return;
    setBggLoading(true);
    setBggResults([]);

    try {
      const response = await fetch(
        `${API_URL}/bgg/search?query=${encodeURIComponent(bggQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setBggResults(data.data.results.slice(0, 10));
      }
    } catch (error) {
      console.error('BGG search failed:', error);
    } finally {
      setBggLoading(false);
    }
  };

  // BGG Auto-fill
  const handleBggSelect = async (bggId) => {
    setBggLoading(true);
    try {
      const response = await fetch(`${API_URL}/bgg/game/${bggId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const game = data.data.game;

        setForm((prev) => ({
          ...prev,
          title: game.title || prev.title,
          description: game.description || prev.description,
          player_count: game.player_count || prev.player_count,
          min_age: game.min_age || prev.min_age,
          play_duration: game.play_duration || prev.play_duration,
        }));

        setBggResults([]);
        setBggQuery('');
        setSuccess('Game info auto-filled from BoardGameGeek!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('BGG details failed:', error);
    } finally {
      setBggLoading(false);
    }
  };

  const handleCategoryToggle = (catId) => {
    setForm((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(catId)
        ? prev.category_ids.filter((id) => id !== catId)
        : [...prev.category_ids, catId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('stock_quantity', form.stock_quantity);
    formData.append('player_count', form.player_count);
    formData.append('min_age', form.min_age);
    formData.append('play_duration', form.play_duration);
    formData.append('category_ids', JSON.stringify(form.category_ids));

    if (imageFile) formData.append('image', imageFile);
    if (pdfFile) formData.append('rules_pdf', pdfFile);

    try {
      const url = isEditing ? `${API_URL}/games/${id}` : `${API_URL}/games`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        navigate('/admin/games');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save game.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-form-page page">
      <div className="container">
        <Link to="/admin/games" className="back-link">← Back to Games</Link>
        <h1 className="page-title">{isEditing ? 'Edit Game' : 'Add New Game'}</h1>

        {/* BGG Auto-fill */}
        <div className="bgg-section glass fade-in">
          <h2 className="bgg-title">🔍 Auto-fill from BoardGameGeek</h2>
          <div className="bgg-search">
            <input
              type="text"
              className="input"
              placeholder="Search BGG by game name..."
              value={bggQuery}
              onChange={(e) => setBggQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBggSearch()}
              id="bgg-search-input"
            />
            <button
              className="btn btn-secondary"
              onClick={handleBggSearch}
              disabled={bggLoading}
            >
              {bggLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {bggResults.length > 0 && (
            <div className="bgg-results">
              {bggResults.map((result) => (
                <button
                  key={result.bgg_id}
                  className="bgg-result-item"
                  onClick={() => handleBggSelect(result.bgg_id)}
                >
                  <span className="bgg-result-name">{result.name}</span>
                  {result.year_published && (
                    <span className="bgg-result-year">({result.year_published})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}

        {/* Game Form */}
        <form onSubmit={handleSubmit} className="game-form glass fade-in">
          <div className="form-grid">
            <div className="form-group form-col-2">
              <label htmlFor="game-title" className="form-label">Title *</label>
              <input
                id="game-title"
                type="text"
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="game-price" className="form-label">Price (€) *</label>
              <input
                id="game-price"
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="game-stock" className="form-label">Stock Quantity</label>
              <input
                id="game-stock"
                type="number"
                min="0"
                className="input"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="game-players" className="form-label">Player Count</label>
              <input
                id="game-players"
                type="text"
                className="input"
                placeholder="e.g. 2-4"
                value={form.player_count}
                onChange={(e) => setForm({ ...form, player_count: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="game-age" className="form-label">Min Age</label>
              <input
                id="game-age"
                type="number"
                min="0"
                className="input"
                value={form.min_age}
                onChange={(e) => setForm({ ...form, min_age: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="game-duration" className="form-label">Play Duration</label>
              <input
                id="game-duration"
                type="text"
                className="input"
                placeholder="e.g. 30-60 min"
                value={form.play_duration}
                onChange={(e) => setForm({ ...form, play_duration: e.target.value })}
              />
            </div>

            <div className="form-group form-col-2">
              <label htmlFor="game-description" className="form-label">Description</label>
              <textarea
                id="game-description"
                className="input"
                rows="4"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Categories */}
            <div className="form-group form-col-2">
              <label className="form-label">Categories</label>
              <div className="category-checkboxes">
                {categories.map((cat) => (
                  <label key={cat.id} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={form.category_ids.includes(cat.id)}
                      onChange={() => handleCategoryToggle(cat.id)}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* File uploads */}
            <div className="form-group">
              <label htmlFor="game-image" className="form-label">Box Image (JPEG/PNG)</label>
              <input
                id="game-image"
                type="file"
                className="input file-input"
                accept="image/jpeg,image/png"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>

            <div className="form-group">
              <label htmlFor="game-pdf" className="form-label">Rules PDF</label>
              <input
                id="game-pdf"
                type="file"
                className="input file-input"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : isEditing ? 'Update Game' : 'Create Game'
              }
            </button>
            <Link to="/admin/games" className="btn btn-secondary btn-lg">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
