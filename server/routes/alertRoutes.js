// server/routes/alertRoutes.js
// Express routes for alert endpoints

const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// GET /api/alerts — Get all alerts with optional filters
router.get('/', (req, res) => alertController.getAlerts(req, res));

// GET /api/alerts/stats — Get alert statistics by category
router.get('/stats', (req, res) => alertController.getAlertStats(req, res));

// GET /api/alerts/nearby — Get alerts near coordinates
router.get('/nearby', (req, res) => alertController.getNearbyAlerts(req, res));

// POST /api/alerts/sync — Manually trigger NewsData sync
router.post('/sync', (req, res) => alertController.triggerSync(req, res));

module.exports = router;
