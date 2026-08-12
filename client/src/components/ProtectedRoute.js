import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Composant de protection de route basique.
 * Empêche l'accès aux pages nécessitant une authentification (ex: Panier, Commandes)
 * en redirigeant vers la page de connexion si l'utilisateur n'est pas connecté.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
