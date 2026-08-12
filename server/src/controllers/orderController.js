// ================================================
// controllers/orderController.js — Order endpoints
// Includes Stripe Checkout + Webhook
// ================================================

const OrderService = require('../services/orderService');
const StripeService = require('../services/stripeService');

const OrderController = {
  /**
   * POST /api/orders/checkout
   * Crée une nouvelle commande en base et génère une session de paiement Stripe Checkout.
   * Accepte une liste d'articles (game_id, quantity) dans le corps de la requête.
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
   * Point de terminaison (webhook) appelé par Stripe lors d'événements (ex: paiement validé).
   * Le corps de la requête doit être brut pour permettre la vérification de la signature cryptographique.
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
   * POST /api/orders/confirm-session
   * Vérifie directement auprès de Stripe qu'une session de paiement est payée et valide la commande.
   * Sert de mécanisme de confirmation immédiat (fallback si le webhook prend du temps ou en dev local).
   */
  async confirmSession(req, res, next) {
    try {
      const { session_id } = req.body;
      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required.',
        });
      }

      const session = await StripeService.retrieveCheckoutSession(session_id);
      if (session && (session.payment_status === 'paid' || session.status === 'complete')) {
        const order = await OrderService.confirmPayment(session_id);
        return res.json({
          success: true,
          message: 'Payment confirmed successfully.',
          data: { order },
        });
      }

      res.status(400).json({
        success: false,
        message: 'Payment has not been completed on Stripe.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/orders/my-orders
   * Récupère l'historique de toutes les commandes passées par l'utilisateur connecté.
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
   * Récupère les détails d'une commande spécifique via son ID.
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
   * Récupère toutes les commandes de tous les utilisateurs (réservé aux administrateurs).
   * Permet de filtrer optionnellement par statut.
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
   * Met à jour le statut (ex: pending, paid, shipped) d'une commande spécifique (réservé aux administrateurs).
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
