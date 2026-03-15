// server/services/newsDataService.js
// NewsData.io API client — Single Responsibility: handles only news/logistics data
// Fetches conflict and logistics alert articles from NewsData.io

const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const alertRepository = require('../repositories/alertRepository');
const syncLogRepository = require('../repositories/syncLogRepository');
const { countryToCoordinates, calculateSentiment, truncateText } = require('../utils/helpers');

class NewsDataService {
  constructor() {
    this.apiKey = env.newsData.apiKey;
    this.baseUrl = env.newsData.baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });

    // Search queries for energy & conflict-related news
    this.searchQueries = [
      {
        q: 'oil price petroleum crude',
        category: 'petroleum',
      },
      {
        q: 'natural gas price LNG',
        category: 'natural-gas',
      },
      {
        q: 'energy crisis fuel shortage',
        category: 'energy',
      },
      {
        q: 'conflict war military logistics supply chain',
        category: 'conflict',
      },
      {
        q: 'shipping logistics trade disruption',
        category: 'logistics',
      },
    ];
  }

  /**
   * Fetch news articles from NewsData.io
   * @param {string} query - Search query
   * @param {string} language - Language filter
   * @returns {Promise<Object>} API response
   */
  async fetchNews(query, language = 'en') {
    try {
      const response = await this.client.get('/latest', {
        params: {
          apikey: this.apiKey,
          q: query,
          language,
          size: 10, // Max per request for free tier
        },
      });
      return response.data;
    } catch (error) {
      logger.error(`NewsData API error: ${error.message}`);
      if (error.response) {
        logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Transform raw NewsData response to our GlobalAlert schema
   * @param {Object} rawData - Raw API response
   * @param {string} category - Alert category
   * @returns {Array} Transformed alert records
   */
  transformArticles(rawData, category) {
    if (!rawData?.results || !Array.isArray(rawData.results)) {
      logger.warn(`No results in NewsData response for category: ${category}`);
      return [];
    }

    return rawData.results
      .filter((article) => article.title) // Skip articles without titles
      .map((article) => {
        const country = article.country?.[0] || 'Unknown';
        const location = countryToCoordinates(country);
        const fullText = `${article.title || ''} ${article.description || ''} ${article.content || ''}`;
        const sentimentScore = calculateSentiment(fullText);

        // Determine severity from sentiment
        let severity = 'medium';
        if (sentimentScore < -0.3) severity = 'critical';
        else if (sentimentScore < -0.1) severity = 'high';
        else if (sentimentScore > 0.2) severity = 'low';

        return {
          sourceId: article.article_id || article.link || `newsdata-${Date.now()}-${Math.random()}`,
          title: article.title,
          description: truncateText(article.description, 500),
          content: truncateText(article.content, 1000),
          source: 'newsdata',
          sourceUrl: article.link || '',
          location,
          country,
          category,
          sentimentScore: parseFloat(sentimentScore.toFixed(3)),
          severity,
          keywords: article.keywords || [],
          imageUrl: article.image_url || '',
          publishedAt: article.pubDate ? new Date(article.pubDate) : new Date(),
          isActive: true,
        };
      });
  }

  /**
   * Perform a full sync of all news queries
   * @param {boolean} force - Force sync bypassing rate limit check
   * @returns {Promise<Object>} Sync result summary
   */
  async syncAllNews(force = false) {
    // Check if we should sync based on rate limiting, unless forced
    const shouldSync = force || await syncLogRepository.shouldSync('newsdata', env.syncIntervalMinutes);
    if (!shouldSync) {
      logger.info('NewsData sync skipped — within rate limit interval');
      return { skipped: true, message: 'Within rate limit interval' };
    }

    const syncLog = await syncLogRepository.create({
      service: 'newsdata',
      status: 'started',
      syncStartedAt: new Date(),
    });

    const startTime = Date.now();
    let totalFetched = 0;
    let totalInserted = 0;
    let totalUpdated = 0;

    try {
      for (const search of this.searchQueries) {
        logger.info(`Fetching NewsData for: ${search.category} (${search.q})`);

        try {
          const rawData = await this.fetchNews(search.q);
          const transformed = this.transformArticles(rawData, search.category);
          totalFetched += transformed.length;

          if (transformed.length > 0) {
            const result = await alertRepository.bulkUpsert(transformed);
            totalInserted += result.inserted;
            totalUpdated += result.updated;
            logger.info(`  → ${search.category}: ${transformed.length} articles (${result.inserted} new, ${result.updated} updated)`);
          }
        } catch (queryError) {
          logger.error(`  → Failed for ${search.category}: ${queryError.message}`);
          // Continue with other queries even if one fails
        }

        // Delay between requests to respect rate limits
        await new Promise((r) => setTimeout(r, 1500));
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

      logger.info(`NewsData sync completed: ${totalFetched} fetched, ${totalInserted} inserted, ${totalUpdated} updated (${duration}ms)`);

      return { totalFetched, totalInserted, totalUpdated, duration };
    } catch (error) {
      await syncLogRepository.update(syncLog._id, {
        status: 'failed',
        errorMessage: error.message,
        durationMs: Date.now() - startTime,
        syncCompletedAt: new Date(),
      });

      logger.error(`NewsData sync failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all active alerts from database
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Alerts
   */
  async getAlerts(filters = {}) {
    return await alertRepository.findAll(filters);
  }

  /**
   * Get alerts by category
   * @param {string} category - Category to filter
   * @returns {Promise<Array>} Filtered alerts
   */
  async getAlertsByCategory(category) {
    return await alertRepository.findByCategory(category);
  }

  /**
   * Get alert statistics
   * @returns {Promise<Array>} Stats by category
   */
  async getAlertStats() {
    return await alertRepository.getStatsByCategory();
  }
}

module.exports = new NewsDataService();
