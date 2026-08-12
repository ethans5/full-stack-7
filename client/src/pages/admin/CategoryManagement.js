import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Page d'administration pour la gestion complète des catégories de jeux (CRUD).
 * Permet d'afficher, créer, modifier (renommer) et supprimer des catégories.
 */
export default function CategoryManagement() {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // État du formulaire d'ajout
  const [newCategoryName, setNewCategoryName] = useState('');
  const [adding, setAdding] = useState(false);

  // État de l'édition d'une catégorie
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Charger les catégories au chargement du composant
  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Récupère toutes les catégories depuis l'API.
   */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      if (response.ok) {
        setCategories(data.data.categories || []);
      } else {
        setError(data.message || 'Failed to fetch categories.');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Créer une nouvelle catégorie (POST /api/categories)
   */
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Category "${data.data.category.name}" created successfully!`);
        setNewCategoryName('');
        fetchCategories();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to create category.');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Error connecting to the server.');
    } finally {
      setAdding(false);
    }
  };

  /**
   * Démarrer le mode édition pour une catégorie
   */
  const startEditing = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setError(null);
    setSuccess(null);
  };

  /**
   * Annuler le mode édition
   */
  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  /**
   * Mettre à jour (renommer) une catégorie (PUT /api/categories/:id)
   */
  const handleUpdateCategory = async (id) => {
    if (!editingName.trim()) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Category updated to "${data.data.category.name}" successfully!`);
        setEditingId(null);
        setEditingName('');
        fetchCategories();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to update category.');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Error connecting to the server.');
    }
  };

  /**
   * Supprimer une catégorie (DELETE /api/categories/:id)
   */
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Category "${name}" deleted successfully!`);
        fetchCategories();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to delete category.');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Error connecting to the server.');
    }
  };

  return (
    <div className="page admin-categories">
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <Link to="/admin" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
              ← Back to Dashboard
            </Link>
            <h1 className="page-title" style={{ margin: '0.5rem 0 0 0' }}>Category Management</h1>
          </div>
        </div>

        {/* Notifications */}
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}

        {/* Formulaire de création */}
        <div className="glass fade-in" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ➕ Create New Category
          </h2>
          <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              className="input"
              placeholder="Category name (e.g. Deck-Building, Horror...)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={adding}
              style={{ flex: 1 }}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={adding || !newCategoryName.trim()}>
              {adding ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* Liste des catégories */}
        <div className="glass fade-in" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏷️ Existing Categories ({categories.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading categories...</div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              No categories found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {editingId === cat.id ? (
                    /* Formulaire de modification d'une catégorie */
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem' }}>
                      <input
                        type="text"
                        className="input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        style={{ flex: 1 }}
                        autoFocus
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateCategory(cat.id)}
                        disabled={!editingName.trim()}
                      >
                        Save
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelEditing}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    /* Affichage normal de la catégorie */
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ opacity: 0.6, fontSize: '0.85rem', width: '30px' }}>#{cat.id}</span>
                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>{cat.name}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEditing(cat)}
                          title="Rename category"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          title="Delete category"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
