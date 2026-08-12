// ================================================
// services/categoryService.js — Category business logic
// ================================================

const CategoryModel = require('../models/categoryModel');

const CategoryService = {
  /**
   * Récupère la liste de toutes les catégories.
   */
  async getAllCategories() {
    return await CategoryModel.findAll();
  },

  /**
   * Récupère une seule catégorie par son ID. Lève une erreur 404 si elle n'existe pas.
   */
  async getCategoryById(id) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }
    return category;
  },

  /**
   * Crée une nouvelle catégorie et retourne la catégorie nouvellement créée avec son ID.
   */
  async createCategory(name) {
    return await CategoryModel.create(name);
  },

  /**
   * Met à jour le nom d'une catégorie. Vérifie d'abord que la catégorie existe (sinon 404).
   */
  async updateCategory(id, name) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }

    await CategoryModel.update(id, name);
    return { id, name };
  },

  /**
   * Supprime une catégorie. Vérifie sa présence au préalable.
   */
  async deleteCategory(id) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }

    await CategoryModel.delete(id);
    return category;
  },
};

module.exports = CategoryService;
