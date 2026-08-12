// ================================================
// controllers/categoryController.js — Category CRUD endpoints
// ================================================

const CategoryService = require('../services/categoryService');

const CategoryController = {
  /**
   * GET /api/categories
   * Récupère la liste de toutes les catégories de jeux.
   */
  async getAll(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories();

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/categories/:id
   * Récupère les détails d'une seule catégorie en fonction de son ID.
   */
  async getById(req, res, next) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);

      res.json({
        success: true,
        data: { category },
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
   * POST /api/categories
   * Crée une nouvelle catégorie (réservé aux administrateurs).
   */
  async create(req, res, next) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required.',
        });
      }

      const category = await CategoryService.createCategory(name);

      res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: { category },
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
   * PUT /api/categories/:id
   * Met à jour une catégorie existante (réservé aux administrateurs).
   */
  async update(req, res, next) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required.',
        });
      }

      const category = await CategoryService.updateCategory(req.params.id, name);

      res.json({
        success: true,
        message: 'Category updated successfully.',
        data: { category },
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
   * DELETE /api/categories/:id
   * Supprime une catégorie de la base de données (réservé aux administrateurs).
   */
  async delete(req, res, next) {
    try {
      const category = await CategoryService.deleteCategory(req.params.id);

      res.json({
        success: true,
        message: 'Category deleted successfully.',
        data: { category },
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

module.exports = CategoryController;
