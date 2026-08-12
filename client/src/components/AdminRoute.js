import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Composant de protection de route réservé aux administrateurs.
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté,
 * ou vers la page d'accueil s'il est connecté mais n'a pas le rôle admin.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
