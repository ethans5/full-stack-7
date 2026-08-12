// ================================================
// services/gameService.js — Game business logic
// ================================================

const GameModel = require('../models/gameModel');

const GameService = {
  /**
   * Récupère la liste de tous les jeux, avec l'application éventuelle de filtres de recherche.
   */
  async getAllGames(filters) {
    return await GameModel.findAll(filters);
  },

  /**
   * Récupère les détails complets d'un jeu par son ID.
   * Lève une exception 404 si le jeu n'est pas trouvé dans la base.
   */
  async getGameById(id) {
    const game = await GameModel.findById(id);
    if (!game) {
      const error = new Error('Game not found');
      error.status = 404;
      throw error;
    }
    return game;
  },

  /**
   * Crée un nouveau jeu dans la base et lui associe des catégories s'il y en a.
   * Retourne ensuite les données complètes du jeu fraîchement créé.
   */
  async createGame(gameData, categoryIds = []) {
    const game = await GameModel.create(gameData);

    // Set categories if provided
    if (categoryIds.length > 0) {
      await GameModel.setCategories(game.id, categoryIds);
    }

    // Return the full game with categories
    return await GameModel.findById(game.id);
  },

  /**
   * Met à jour les informations d'un jeu existant en conservant les anciennes valeurs si elles ne sont pas modifiées.
   * Remplace également les catégories associées si un nouveau tableau d'ID est fourni.
   */
  async updateGame(id, gameData, categoryIds = null) {
    // Check game exists
    const existingGame = await GameModel.findById(id);
    if (!existingGame) {
      const error = new Error('Game not found');
      error.status = 404;
      throw error;
    }

    // Merge existing data with updates (preserve unchanged fields)
    const updatedData = {
      title: gameData.title ?? existingGame.title,
      description: gameData.description ?? existingGame.description,
      price: gameData.price ?? existingGame.price,
      stock_quantity: gameData.stock_quantity ?? existingGame.stock_quantity,
      image_url: gameData.image_url ?? existingGame.image_url,
      rules_pdf_url: gameData.rules_pdf_url ?? existingGame.rules_pdf_url,
      player_count: gameData.player_count ?? existingGame.player_count,
      min_age: gameData.min_age ?? existingGame.min_age,
      play_duration: gameData.play_duration ?? existingGame.play_duration,
    };

    await GameModel.update(id, updatedData);

    // Update categories if provided
    if (categoryIds !== null) {
      await GameModel.setCategories(id, categoryIds);
    }

    return await GameModel.findById(id);
  },

  /**
   * Supprime définitivement un jeu de la base de données.
   */
  async deleteGame(id) {
    const game = await GameModel.findById(id);
    if (!game) {
      const error = new Error('Game not found');
      error.status = 404;
      throw error;
    }

    try {
      const deleted = await GameModel.delete(id);
      if (!deleted) {
        const error = new Error('Failed to delete game');
        error.status = 500;
        throw error;
      }
      return game;
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
        const customError = new Error(
          `Cannot delete "${game.title}" because it is linked to existing customer orders. Set its stock to 0 instead.`
        );
        customError.status = 400;
        throw customError;
      }
      throw error;
    }
  },
};

module.exports = GameService;
