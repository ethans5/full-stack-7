// ================================================
// controllers/authController.js — Authentication endpoints
// ================================================

const AuthService = require('../services/authService');

const AuthController = {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required.',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
        });
      }

      const { user, token } = await AuthService.register({ name, email, password });

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        data: { user, token },
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
   * POST /api/auth/login
   * Login an existing user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.',
        });
      }

      const { user, token } = await AuthService.login({ email, password });

      res.json({
        success: true,
        message: 'Login successful.',
        data: { user, token },
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
   * GET /api/auth/profile
   * Get the current user's profile (requires auth)
   */
  async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);

      res.json({
        success: true,
        data: { user },
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

module.exports = AuthController;
