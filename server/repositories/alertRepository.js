// server/repositories/alertRepository.js
// Data access layer for GlobalAlert model — handles all MongoDB operations

const GlobalAlert = require('../models/GlobalAlert');
const logger = require('../utils/logger');

class AlertRepository {
  /**
   * Create a new alert
   * @param {Object} alertData - Alert data
   * @returns {Promise<Object>} Created alert
   */
  async create(alertData) {
    try {
      const alert = new GlobalAlert(alertData);
      return await alert.save();
    } catch (error) {
      // Handle duplicate key errors gracefully
      if (error.code === 11000) {
        logger.debug(`Alert already exists: ${alertData.sourceId}`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Upsert an alert (create or update based on sourceId + source)
   * @param {Object} alertData - Alert data
   * @returns {Promise<Object>} Upserted alert
   */
  async upsert(alertData) {
    try {
      return await GlobalAlert.findOneAndUpdate(
        { sourceId: alertData.sourceId, source: alertData.source },
        alertData,
        { upsert: true, new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error upserting alert: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk upsert multiple alerts
   * @param {Array} alerts - Array of alert data
   * @returns {Promise<Object>} Bulk write result
   */
  async bulkUpsert(alerts) {
    if (!alerts || alerts.length === 0) return { inserted: 0, updated: 0 };

    try {
      const operations = alerts.map((alert) => ({
        updateOne: {
          filter: { sourceId: alert.sourceId, source: alert.source },
          update: { $set: alert },
          upsert: true,
        },
      }));

      const result = await GlobalAlert.bulkWrite(operations, { ordered: false });
      return {
        inserted: result.upsertedCount || 0,
        updated: result.modifiedCount || 0,
      };
    } catch (error) {
      logger.error(`Error in bulk upsert: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all active alerts with optional filtering
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options (limit, skip, sort)
   * @returns {Promise<Array>} Array of alerts
   */
  async findAll(filters = {}, options = {}) {
    const {
      limit = 500,
      skip = 0,
      sort = { publishedAt: -1 },
    } = options;

    const query = { isActive: true, ...filters };
    return await GlobalAlert.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Find alerts within a geographic radius
   * @param {number} lng - Longitude
   * @param {number} lat - Latitude
   * @param {number} radiusKm - Radius in kilometers
   * @returns {Promise<Array>} Nearby alerts
   */
  async findNearby(lng, lat, radiusKm = 500) {
    return await GlobalAlert.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radiusKm * 1000, // Convert to meters
        },
      },
      isActive: true,
    }).lean();
  }

  /**
   * Find alerts by category
   * @param {string} category - Alert category
   * @returns {Promise<Array>} Filtered alerts
   */
  async findByCategory(category) {
    return await GlobalAlert.find({ category, isActive: true })
      .sort({ publishedAt: -1 })
      .lean();
  }

  /**
   * Get alert statistics grouped by category
   * @returns {Promise<Array>} Aggregated stats
   */
  async getStatsByCategory() {
    return await GlobalAlert.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgSentiment: { $avg: '$sentimentScore' },
          latestAlert: { $max: '$publishedAt' },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  /**
   * Get total count of active alerts
   * @returns {Promise<number>} Count
   */
  async count(filters = {}) {
    return await GlobalAlert.countDocuments({ isActive: true, ...filters });
  }

  /**
   * Delete old alerts (older than specified days)
   * @param {number} daysOld - Days threshold
   * @returns {Promise<Object>} Delete result
   */
  async deleteOlderThan(daysOld = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    return await GlobalAlert.deleteMany({ publishedAt: { $lt: cutoff } });
  }
}

module.exports = new AlertRepository();
