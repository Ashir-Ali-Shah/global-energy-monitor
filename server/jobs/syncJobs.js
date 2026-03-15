// server/jobs/syncJobs.js
// Cron job definitions for periodic data synchronization
// Uses node-cron to schedule EIA and NewsData syncs

const cron = require('node-cron');
const logger = require('../utils/logger');
const eiaService = require('../services/eiaService');
const newsDataService = require('../services/newsDataService');
const env = require('../config/env');

class SyncJobs {
  constructor() {
    this.jobs = [];
  }

  /**
   * Initialize and start all cron jobs
   */
  start() {
    logger.info(`Starting cron jobs (sync interval: every ${env.syncIntervalMinutes} minutes)`);

    // Schedule EIA sync — every 45 minutes
    const eiaJob = cron.schedule(`*/${env.syncIntervalMinutes} * * * *`, async () => {
      logger.info('⏰ Cron: Starting EIA energy price sync...');
      try {
        const result = await eiaService.syncAllPrices();
        if (result.skipped) {
          logger.info('⏰ Cron: EIA sync was skipped (within interval)');
        } else {
          logger.info(`⏰ Cron: EIA sync done — ${result.totalFetched} records`);
        }
      } catch (error) {
        logger.error(`⏰ Cron: EIA sync failed — ${error.message}`);
      }
    });

    // Schedule NewsData sync — every 45 minutes (offset by ~22 mins to spread load)
    const newsJob = cron.schedule(`*/${env.syncIntervalMinutes} * * * *`, async () => {
      // Offset by 22 minutes to avoid hitting both APIs simultaneously
      await new Promise((r) => setTimeout(r, 22 * 60 * 1000));
      logger.info('⏰ Cron: Starting NewsData logistics alert sync...');
      try {
        const result = await newsDataService.syncAllNews();
        if (result.skipped) {
          logger.info('⏰ Cron: NewsData sync was skipped (within interval)');
        } else {
          logger.info(`⏰ Cron: NewsData sync done — ${result.totalFetched} articles`);
        }
      } catch (error) {
        logger.error(`⏰ Cron: NewsData sync failed — ${error.message}`);
      }
    });

    this.jobs.push(eiaJob, newsJob);
    logger.info('Cron jobs scheduled successfully');
  }

  /**
   * Run an initial sync on server startup
   */
  async runInitialSync() {
    logger.info('Running initial data sync on startup...');

    try {
      // Sync EIA data
      logger.info('Initial sync: EIA energy prices...');
      const eiaResult = await eiaService.syncAllPrices();
      logger.info(`Initial EIA sync: ${JSON.stringify(eiaResult)}`);
    } catch (error) {
      logger.error(`Initial EIA sync failed: ${error.message}`);
    }

    try {
      // Sync NewsData after a short delay
      await new Promise((r) => setTimeout(r, 2000));
      logger.info('Initial sync: NewsData logistics alerts...');
      const newsResult = await newsDataService.syncAllNews();
      logger.info(`Initial NewsData sync: ${JSON.stringify(newsResult)}`);
    } catch (error) {
      logger.error(`Initial NewsData sync failed: ${error.message}`);
    }
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    this.jobs.forEach((job) => job.stop());
    logger.info('All cron jobs stopped');
  }
}

module.exports = new SyncJobs();
