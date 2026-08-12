// ================================================
// models/gameModel.js — Raw SQL queries for Games table
// ================================================

const { pool } = require('../config/db');

const GameModel = {
  /**
   * Construit et exécute dynamiquement une requête SQL pour récupérer les jeux.
   * Gère les jointures et filtres (catégorie, recherche textuelle, prix, âge minimum) et le tri.
   */
  async findAll(filters = {}) {
    let query = `
      SELECT DISTINCT g.*
      FROM Games g
    `;
    const params = [];
    const conditions = [];

    // Join with pivot table if filtering by category
    if (filters.category_id) {
      query = `
        SELECT DISTINCT g.*
        FROM Games g
        INNER JOIN Game_Categories gc ON g.id = gc.game_id
      `;
      conditions.push('gc.category_id = ?');
      params.push(filters.category_id);
    }

    // Search by title
    if (filters.search) {
      conditions.push('g.title LIKE ?');
      params.push(`%${filters.search}%`);
    }

    // Price range
    if (filters.min_price) {
      conditions.push('g.price >= ?');
      params.push(filters.min_price);
    }
    if (filters.max_price) {
      conditions.push('g.price <= ?');
      params.push(filters.max_price);
    }

    // Min age filter
    if (filters.min_age) {
      conditions.push('g.min_age <= ?');
      params.push(filters.min_age);
    }

    // Build WHERE clause
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    const allowedSortFields = ['price', 'title', 'created_at'];
    const sortField = allowedSortFields.includes(filters.sort_by)
      ? filters.sort_by
      : 'created_at';
    const sortOrder = filters.sort_order === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY g.${sortField} ${sortOrder}`;

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  /**
   * Exécute une requête SQL pour récupérer un jeu spécifique par son ID.
   * Effectue une requête supplémentaire pour récupérer également ses catégories associées.
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM Games WHERE id = ?',
      [id]
    );
    if (!rows[0]) return null;

    // Also fetch the categories for this game
    const [categories] = await pool.execute(
      `SELECT c.id, c.name
       FROM Categories c
       INNER JOIN Game_Categories gc ON c.id = gc.category_id
       WHERE gc.game_id = ?`,
      [id]
    );

    return { ...rows[0], categories };
  },

  /**
   * Exécute une requête SQL pour insérer un nouveau jeu avec toutes ses caractéristiques.
   */
  async create(gameData) {
    const {
      title, description, price, stock_quantity,
      image_url, rules_pdf_url, player_count, min_age, play_duration,
    } = gameData;

    const [result] = await pool.execute(
      `INSERT INTO Games
        (title, description, price, stock_quantity, image_url, rules_pdf_url, player_count, min_age, play_duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, stock_quantity, image_url, rules_pdf_url, player_count, min_age, play_duration]
    );

    return { id: result.insertId, ...gameData };
  },

  /**
   * Exécute une requête SQL pour mettre à jour l'ensemble des champs d'un jeu existant.
   */
  async update(id, gameData) {
    const {
      title, description, price, stock_quantity,
      image_url, rules_pdf_url, player_count, min_age, play_duration,
    } = gameData;

    const [result] = await pool.execute(
      `UPDATE Games SET
        title = ?, description = ?, price = ?, stock_quantity = ?,
        image_url = ?, rules_pdf_url = ?, player_count = ?, min_age = ?, play_duration = ?
       WHERE id = ?`,
      [title, description, price, stock_quantity, image_url, rules_pdf_url, player_count, min_age, play_duration, id]
    );

    return result.affectedRows > 0;
  },

  /**
   * Exécute une requête SQL pour supprimer un jeu de la base de données via son ID.
   */
  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM Games WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Diminue le stock d'un jeu d'une quantité donnée.
   * Peut s'exécuter au sein d'une transaction existante si une connexion est fournie.
   */
  async updateStock(id, quantityToDeduct, connection) {
    const executor = connection || pool;
    const [result] = await executor.execute(
      'UPDATE Games SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
      [quantityToDeduct, id, quantityToDeduct]
    );
    return result.affectedRows > 0;
  },

  /**
   * Remplace les associations de catégories d'un jeu dans la table de pivot `Game_Categories`.
   * Supprime les anciennes liaisons puis insère les nouvelles.
   */
  async setCategories(gameId, categoryIds) {
    // Remove existing associations
    await pool.execute(
      'DELETE FROM Game_Categories WHERE game_id = ?',
      [gameId]
    );

    // Insert new associations
    if (categoryIds && categoryIds.length > 0) {
      const values = categoryIds.map(() => '(?, ?)').join(', ');
      const params = categoryIds.flatMap((catId) => [gameId, catId]);
      await pool.execute(
        `INSERT INTO Game_Categories (game_id, category_id) VALUES ${values}`,
        params
      );
    }
  },
};

module.exports = GameModel;
