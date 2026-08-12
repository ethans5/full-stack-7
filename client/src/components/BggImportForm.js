import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Composant d'administration BggImportForm
 * Permet aux administrateurs d'importer directement un jeu depuis BoardGameGeek
 * vers la base de données MySQL via son BGG ID.
 */
export default function BggImportForm({ onImportSuccess }) {
  const { token } = useAuth();
  const [bggId, setBggId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

  /**
   * Envoie une requête POST vers l'API d'importation BGG
   */
  const handleImport = async (e) => {
    e.preventDefault();

    if (!bggId.trim()) {
      setStatusMessage({ type: 'error', text: 'Veuillez saisir un BGG ID valide.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      // Requête HTTP POST avec Axios en envoyant le Token JWT d'administration dans les headers
      const response = await axios.post(
        `${API_URL}/bgg/import`,
        { bggId: bggId.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const gameTitle = response.data.data?.gameData?.title || 'Le jeu';
        const msg = `✅ ${gameTitle} (BGG ID: ${bggId}) a été importé avec succès avec ses catégories !`;
        
        setStatusMessage({ type: 'success', text: msg });
        setBggId('');

        // Optionnel : Déclencher un callback parent si fourni (ex: recharger la liste des jeux)
        if (onImportSuccess) {
          onImportSuccess(response.data.data);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l’importation BGG :', error);
      const errorMsg =
        error.response?.data?.message ||
        'Une erreur est survenue lors de l’importation du jeu depuis BoardGameGeek.';

      setStatusMessage({ type: 'error', text: `❌ ${errorMsg}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bgg-import-form glass fade-in" style={{ padding: '1.5rem', borderRadius: '12rem', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📥 Importer un jeu depuis BoardGameGeek
      </h2>

      <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="number"
            className="input"
            placeholder="Entrez le BGG ID (ex: 13 pour Catan, 133473 pour Codenames)..."
            value={bggId}
            onChange={(e) => setBggId(e.target.value)}
            disabled={isLoading}
            style={{ flex: 1 }}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !bggId.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            {isLoading ? 'Importation en cours...' : '📦 Importer le jeu'}
          </button>
        </div>

        {/* Affichage du message de succès ou d'erreur */}
        {statusMessage && (
          <div
            className={`message message-${statusMessage.type === 'success' ? 'success' : 'error'}`}
            style={{ marginTop: '0.5rem' }}
          >
            {statusMessage.text}
          </div>
        )}
      </form>
    </div>
  );
}
