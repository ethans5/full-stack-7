// ================================================
// routes/orderRoutes.js
// Includes Stripe webhook (raw body) and authenticated routes
// ================================================

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Stripe webhook — must use raw body parser (configured in server.js)
router.post('/webhook', express.raw({ type: 'application/json' }), OrderController.webhook);

// Authenticated user routes
router.post('/checkout', authMiddleware, OrderController.checkout);
router.get('/my-orders', authMiddleware, OrderController.getMyOrders);
router.get('/:id', authMiddleware, OrderController.getById);

// Admin-only routes
router.get('/', authMiddleware, adminMiddleware, OrderController.getAll);
router.patch('/:id/status', authMiddleware, adminMiddleware, OrderController.updateStatus);

module.exports = router;
