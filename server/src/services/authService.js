// ================================================
// services/authService.js — Authentication business logic
// ================================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const SALT_ROUNDS = 10;

const AuthService = {
  /**
   * Register a new user
   * Hashes the password, checks for duplicate email, creates the user
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
   * Login an existing user
   * Verifies email and password, returns JWT token
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
   * Generate a JWT token for a user
   */
  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  },

  /**
   * Verify a JWT token and return the decoded payload
   */
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  },

  /**
   * Get user profile by ID (without password)
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
