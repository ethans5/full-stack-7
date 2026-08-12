import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook personnalisé facilitant l'accès au contexte d'authentification (AuthContext).
 * Permet aux composants d'utiliser `useAuth()` au lieu de `useContext(AuthContext)`.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
