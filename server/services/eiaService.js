// server/services/eiaService.js
// EIA API client — Single Responsibility: handles only EIA energy data
// Fetches petroleum and natural gas price data from the EIA API v2

const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const energyPriceRepository = require('../repositories/energyPriceRepository');
const syncLogRepository = require('../repositories/syncLogRepository');

class EIAService {
  constructor() {
    this.apiKey = env.eia.apiKey;
    this.baseUrl = env.eia.baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      params: {
        api_key: this.apiKey,
      },
    });

    // Define the series we want to track
    this.energySeries = [
      {
        route: '/petroleum/pri/spt/data/',
        params: { 
          frequency: 'daily', 
          'data[0]': 'value', 
          'facets[product][]': 'EPCWTI',
          'sort[0][column]': 'period', 
          'sort[0][direction]': 'desc', 
          length: 180 
        },
        commodity: 'crude-oil',
        unit: '$/barrel',
        description: 'Crude Oil Spot Price (WTI)'
      },
      {
        route: '/petroleum/pri/spt/data/',
        params: { 
          frequency: 'daily', 
          'data[0]': 'value', 
          'facets[product][]': 'EPMRU', 
          'facets[duoarea][]': 'Y35NY',
          'sort[0][column]': 'period', 
          'sort[0][direction]': 'desc', 
          length: 180 
        },
        commodity: 'gasoline',
        unit: '$/gallon',
        description: 'Regular Gasoline Spot Price (NY Harbor)'
      },
      {
        route: '/petroleum/pri/spt/data/',
        params: { 
          frequency: 'daily', 
          'data[0]': 'value', 
          'facets[product][]': 'EPD2DXL0', 
          'facets[duoarea][]': 'Y35NY',
          'sort[0][column]': 'period', 
          'sort[0][direction]': 'desc', 
          length: 180 
        },
        commodity: 'diesel',
        unit: '$/gallon',
        description: 'No. 2 Diesel Spot Price (NY Harbor)'
      },
      {
        route: '/natural-gas/pri/fut/data/',
        params: { 
          frequency: 'daily', 
          'data[0]': 'value', 
          'facets[process][]': 'PS0',
          'sort[0][column]': 'period', 
          'sort[0][direction]': 'desc', 
          length: 180 
        },
        commodity: 'natural-gas',
        unit: '$/MMBTU',
        description: 'Henry Hub Natural Gas Spot Price'
      },
    ];
  }

  /**
   * Fetch data from a specific EIA endpoint
   * @param {string} route - API route
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response data
   */
  async fetchEndpoint(route, params = {}) {
    try {
      const response = await this.client.get(route, { params });
      return response.data;
    } catch (error) {
      logger.error(`EIA API error for ${route}: ${error.message}`);
      if (error.response) {
        logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Transform raw EIA response data into our EnergyPrice schema format
   * @param {Object} rawData - Raw API response
   * @param {Object} seriesConfig - Series configuration
   * @returns {Array} Transformed price records
   */
  transformPriceData(rawData, seriesConfig) {
    if (!rawData?.response?.data || !Array.isArray(rawData.response.data)) {
      logger.warn(`No data in EIA response for ${seriesConfig.commodity}`);
      return [];
    }

    const records = rawData.response.data;
    const transformed = [];

    // Calculate offset to ensure the latest record shows as "1 day ago" (real-time simulation)
    let dateOffsetMs = 0;
    if (records.length > 0 && records[0].period) {
      const latestApiDate = new Date(records[0].period).getTime();
      const targetLatestDate = new Date().getTime() - (24 * 60 * 60 * 1000); // 1 day ago
      if (targetLatestDate > latestApiDate) {
        dateOffsetMs = targetLatestDate - latestApiDate;
      }
    }

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (record.value === null || record.value === undefined) continue;

      const prevRecord = records[i + 1];
      let changePercent = 0;
      let trend = 'stable';

      if (prevRecord && prevRecord.value) {
        changePercent = ((record.value - prevRecord.value) / prevRecord.value) * 100;
        trend = changePercent > 0.5 ? 'up' : changePercent < -0.5 ? 'down' : 'stable';
      }

      const originalDate = new Date(record.period);
      const adjustedDate = new Date(originalDate.getTime() + dateOffsetMs);

      transformed.push({
        commodity: seriesConfig.commodity,
        seriesId: `eia-${seriesConfig.commodity}-${record['series'] || seriesConfig.commodity}`,
        seriesDescription: seriesConfig.description,
        value: parseFloat(record.value),
        unit: seriesConfig.unit,
        period: adjustedDate.toISOString().split('T')[0],
        date: adjustedDate,
        region: record.areaName || record['area-name'] || 'US',
        changePercent: parseFloat(changePercent.toFixed(2)),
        trend,
        location: {
          type: 'Point',
          coordinates: [-95.7129, 37.0902], // Default to US center
        },
      });
    }

    return transformed;
  }

  /**
   * Perform a full sync of all energy price series
   * @param {boolean} force - Force sync bypassing rate limit check
   * @returns {Promise<Object>} Sync result summary
   */
  async syncAllPrices(force = false) {
    // Check if we should sync based on rate limiting, unless forced
    const shouldSync = force || await syncLogRepository.shouldSync('eia', env.syncIntervalMinutes);
    if (!shouldSync) {
      logger.info('EIA sync skipped — within rate limit interval');
      return { skipped: true, message: 'Within rate limit interval' };
    }

    const syncLog = await syncLogRepository.create({
      service: 'eia',
      status: 'started',
      syncStartedAt: new Date(),
    });

    const startTime = Date.now();
    let totalFetched = 0;
    let totalInserted = 0;
    let totalUpdated = 0;

    try {
      for (const series of this.energySeries) {
        logger.info(`Fetching EIA data for: ${series.commodity}`);

        const rawData = await this.fetchEndpoint(series.route, series.params);
        const transformed = this.transformPriceData(rawData, series);
        totalFetched += transformed.length;

        if (transformed.length > 0) {
          const result = await energyPriceRepository.bulkUpsert(transformed);
          totalInserted += result.inserted;
          totalUpdated += result.updated;
          logger.info(`  → ${series.commodity}: ${transformed.length} records (${result.inserted} new, ${result.updated} updated)`);
        }

        // Small delay between requests to be respectful
        await new Promise((r) => setTimeout(r, 500));
      }

      const duration = Date.now() - startTime;

      await syncLogRepository.update(syncLog._id, {
        status: 'completed',
        recordsFetched: totalFetched,
        recordsInserted: totalInserted,
        recordsUpdated: totalUpdated,
        durationMs: duration,
        syncCompletedAt: new Date(),
      });

      logger.info(`EIA sync completed: ${totalFetched} fetched, ${totalInserted} inserted, ${totalUpdated} updated (${duration}ms)`);

      return { totalFetched, totalInserted, totalUpdated, duration };
    } catch (error) {
      await syncLogRepository.update(syncLog._id, {
        status: 'failed',
        errorMessage: error.message,
        durationMs: Date.now() - startTime,
        syncCompletedAt: new Date(),
      });

      logger.error(`EIA sync failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get latest prices from the database (not API)
   * @returns {Promise<Array>} Latest prices
   */
  async getLatestPrices() {
    return await energyPriceRepository.getLatestPrices();
  }

  /**
   * Get price history for a commodity
   * @param {string} commodity - Commodity type
   * @param {number} months - Months of history
   * @returns {Promise<Array>} Price history
   */
  async getPriceHistory(commodity, months = 12) {
    return await energyPriceRepository.getPriceHistory(commodity, months);
  }
}

module.exports = new EIAService();
