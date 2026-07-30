// ================================================
// controllers/orderController.js — Order endpoints
// Includes Stripe Checkout + Webhook
// ================================================

const OrderService = require('../services/orderService');
const StripeService = require('../services/stripeService');

const OrderController = {
  /**
   * POST /api/orders/checkout
   * Create an order and a Stripe Checkout session
   * Body: { items: [{ game_id, quantity }] }
   */
  async checkout(req, res, next) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart items are required.',
        });
      }

      // 1. Create the order in database (status: pending)
      const order = await OrderService.createOrder({
        user_id: req.user.id,
        items,
      });

      // 2. Create Stripe Checkout session
      const session = await StripeService.createCheckoutSession({
        orderId: order.id,
        items: order.items,
        customerEmail: req.user.email,
      });

      // 3. Update the order with the Stripe session ID
      const OrderModel = require('../models/orderModel');
      await OrderModel.updateStatus(order.id, 'pending');
      const { pool } = require('../config/db');
      await pool.execute(
        'UPDATE Orders SET stripe_session_id = ? WHERE id = ?',
        [session.id, order.id]
      );

      res.json({
        success: true,
        data: {
          checkout_url: session.url,
          session_id: session.id,
          order_id: order.id,
        },
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
   * POST /api/orders/webhook
   * Stripe webhook — validates payment and deducts stock
   * Body must be raw (not JSON parsed) for signature verification
   */
  async webhook(req, res, next) {
    try {
      const signature = req.headers['stripe-signature'];

      // Verify webhook signature
      const event = StripeService.constructEvent(req.body, signature);

      // Handle the event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Confirm payment: update status + deduct stock transactionally
        await OrderService.confirmPayment(session.id);
        console.log(`✅ Payment confirmed for session: ${session.id}`);
      }

      // Acknowledge receipt to Stripe
      res.json({ received: true });
    } catch (error) {
      console.error('❌ Webhook error:', error.message);
      return res.status(400).json({
        success: false,
        message: `Webhook error: ${error.message}`,
      });
    }
  },

  /**
   * GET /api/orders/my-orders
   * Get all orders for the current user
   */
  async getMyOrders(req, res, next) {
    try {
      const orders = await OrderService.getUserOrders(req.user.id);

      res.json({
        success: true,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/orders/:id
   * Get a single order by ID
   */
  async getById(req, res, next) {
    try {
      const order = await OrderService.getOrderById(
        req.params.id,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: { order },
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
   * GET /api/orders
   * Get all orders (admin only)
   * Query params: status (optional filter)
   */
  async getAll(req, res, next) {
    try {
      const orders = await OrderService.getAllOrders(req.query.status || null);

      res.json({
        success: true,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/orders/:id/status
   * Update order status (admin only)
   * Body: { status: 'pending' | 'paid' | 'shipped' }
   */
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required.',
        });
      }

      const order = await OrderService.updateOrderStatus(req.params.id, status);

      res.json({
        success: true,
        message: 'Order status updated successfully.',
        data: { order },
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

module.exports = OrderController;
