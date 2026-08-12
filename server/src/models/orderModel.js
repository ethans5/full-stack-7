// ================================================
// models/orderModel.js — Raw SQL queries for Orders & Order_Items tables
// ================================================

const { pool } = require('../config/db');

const OrderModel = {
  /**
   * Crée une nouvelle commande et ses lignes d'articles associées au sein d'une transaction SQL.
   * Retourne l'ID de la commande générée.
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
   * Exécute des requêtes SQL pour récupérer une commande par ID et tous les articles qui la composent.
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
   * Récupère l'historique complet des commandes d'un utilisateur spécifique, en incluant les articles pour chacune.
   */
  async findByUserId(userId) {
    // 1. Fetch completed/paid/shipped orders in chronological order
    const [orders] = await pool.execute(
      `SELECT * FROM Orders 
       WHERE user_id = ? AND status != 'pending' 
       ORDER BY created_at ASC`,
      [userId]
    );

    // 2. Assign user-relative order number (Order #1, Order #2...)
    orders.forEach((order, index) => {
      order.user_order_number = index + 1;
    });

    // 3. Sort newest first for user display
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 4. Attach items to each order
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
   * Récupère toutes les commandes existantes dans le système (vue admin), avec filtre optionnel par statut.
   * Inclut également le nom et l'email de l'utilisateur acheteur.
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
   * Recherche une commande grâce à l'ID de session Stripe.
   * Principalement utilisé par le webhook pour retrouver la commande après paiement.
   */
  async findByStripeSessionId(sessionId) {
    const [rows] = await pool.execute(
      'SELECT * FROM Orders WHERE stripe_session_id = ?',
      [sessionId]
    );
    return rows[0] || null;
  },

  /**
   * Met à jour uniquement le statut (ex: 'paid', 'shipped') d'une commande spécifique.
   */
  async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE Orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Marque une commande comme payée et déduit le stock des jeux correspondants dans une seule transaction sécurisée.
   * Si le stock est insuffisant, la transaction est annulée.
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
