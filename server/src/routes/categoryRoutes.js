// ================================================
// routes/categoryRoutes.js
// ================================================

const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Public routes
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Admin-only routes
router.post('/', authMiddleware, adminMiddleware, CategoryController.create);
router.put('/:id', authMiddleware, adminMiddleware, CategoryController.update);
router.delete('/:id', authMiddleware, adminMiddleware, CategoryController.delete);

module.exports = router;
