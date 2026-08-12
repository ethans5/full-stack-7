// ================================================
// services/bggService.js — BoardGameGeek API integration
// Queries the BGG XML API, converts to JSON
// ================================================

const axios = require('axios');
const xml2js = require('xml2js');

const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi2';

const BggService = {
  /**
   * Effectue une recherche sur l'API externe BoardGameGeek (BGG) pour trouver un jeu par son nom.
   * Parse la réponse XML en JSON et la formate en un tableau d'objets simplifiés.
   */
  async searchByName(query) {
    const config = {
      params: {
        query,
        type: 'boardgame',
      },
      headers: {},
    };

    if (process.env.BGG_API_TOKEN) {
      config.headers.Authorization = `Bearer ${process.env.BGG_API_TOKEN}`;
    }

    const response = await axios.get(`${BGG_API_BASE}/search`, config);

    const result = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      ignoreAttrs: false,
    });

    if (!result.items || !result.items.item) {
      return [];
    }

    // Normalize to array (BGG returns object if single result)
    const items = Array.isArray(result.items.item)
      ? result.items.item
      : [result.items.item];

    return items.map((item) => ({
      bgg_id: item.$.id,
      name: item.name?.$.value || 'Unknown',
      year_published: item.yearpublished?.$.value || null,
    }));
  },

  /**
   * Récupère toutes les données d'un jeu spécifique via son ID BGG (description, âge, durée, image, etc.).
   * Ces données structurées serviront au remplissage automatique du formulaire côté admin.
   */
  async getGameDetails(bggId) {
    const config = {
      params: {
        id: bggId,
        stats: 1,
      },
      headers: {},
    };

    if (process.env.BGG_API_TOKEN) {
      config.headers.Authorization = `Bearer ${process.env.BGG_API_TOKEN}`;
    }

    const response = await axios.get(`${BGG_API_BASE}/thing`, config);

    const result = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      ignoreAttrs: false,
    });

    const item = result.items?.item;
    if (!item) {
      const error = new Error('Game not found on BoardGameGeek');
      error.status = 404;
      throw error;
    }

    // Extract the primary name
    const names = Array.isArray(item.name) ? item.name : [item.name];
    const primaryName = names.find((n) => n.$.type === 'primary');

    // Extract categories, mechanics, subdomains & families from the BGG links
    const links = item.link ? (Array.isArray(item.link) ? item.link : [item.link]) : [];
    const relevantTypes = ['boardgamecategory', 'boardgamemechanic', 'boardgamesubdomain', 'boardgamefamily'];
    const categories = links
      .filter((link) => link && link.$ && relevantTypes.includes(link.$.type))
      .map((link) => link.$.value);

    return {
      title: primaryName?.$.value || 'Unknown',
      description: item.description || '',
      player_count: `${item.minplayers?.$.value || '?'}-${item.maxplayers?.$.value || '?'}`,
      min_age: parseInt(item.minage?.$.value) || null,
      play_duration: `${item.minplaytime?.$.value || '?'}-${item.maxplaytime?.$.value || '?'} min`,
      image_url: item.image || null,
      year_published: item.yearpublished?.$.value || null,
      bgg_rating: item.statistics?.ratings?.average?.$.value || null,
    };
  },

  /**
   * Importe un jeu complet (infos BGG + valeurs par défaut de la boutique) dans la base de données.
   * Met à jour les informations du jeu s'il existe déjà dans la base.
   * 
   * @param {number|string} bggId - L'identifiant unique BoardGameGeek du jeu
   * @param {object} dbConnection - La connexion ou le pool de connexion MySQL (mysql2)
   */
  async importGameToDB(bggId, dbConnection) {
    try {
      // 1. Récupération des détails complets du jeu depuis l'API BGG
      const gameDetails = await this.getGameDetails(bggId);

      // 2. Valeurs par défaut pour les champs spécifiques à la boutique
      const defaultPrice = 49.99;
      const defaultStock = 10;

      // 3. Requête d'insertion/mise à jour du jeu principal dans la table Games
      const query = `
        INSERT INTO Games (
          bgg_id, title, description, price, stock_quantity, 
          image_url, player_count, min_age, play_duration
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          image_url = VALUES(image_url),
          player_count = VALUES(player_count),
          min_age = VALUES(min_age),
          play_duration = VALUES(play_duration);
      `;

      // Execution du INSERT / UPDATE du jeu
      const [result] = await dbConnection.execute(query, [
        bggId,
        gameDetails.title,
        gameDetails.description,
        defaultPrice,
        defaultStock,
        gameDetails.image_url,
        gameDetails.player_count,
        gameDetails.min_age,
        gameDetails.play_duration
      ]);

      return {
        success: true,
        message: result.affectedRows === 1 ? 'Game inserted successfully' : 'Game updated successfully',
        gameData: gameDetails
      };

    } catch (error) {
      console.error(`[importGameToDB] Erreur lors de l'importation du jeu BGG ID ${bggId}:`, error.message);
      throw error;
    }
  }
};

module.exports = BggService;
