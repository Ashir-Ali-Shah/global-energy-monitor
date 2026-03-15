// server/controllers/syncController.js
// HTTP controller for sync status and management

const syncLogRepository = require('../repositories/syncLogRepository');
const logger = require('../utils/logger');

class SyncController {
  /**
   * GET /api/sync/status — Get sync status for all services
   */
  async getStatus(req, res) {
    try {
      const status = await syncLogRepository.getSyncStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      logger.error(`Error fetching sync status: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch sync status' });
    }
  }

  /**
   * GET /api/sync/logs — Get recent sync logs
   */
  async getLogs(req, res) {
    try {
      const { limit } = req.query;
      const logs = await syncLogRepository.getRecentLogs(parseInt(limit) || 20);
      res.json({ success: true, data: logs });
    } catch (error) {
      logger.error(`Error fetching sync logs: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch sync logs' });
    }
  }
}

module.exports = new SyncController();
