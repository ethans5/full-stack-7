// ================================================
// middlewares/adminMiddleware.js — Admin Role Guard
// Must be used AFTER authMiddleware (req.user must exist)
// ================================================

/**
 * Middleware de vérification des droits d'administration.
 * Bloque l'accès si l'utilisateur authentifié (req.user) n'a pas le rôle 'admin'.
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction pour passer au middleware suivant
 */
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
