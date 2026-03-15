// server/controllers/alertController.js
// HTTP controller for alert endpoints — delegates to services

const newsDataService = require('../services/newsDataService');
const alertRepository = require('../repositories/alertRepository');
const logger = require('../utils/logger');

class AlertController {
  /**
   * GET /api/alerts — Get all active alerts
   */
  async getAlerts(req, res) {
    try {
      const { category, limit, skip } = req.query;
      const filters = {};
      if (category) filters.category = category;

      const options = {
        limit: parseInt(limit) || 500,
        skip: parseInt(skip) || 0,
      };

      const alerts = await alertRepository.findAll(filters, options);
      const total = await alertRepository.count(filters);

      res.json({
        success: true,
        data: alerts,
        meta: {
          total,
          limit: options.limit,
          skip: options.skip,
        },
      });
    } catch (error) {
      logger.error(`Error fetching alerts: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
    }
  }

  /**
   * GET /api/alerts/stats — Get alert statistics
   */
  async getAlertStats(req, res) {
    try {
      const stats = await newsDataService.getAlertStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error(`Error fetching alert stats: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch alert stats' });
    }
  }

  /**
   * GET /api/alerts/nearby — Get alerts near a coordinate
   */
  async getNearbyAlerts(req, res) {
    try {
      const { lng, lat, radius } = req.query;
      if (!lng || !lat) {
        return res.status(400).json({ success: false, error: 'lng and lat are required' });
      }

      const alerts = await alertRepository.findNearby(
        parseFloat(lng),
        parseFloat(lat),
        parseFloat(radius) || 500
      );

      res.json({ success: true, data: alerts });
    } catch (error) {
      logger.error(`Error fetching nearby alerts: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch nearby alerts' });
    }
  }

  /**
   * POST /api/alerts/sync — Manually trigger a news sync
   */
  async triggerSync(req, res) {
    try {
      logger.info('Manual NewsData sync triggered');
      const result = await newsDataService.syncAllNews();
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error(`Manual sync failed: ${error.message}`);
      res.status(500).json({ success: false, error: 'Sync failed' });
    }
  }
}

module.exports = new AlertController();
