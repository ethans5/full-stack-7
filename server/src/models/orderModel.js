// ================================================
// models/orderModel.js — Raw SQL queries for Orders & Order_Items tables
// ================================================

const { pool } = require('../config/db');

const OrderModel = {
  /**
   * Create a new order with its items inside a transaction
   * Returns the created order ID
   */
  async create({ user_id, total_price, items, stripe_session_id = null }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert the order
      const [orderResult] = await connection.execute(
        `INSERT INTO Orders (user_id, total_price, status, stripe_session_id)
         VALUES (?, ?, 'pending', ?)`,
        [user_id, total_price, stripe_session_id]
      );
      const orderId = orderResult.insertId;

      // 2. Insert order items
      for (const item of items) {
        await connection.execute(
          `INSERT INTO Order_Items (order_id, game_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.game_id, item.quantity, item.unit_price]
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Find an order by ID with its items
   */
  async findById(id) {
    const [orders] = await pool.execute(
      'SELECT * FROM Orders WHERE id = ?',
      [id]
    );
    if (!orders[0]) return null;

    const [items] = await pool.execute(
      `SELECT oi.*, g.title, g.image_url
       FROM Order_Items oi
       INNER JOIN Games g ON oi.game_id = g.id
       WHERE oi.order_id = ?`,
      [id]
    );

    return { ...orders[0], items };
  },

  /**
   * Find all orders for a specific user
   */
  async findByUserId(userId) {
    const [orders] = await pool.execute(
      'SELECT * FROM Orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Attach items to each order
    for (const order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, g.title, g.image_url
         FROM Order_Items oi
         INNER JOIN Games g ON oi.game_id = g.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return orders;
  },

  /**
   * Find all orders (admin) with optional status filter
   */
  async findAll(statusFilter = null) {
    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM Orders o
      INNER JOIN Users u ON o.user_id = u.id
    `;
    const params = [];

    if (statusFilter) {
      query += ' WHERE o.status = ?';
      params.push(statusFilter);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await pool.execute(query, params);

    // Attach items to each order
    for (const order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, g.title, g.image_url
         FROM Order_Items oi
         INNER JOIN Games g ON oi.game_id = g.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return orders;
  },

  /**
   * Find an order by Stripe session ID
   * Used in the webhook to match payment confirmation to order
   */
  async findByStripeSessionId(sessionId) {
    const [rows] = await pool.execute(
      'SELECT * FROM Orders WHERE stripe_session_id = ?',
      [sessionId]
    );
    return rows[0] || null;
  },

  /**
   * Update order status (e.g. pending → paid → shipped)
   */
  async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE Orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Mark order as paid and deduct stock in a single transaction
   * Called from the Stripe webhook after successful payment
   */
  async confirmPayment(orderId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update order status to 'paid'
      await connection.execute(
        "UPDATE Orders SET status = 'paid' WHERE id = ?",
        [orderId]
      );

      // 2. Get order items
      const [items] = await connection.execute(
        'SELECT game_id, quantity FROM Order_Items WHERE order_id = ?',
        [orderId]
      );

      // 3. Deduct stock for each item
      for (const item of items) {
        const [result] = await connection.execute(
          'UPDATE Games SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
          [item.quantity, item.game_id, item.quantity]
        );

        // If stock deduction failed (not enough stock), rollback
        if (result.affectedRows === 0) {
          throw new Error(`Insufficient stock for game ID ${item.game_id}`);
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = OrderModel;
