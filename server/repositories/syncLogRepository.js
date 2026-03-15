// server/repositories/syncLogRepository.js
// Data access layer for SyncLog model — tracks sync operations

const SyncLog = require('../models/SyncLog');
const logger = require('../utils/logger');

class SyncLogRepository {
  /**
   * Create a new sync log entry
   * @param {Object} logData - Sync log data
   * @returns {Promise<Object>} Created log
   */
  async create(logData) {
    try {
      const log = new SyncLog(logData);
      return await log.save();
    } catch (error) {
      logger.error(`Error creating sync log: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing sync log (e.g., mark as completed)
   * @param {string} logId - Log document ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated log
   */
  async update(logId, updateData) {
    return await SyncLog.findByIdAndUpdate(logId, updateData, { new: true });
  }

  /**
   * Get the last successful sync for a given service
   * @param {string} service - Service name ('eia' or 'newsdata')
   * @returns {Promise<Object|null>} Last sync log or null
   */
  async getLastSuccessfulSync(service) {
    return await SyncLog.findOne({
      service,
      status: 'completed',
    })
      .sort({ syncCompletedAt: -1 })
      .lean();
  }

  /**
   * Check if a sync should be performed based on the interval
   * @param {string} service - Service name
   * @param {number} intervalMinutes - Minimum interval between syncs
   * @returns {Promise<boolean>} Whether sync should be performed
   */
  async shouldSync(service, intervalMinutes = 45) {
    const lastSync = await this.getLastSuccessfulSync(service);
    if (!lastSync) return true;

    const elapsed = Date.now() - new Date(lastSync.syncCompletedAt).getTime();
    const intervalMs = intervalMinutes * 60 * 1000;
    return elapsed >= intervalMs;
  }

  /**
   * Get recent sync logs
   * @param {number} limit - Max records
   * @returns {Promise<Array>} Recent logs
   */
  async getRecentLogs(limit = 20) {
    return await SyncLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get sync status overview
   * @returns {Promise<Object>} Status for each service
   */
  async getSyncStatus() {
    const services = ['eia', 'newsdata'];
    const status = {};

    for (const service of services) {
      const lastSync = await this.getLastSuccessfulSync(service);
      const shouldSync = await this.shouldSync(service);
      status[service] = {
        lastSync: lastSync ? lastSync.syncCompletedAt : null,
        recordsFetched: lastSync ? lastSync.recordsFetched : 0,
        shouldSync,
      };
    }

    return status;
  }
}

module.exports = new SyncLogRepository();
