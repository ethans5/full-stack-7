// ================================================
// services/gameService.js — Game business logic
// ================================================

const GameModel = require('../models/gameModel');

const GameService = {
  /**
   * Get all games with optional filters
   */
  async getAllGames(filters) {
    return await GameModel.findAll(filters);
  },

  /**
   * Get a single game by ID
   * Throws 404 if not found
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
   * Create a new game with optional category associations
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
   * Update an existing game
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
   * Delete a game
   */
  async deleteGame(id) {
    const game = await GameModel.findById(id);
    if (!game) {
      const error = new Error('Game not found');
      error.status = 404;
      throw error;
    }

    const deleted = await GameModel.delete(id);
    if (!deleted) {
      const error = new Error('Failed to delete game');
      error.status = 500;
      throw error;
    }

    return game;
  },
};

module.exports = GameService;
