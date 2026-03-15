// server/routes/energyRoutes.js
// Express routes for energy price endpoints

const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energyController');

// GET /api/energy/latest — Get latest prices
router.get('/latest', (req, res) => energyController.getLatestPrices(req, res));

// GET /api/energy/history/:commodity — Get price history
router.get('/history/:commodity', (req, res) => energyController.getPriceHistory(req, res));

// GET /api/energy/all — Get all recent prices
router.get('/all', (req, res) => energyController.getAllPrices(req, res));

// POST /api/energy/sync — Manually trigger EIA sync
router.post('/sync', (req, res) => energyController.triggerSync(req, res));

module.exports = router;
