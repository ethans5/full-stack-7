import React, { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import '../styles/Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Composant de la page d'accueil (Home).
 * Affiche le catalogue de jeux avec un système de filtres (recherche textuelle, catégorie, tris).
 * Gère le chargement asynchrone des données depuis l'API.
 */
export default function Home() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

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

  // Fetch games when filters change
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory) params.append('category_id', selectedCategory);
        params.append('sort_by', sortBy);
        params.append('sort_order', sortOrder);

        const response = await fetch(`${API_URL}/games?${params}`);
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

    // Debounce search
    const timer = setTimeout(fetchGames, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, sortBy, sortOrder]);

  return (
    <div className="home-page page">
      <div className="container">
        {/* Hero section */}
        <div className="hero fade-in">
          <h1 className="hero-title">
            Discover Amazing <span className="hero-accent">Board Games</span>
          </h1>
          <p className="hero-subtitle">
            Explore our collection of strategy, family, party, and expert board games.
          </p>
        </div>

        {/* Filters */}
        <div className="filters glass fade-in">
          <div className="filter-search">
            <input
              type="text"
              className="input"
              placeholder="🔍 Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-games"
            />
          </div>

          <div className="filter-group">
            <select
              className="input filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              id="filter-category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              className="input filter-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              id="filter-sort"
            >
              <option value="created_at-DESC">Newest First</option>
              <option value="created_at-ASC">Oldest First</option>
              <option value="price-ASC">Price: Low → High</option>
              <option value="price-DESC">Price: High → Low</option>
              <option value="title-ASC">Name: A → Z</option>
              <option value="title-DESC">Name: Z → A</option>
            </select>
          </div>
        </div>

        {/* Games grid */}
        {loading ? (
          <div className="spinner"></div>
        ) : games.length === 0 ? (
          <div className="empty-state fade-in">
            <span className="empty-icon">🎲</span>
            <h2>No games found</h2>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="games-grid">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
