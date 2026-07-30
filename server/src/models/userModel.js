// ================================================
// models/userModel.js — Raw SQL queries for Users table
// ================================================

const { pool } = require('../config/db');

const UserModel = {
  /**
   * Find a user by email
   * Used for login and duplicate-check during registration
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by ID
   * Used for JWT token verification (authMiddleware)
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM Users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user
   * Password must be hashed BEFORE calling this method
   */
  async create({ name, email, password, role = 'client' }) {
    const [result] = await pool.execute(
      'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return { id: result.insertId, name, email, role };
  },

  /**
   * Get all users (admin only)
   * Excludes password hash for security
   */
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM Users'
    );
    return rows;
  },
};

module.exports = UserModel;
