// ================================================
// models/categoryModel.js — Raw SQL queries for Categories table
// ================================================

const { pool } = require('../config/db');

const CategoryModel = {
  /**
   * Exécute une requête SQL pour récupérer toutes les catégories, triées par ordre alphabétique.
   */
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM Categories ORDER BY name ASC'
    );
    return rows;
  },

  /**
   * Exécute une requête SQL pour trouver une catégorie précise grâce à son identifiant (ID).
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM Categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Exécute une requête SQL pour insérer une nouvelle catégorie dans la base de données.
   */
  async create(name) {
    const [result] = await pool.execute(
      'INSERT INTO Categories (name) VALUES (?)',
      [name]
    );
    return { id: result.insertId, name };
  },

  /**
   * Exécute une requête SQL pour mettre à jour le nom d'une catégorie existante.
   */
  async update(id, name) {
    const [result] = await pool.execute(
      'UPDATE Categories SET name = ? WHERE id = ?',
      [name, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Exécute une requête SQL pour supprimer une catégorie via son ID.
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
