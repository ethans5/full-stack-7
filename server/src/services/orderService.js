// ================================================
// services/orderService.js — Order business logic
// ================================================

const OrderModel = require('../models/orderModel');
const GameModel = require('../models/gameModel');

const OrderService = {
  /**
   * Create a new order from cart items
   * Validates stock availability before creating the order
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
   * Get order details by ID
   * Validates that the user owns the order (unless admin)
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
   * Get all orders for a user
   */
  async getUserOrders(userId) {
    return await OrderModel.findByUserId(userId);
  },

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(statusFilter = null) {
    return await OrderModel.findAll(statusFilter);
  },

  /**
   * Update order status (admin only)
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
   * Confirm payment for an order (called from Stripe webhook)
   * Updates status to 'paid' and deducts stock transactionally
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
