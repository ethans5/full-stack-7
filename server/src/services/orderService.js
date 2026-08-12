// ================================================
// services/orderService.js — Order business logic
// ================================================

const OrderModel = require('../models/orderModel');
const GameModel = require('../models/gameModel');

const OrderService = {
  /**
   * Crée une nouvelle commande en fonction des articles du panier fournis.
   * Valide rigoureusement la disponibilité des stocks de chaque jeu avant la création en base.
   */
  async createOrder({ user_id, items, stripe_session_id = null }) {
    // Validate each item and calculate total price
    let total_price = 0;
    const validatedItems = [];

    for (const item of items) {
      const game = await GameModel.findById(item.game_id);
      if (!game) {
        const error = new Error(`Game with ID ${item.game_id} not found`);
        error.status = 404;
        throw error;
      }

      if (game.stock_quantity < item.quantity) {
        const error = new Error(
          `Insufficient stock for "${game.title}". Available: ${game.stock_quantity}, Requested: ${item.quantity}`
        );
        error.status = 400;
        throw error;
      }

      validatedItems.push({
        game_id: game.id,
        quantity: item.quantity,
        unit_price: game.price,
      });

      total_price += game.price * item.quantity;
    }

    // Create the order in database
    const orderId = await OrderModel.create({
      user_id,
      total_price,
      items: validatedItems,
      stripe_session_id,
    });

    return await OrderModel.findById(orderId);
  },

  /**
   * Récupère les détails d'une commande via son ID.
   * Assure la sécurité en vérifiant que l'utilisateur demandeur est bien le propriétaire de la commande (ou un administrateur).
   */
  async getOrderById(orderId, userId, userRole) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    // Only allow the order owner or an admin to see the order
    if (order.user_id !== userId && userRole !== 'admin') {
      const error = new Error('Access denied');
      error.status = 403;
      throw error;
    }

    return order;
  },

  /**
   * Récupère toutes les commandes associées à un utilisateur donné.
   */
  async getUserOrders(userId) {
    return await OrderModel.findByUserId(userId);
  },

  /**
   * Récupère l'intégralité des commandes de la plateforme (fonctionnalité d'administration).
   */
  async getAllOrders(statusFilter = null) {
    return await OrderModel.findAll(statusFilter);
  },

  /**
   * Met à jour manuellement le statut d'une commande (réservé aux administrateurs).
   * Vérifie que le statut demandé fait partie des statuts autorisés (pending, paid, shipped).
   */
  async updateOrderStatus(orderId, status) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    const validStatuses = ['pending', 'paid', 'shipped'];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      error.status = 400;
      throw error;
    }

    await OrderModel.updateStatus(orderId, status);
    return await OrderModel.findById(orderId);
  },

  /**
   * Confirme officiellement le paiement d'une commande (déclenché par le webhook de Stripe).
   * Assure l'idempotence (ne fait rien si déjà payée) et déclenche la déduction des stocks en cascade.
   */
  async confirmPayment(stripeSessionId) {
    const order = await OrderModel.findByStripeSessionId(stripeSessionId);
    if (!order) {
      const error = new Error('Order not found for this Stripe session');
      error.status = 404;
      throw error;
    }

    // Already paid — idempotent
    if (order.status === 'paid') {
      return order;
    }

    await OrderModel.confirmPayment(order.id);
    return await OrderModel.findById(order.id);
  },
};

module.exports = OrderService;
