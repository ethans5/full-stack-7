// ================================================
// services/categoryService.js — Category business logic
// ================================================

const CategoryModel = require('../models/categoryModel');

const CategoryService = {
  /**
   * Get all categories
   */
  async getAllCategories() {
    return await CategoryModel.findAll();
  },

  /**
   * Get a category by ID
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
   * Create a new category
   */
  async createCategory(name) {
    return await CategoryModel.create(name);
  },

  /**
   * Update a category
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
   * Delete a category
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
