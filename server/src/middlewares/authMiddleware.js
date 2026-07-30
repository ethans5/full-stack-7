// ================================================
// middlewares/authMiddleware.js — JWT Verification
// Protects routes that require authentication
// ================================================

const AuthService = require('../services/authService');
const UserModel = require('../models/userModel');

async function authMiddleware(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = AuthService.verifyToken(token);

    // Fetch user from database to ensure they still exist
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User no longer exists.',
      });
    }

    // Attach user to request object for downstream use
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid or expired token.',
    });
  }
}

module.exports = authMiddleware;
