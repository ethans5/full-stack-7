// ================================================
// controllers/bggController.js — BoardGameGeek API endpoints
// ================================================

const BggService = require('../services/bggService');
const { pool } = require('../config/db');

const BggController = {
  /**
   * GET /api/bgg/search?query=catan
   * Recherche un jeu de société sur l'API externe BoardGameGeek (BGG) par son nom.
   */
  async search(req, res, next) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required.',
        });
      }

      const results = await BggService.searchByName(query);

      res.json({
        success: true,
        data: { results },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/bgg/game/:bggId
   * Récupère les détails complets d'un jeu spécifique depuis l'API BGG (utile pour pré-remplir le formulaire admin).
   */
  async getDetails(req, res, next) {
    try {
      const details = await BggService.getGameDetails(req.params.bggId);

      res.json({
        success: true,
        data: { game: details },
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  /**
   * POST /api/bgg/import
   * Déclenche l'importation directe d'un jeu BGG vers la base de données MySQL.
   */
  async importGame(req, res, next) {
    try {
      const { bggId } = req.body;

      if (!bggId) {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre bggId est obligatoire.',
        });
      }

      const result = await BggService.importGameToDB(bggId, pool);

      res.status(201).json({
        success: true,
        message: 'Jeu et catégories importés avec succès depuis BoardGameGeek !',
        data: result,
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
};

module.exports = BggController;
