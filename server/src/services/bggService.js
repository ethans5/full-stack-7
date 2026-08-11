// ================================================
// services/bggService.js — BoardGameGeek API integration
// Queries the BGG XML API, converts to JSON
// ================================================

const axios = require('axios');
const xml2js = require('xml2js');

const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi2';

const BggService = {
  /**
   * Search for a board game by name on BGG
   * Returns a list of matching games with basic info
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
   * Get detailed game info from BGG by its BGG ID
   * Returns structured data to auto-fill the admin game form
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

    // Extract categories from the BGG links
    const links = Array.isArray(item.link) ? item.link : [item.link];
    const categories = links
      .filter((link) => link.$.type === 'boardgamecategory')
      .map((link) => link.$.value);

    return {
      title: primaryName?.$.value || 'Unknown',
      description: item.description || '',
      player_count: `${item.minplayers?.$.value || '?'}-${item.maxplayers?.$.value || '?'}`,
      min_age: parseInt(item.minage?.$.value) || null,
      play_duration: `${item.minplaytime?.$.value || '?'}-${item.maxplaytime?.$.value || '?'} min`,
      image_url: item.image || null,
      categories,
      year_published: item.yearpublished?.$.value || null,
      bgg_rating: item.statistics?.ratings?.average?.$.value || null,
    };
  },

  /**
   * Import or update a game from BGG into the local database
   */
  async importGameToDB(bggId, dbConnection) {
    try {
      // 1. Fetch game details from BGG API
      const gameDetails = await this.getGameDetails(bggId);

      // 2. Default values for shop-specific fields not provided by BGG
      const defaultPrice = 49.99;
      const defaultStock = 10;

      // 3. Prepare SQL query with ON DUPLICATE KEY UPDATE
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

      // 4. Execute query
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
