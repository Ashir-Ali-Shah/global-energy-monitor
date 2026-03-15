// server/repositories/energyPriceRepository.js
// Data access layer for EnergyPrice model

const EnergyPrice = require('../models/EnergyPrice');
const logger = require('../utils/logger');

class EnergyPriceRepository {
  /**
   * Upsert an energy price record
   * @param {Object} priceData - Price data
   * @returns {Promise<Object>} Upserted price record
   */
  async upsert(priceData) {
    try {
      return await EnergyPrice.findOneAndUpdate(
        { seriesId: priceData.seriesId, period: priceData.period },
        priceData,
        { upsert: true, new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error upserting energy price: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk upsert multiple price records
   * @param {Array} prices - Array of price data
   * @returns {Promise<Object>} Bulk write result
   */
  async bulkUpsert(prices) {
    if (!prices || prices.length === 0) return { inserted: 0, updated: 0 };

    try {
      const operations = prices.map((price) => ({
        updateOne: {
          filter: { seriesId: price.seriesId, period: price.period },
          update: { $set: price },
          upsert: true,
        },
      }));

      const result = await EnergyPrice.bulkWrite(operations, { ordered: false });
      return {
        inserted: result.upsertedCount || 0,
        updated: result.modifiedCount || 0,
      };
    } catch (error) {
      logger.error(`Error in bulk upsert prices: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find prices by commodity with optional date range
   * @param {string} commodity - Commodity type
   * @param {Object} dateRange - Optional { from, to } date range
   * @param {number} limit - Max records to return
   * @returns {Promise<Array>} Price records
   */
  async findByCommodity(commodity, dateRange = {}, limit = 100) {
    const query = { commodity };
    if (dateRange.from || dateRange.to) {
      query.date = {};
      if (dateRange.from) query.date.$gte = new Date(dateRange.from);
      if (dateRange.to) query.date.$lte = new Date(dateRange.to);
    }

    return await EnergyPrice.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get the latest price for each commodity
   * @returns {Promise<Array>} Latest prices per commodity
   */
  async getLatestPrices() {
    return await EnergyPrice.aggregate([
      { $sort: { date: -1 } },
      {
        $group: {
          _id: '$commodity',
          latestPrice: { $first: '$value' },
          unit: { $first: '$unit' },
          date: { $first: '$date' },
          trend: { $first: '$trend' },
          changePercent: { $first: '$changePercent' },
          seriesDescription: { $first: '$seriesDescription' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Get price history for charting
   * @param {string} commodity - Commodity type
   * @param {number} months - Number of months to look back
   * @returns {Promise<Array>} Price history
   */
  async getPriceHistory(commodity, months = 12) {
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - months);

    return await EnergyPrice.find({
      commodity,
      date: { $gte: fromDate },
    })
      .sort({ date: 1 })
      .lean();
  }

  /**
   * Get all prices for all commodities (latest N records each)
   * @param {number} limit - Records per commodity
   * @returns {Promise<Array>} All price data
   */
  async getAllPrices(limit = 50) {
    return await EnergyPrice.find()
      .sort({ date: -1 })
      .limit(limit * 6) // 6 commodity types
      .lean();
  }

  /**
   * Get total count
   * @returns {Promise<number>} Count
   */
  async count() {
    return await EnergyPrice.countDocuments();
  }
}

module.exports = new EnergyPriceRepository();
