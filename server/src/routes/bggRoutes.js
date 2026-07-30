// ================================================
// routes/bggRoutes.js
// Admin-only routes for BoardGameGeek API
// ================================================

const express = require('express');
const router = express.Router();
const BggController = require('../controllers/bggController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Admin-only routes (search + details for auto-fill)
router.get('/search', authMiddleware, adminMiddleware, BggController.search);
router.get('/game/:bggId', authMiddleware, adminMiddleware, BggController.getDetails);

module.exports = router;
