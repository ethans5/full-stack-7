// ================================================
// services/authService.js — Authentication business logic
// ================================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const SALT_ROUNDS = 10;

const AuthService = {
  /**
   * Crée un nouvel utilisateur.
   * Vérifie d'abord que l'email n'est pas déjà pris, puis hache le mot de passe avant insertion.
   * Génère et retourne un token JWT.
   */
  async register({ name, email, password }) {
    // Check if email already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      const error = new Error('A user with this email already exists');
      error.status = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user in database
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'client',
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return { user, token };
  },

  /**
   * Connecte un utilisateur existant.
   * Vérifie que l'email existe et que le mot de passe correspond au hash stocké.
   * Retourne les données de l'utilisateur (sans le mot de passe) et un token JWT.
   */
  async login({ email, password }) {
    // Find user by email (includes password hash)
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  /**
   * Génère un nouveau token JWT contenant l'ID, l'email et le rôle de l'utilisateur.
   * Signé avec une clé secrète et expire après 24 heures (ou configuré via env).
   */
  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  },

  /**
   * Vérifie la signature et la validité d'un token JWT.
   * Retourne le payload (données) décodé s'il est valide, lève une exception sinon.
   */
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  },

  /**
   * Récupère le profil public complet de l'utilisateur via son ID (le hash du mot de passe est exclu par le Model).
   */
  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return user;
  },
};

module.exports = AuthService;
