// ================================================
// routes/gameRoutes.js
// ================================================

const express = require('express');
const router = express.Router();
const GameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', GameController.getAll);
router.get('/:id', GameController.getById);

// Admin-only routes (auth + admin)
router.post('/', authMiddleware, adminMiddleware, uploadMiddleware, GameController.create);
router.put('/:id', authMiddleware, adminMiddleware, uploadMiddleware, GameController.update);
router.delete('/:id', authMiddleware, adminMiddleware, GameController.delete);

module.exports = router;
