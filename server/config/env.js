// server/config/env.js
// Centralized environment variable access

require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT, 10) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ripple-effect',

  // EIA API configuration
  eia: {
    apiKey: process.env.EIA_API_KEY,
    baseUrl: process.env.EIA_BASE_URL || 'https://api.eia.gov/v2',
  },

  // NewsData.io API configuration
  newsData: {
    apiKey: process.env.NEWSDATA_API_KEY,
    baseUrl: process.env.NEWSDATA_BASE_URL || 'https://newsdata.io/api/1',
  },

  // Mapbox token
  mapbox: {
    token: process.env.MAPBOX_TOKEN,
  },

  // Sync interval
  syncIntervalMinutes: parseInt(process.env.SYNC_INTERVAL_MINUTES, 10) || 45,
};

module.exports = env;
