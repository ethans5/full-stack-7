// ================================================
// models/userModel.js — Raw SQL queries for Users table
// ================================================

const { pool } = require('../config/db');

const UserModel = {
  /**
   * Cherche un utilisateur en base de données par son adresse email.
   * Utilisé lors de la connexion ou pour vérifier si un email est déjà pris à l'inscription.
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Cherche un utilisateur par son identifiant unique.
   * Essentiellement utilisé lors de la vérification du token JWT par le middleware d'authentification.
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM Users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Insère un nouvel utilisateur dans la base de données.
   * Le mot de passe fourni doit impérativement être hashé en amont.
   */
  async create({ name, email, password, role = 'client' }) {
    const [result] = await pool.execute(
      'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return { id: result.insertId, name, email, role };
  },

  /**
   * Récupère la liste de tous les utilisateurs (fonctionnalité d'administration).
   * Le hash du mot de passe est volontairement exclu de la requête par mesure de sécurité.
   */
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM Users'
    );
    return rows;
  },
};

module.exports = UserModel;
