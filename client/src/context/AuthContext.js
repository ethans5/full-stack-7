import React, { createContext, useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthContext = createContext(null);

/**
 * Fournisseur de contexte pour l'authentification.
 * Englobe l'application pour fournir l'état global de l'utilisateur (connecté, admin, etc.)
 * et les méthodes d'authentification à tous les composants enfants.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  /**
   * Récupère le profil de l'utilisateur depuis l'API si un token est présent en session.
   * Valide ainsi que le token n'est pas expiré et met à jour l'état de l'utilisateur.
   */
  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        // Token is invalid or expired
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Tente de connecter un utilisateur avec son email et mot de passe.
   * En cas de succès, stocke le token en session et met à jour l'état.
   */
  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem('token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      return { success: true };
    }

    return { success: false, message: data.message };
  };

  /**
   * Inscrit un nouvel utilisateur via l'API.
   * En cas de succès, connecte automatiquement l'utilisateur (stockage du token).
   */
  const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem('token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      return { success: true };
    }

    return { success: false, message: data.message };
  };

  /**
   * Déconnecte l'utilisateur courant.
   * Supprime le token de la session et réinitialise les états de contexte.
   */
  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
