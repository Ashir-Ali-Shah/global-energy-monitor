// server/routes/syncRoutes.js
// Express routes for sync management endpoints

const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

// GET /api/sync/status — Get current sync status
router.get('/status', (req, res) => syncController.getStatus(req, res));

// GET /api/sync/logs — Get recent sync logs
router.get('/logs', (req, res) => syncController.getLogs(req, res));

module.exports = router;
