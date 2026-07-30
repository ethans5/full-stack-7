// ================================================
// middlewares/adminMiddleware.js — Admin Role Guard
// Must be used AFTER authMiddleware (req.user must exist)
// ================================================

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
}

module.exports = adminMiddleware;
