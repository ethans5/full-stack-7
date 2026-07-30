// ================================================
// models/categoryModel.js — Raw SQL queries for Categories table
// ================================================

const { pool } = require('../config/db');

const CategoryModel = {
  /**
   * Get all categories
   */
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM Categories ORDER BY name ASC'
    );
    return rows;
  },

  /**
   * Find a category by ID
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM Categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new category
   */
  async create(name) {
    const [result] = await pool.execute(
      'INSERT INTO Categories (name) VALUES (?)',
      [name]
    );
    return { id: result.insertId, name };
  },

  /**
   * Update a category name
   */
  async update(id, name) {
    const [result] = await pool.execute(
      'UPDATE Categories SET name = ? WHERE id = ?',
      [name, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Delete a category
   */
  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM Categories WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = CategoryModel;
