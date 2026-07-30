// ================================================
// server.js — Express Server Entry Point
// ================================================

// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bggRoutes = require('./routes/bggRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ================================================
// Global Middlewares
// ================================================

// CORS — allow requests from the React client
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// JSON parser for all routes EXCEPT the Stripe webhook
// (Stripe needs the raw body to verify the signature)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/orders/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// URL-encoded parser
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files (images, PDFs)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ================================================
// API Routes
// ================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BoardGame Shop server is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bgg', bggRoutes);

// ================================================
// Error Handling
// ================================================

// 404 — Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error',
  });
});

// ================================================
// Start Server
// ================================================

async function startServer() {
  // Verify MySQL connection before starting
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📋 API Routes:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/auth/profile`);
    console.log(`   GET    /api/games`);
    console.log(`   GET    /api/games/:id`);
    console.log(`   POST   /api/games (admin)`);
    console.log(`   PUT    /api/games/:id (admin)`);
    console.log(`   DELETE /api/games/:id (admin)`);
    console.log(`   GET    /api/categories`);
    console.log(`   POST   /api/orders/checkout`);
    console.log(`   POST   /api/orders/webhook (Stripe)`);
    console.log(`   GET    /api/orders/my-orders`);
    console.log(`   GET    /api/bgg/search (admin)`);
    console.log(`   GET    /api/bgg/game/:bggId (admin)`);
  });
}

startServer();
