// server/server.js
// Express server entry point — orchestrates all layers

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDatabase = require('./config/database');
const env = require('./config/env');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const syncJobs = require('./jobs/syncJobs');

// Import routes
const alertRoutes = require('./routes/alertRoutes');
const energyRoutes = require('./routes/energyRoutes');
const syncRoutes = require('./routes/syncRoutes');

const app = express();

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`);
  next();
});

// ─── API Routes ─────────────────────────────────────────────────
app.use('/api/alerts', alertRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/sync', syncRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Ripple Effect API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Serve React Frontend in Production ─────────────────────────
if (env.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ─── Error Handling ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    app.listen(env.port, () => {
      logger.info(`🚀 Ripple Effect API running on port ${env.port} [${env.nodeEnv}]`);
    });

    // Start cron jobs for periodic data sync
    syncJobs.start();

    // Run initial sync to populate data on startup
    // Run in background so server starts immediately
    setTimeout(() => {
      syncJobs.runInitialSync().catch((err) => {
        logger.error(`Initial sync encountered errors: ${err.message}`);
      });
    }, 3000);
  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  syncJobs.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  syncJobs.stop();
  process.exit(0);
});

startServer();

module.exports = app;
