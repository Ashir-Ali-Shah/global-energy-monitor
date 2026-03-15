// server/controllers/energyController.js
// HTTP controller for energy price endpoints

const eiaService = require('../services/eiaService');
const energyPriceRepository = require('../repositories/energyPriceRepository');
const logger = require('../utils/logger');

class EnergyController {
  /**
   * GET /api/energy/latest — Get latest prices for all commodities
   */
  async getLatestPrices(req, res) {
    try {
      const prices = await eiaService.getLatestPrices();
      res.json({ success: true, data: prices });
    } catch (error) {
      logger.error(`Error fetching latest prices: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch latest prices' });
    }
  }

  /**
   * GET /api/energy/history/:commodity — Get price history for a commodity
   */
  async getPriceHistory(req, res) {
    try {
      const { commodity } = req.params;
      const { months } = req.query;

      const validCommodities = ['crude-oil', 'gasoline', 'diesel', 'heating-oil', 'natural-gas', 'propane'];
      if (!validCommodities.includes(commodity)) {
        return res.status(400).json({
          success: false,
          error: `Invalid commodity. Valid: ${validCommodities.join(', ')}`,
        });
      }

      const history = await eiaService.getPriceHistory(commodity, parseInt(months) || 12);
      res.json({ success: true, data: history });
    } catch (error) {
      logger.error(`Error fetching price history: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch price history' });
    }
  }

  /**
   * GET /api/energy/all — Get all recent price data
   */
  async getAllPrices(req, res) {
    try {
      const { limit } = req.query;
      const prices = await energyPriceRepository.getAllPrices(parseInt(limit) || 50);
      res.json({ success: true, data: prices });
    } catch (error) {
      logger.error(`Error fetching all prices: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch prices' });
    }
  }

  /**
   * POST /api/energy/sync — Manually trigger EIA sync
   */
  async triggerSync(req, res) {
    try {
      logger.info('Manual EIA sync triggered');
      const result = await eiaService.syncAllPrices(true);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error(`Manual EIA sync failed: ${error.message}`);
      res.status(500).json({ success: false, error: 'EIA sync failed' });
    }
  }
}

module.exports = new EnergyController();
