// ================================================
// controllers/gameController.js — Game CRUD endpoints
// ================================================

const GameService = require('../services/gameService');

const GameController = {
  /**
   * GET /api/games
   * Get all games with optional filters
   * Query params: search, category_id, min_price, max_price, min_age, sort_by, sort_order
   */
  async getAll(req, res, next) {
    try {
      const filters = {
        search: req.query.search || null,
        category_id: req.query.category_id || null,
        min_price: req.query.min_price || null,
        max_price: req.query.max_price || null,
        min_age: req.query.min_age || null,
        sort_by: req.query.sort_by || 'created_at',
        sort_order: req.query.sort_order || 'DESC',
      };

      const games = await GameService.getAllGames(filters);

      res.json({
        success: true,
        data: { games },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/games/:id
   * Get a single game by ID (includes categories)
   */
  async getById(req, res, next) {
    try {
      const game = await GameService.getGameById(req.params.id);

      res.json({
        success: true,
        data: { game },
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
   * POST /api/games
   * Create a new game (admin only)
   * Accepts multipart/form-data with image and rules_pdf files
   */
  async create(req, res, next) {
    try {
      const gameData = {
        title: req.body.title,
        description: req.body.description || null,
        price: parseFloat(req.body.price),
        stock_quantity: parseInt(req.body.stock_quantity) || 0,
        image_url: req.files?.image?.[0]
          ? `/uploads/images/${req.files.image[0].filename}`
          : null,
        rules_pdf_url: req.files?.rules_pdf?.[0]
          ? `/uploads/pdfs/${req.files.rules_pdf[0].filename}`
          : null,
        player_count: req.body.player_count || null,
        min_age: req.body.min_age ? parseInt(req.body.min_age) : null,
        play_duration: req.body.play_duration || null,
      };

      // Validate required fields
      if (!gameData.title || isNaN(gameData.price)) {
        return res.status(400).json({
          success: false,
          message: 'Title and price are required.',
        });
      }

      // Parse category IDs from request body
      let categoryIds = [];
      if (req.body.category_ids) {
        categoryIds = JSON.parse(req.body.category_ids);
      }

      const game = await GameService.createGame(gameData, categoryIds);

      res.status(201).json({
        success: true,
        message: 'Game created successfully.',
        data: { game },
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
   * PUT /api/games/:id
   * Update a game (admin only)
   * Accepts multipart/form-data with optional image and rules_pdf files
   */
  async update(req, res, next) {
    try {
      const gameData = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        stock_quantity: req.body.stock_quantity !== undefined
          ? parseInt(req.body.stock_quantity)
          : undefined,
        player_count: req.body.player_count,
        min_age: req.body.min_age ? parseInt(req.body.min_age) : undefined,
        play_duration: req.body.play_duration,
      };

      // Handle file uploads (only update if new file is provided)
      if (req.files?.image?.[0]) {
        gameData.image_url = `/uploads/images/${req.files.image[0].filename}`;
      }
      if (req.files?.rules_pdf?.[0]) {
        gameData.rules_pdf_url = `/uploads/pdfs/${req.files.rules_pdf[0].filename}`;
      }

      // Parse category IDs if provided
      let categoryIds = null;
      if (req.body.category_ids) {
        categoryIds = JSON.parse(req.body.category_ids);
      }

      const game = await GameService.updateGame(req.params.id, gameData, categoryIds);

      res.json({
        success: true,
        message: 'Game updated successfully.',
        data: { game },
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
   * DELETE /api/games/:id
   * Delete a game (admin only)
   */
  async delete(req, res, next) {
    try {
      const game = await GameService.deleteGame(req.params.id);

      res.json({
        success: true,
        message: 'Game deleted successfully.',
        data: { game },
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

module.exports = GameController;
