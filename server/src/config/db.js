// ================================================
// config/db.js — MySQL Connection Pool
// Uses mysql2 with the promise API for async/await
// ================================================

const mysql = require('mysql2/promise');

// Create the connection pool
// A pool reuses connections instead of creating a new one per query
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'boardgame_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Tests the database connection.
 * Called at server startup to verify MySQL is reachable.
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection successful — Database:', process.env.DB_NAME);
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
