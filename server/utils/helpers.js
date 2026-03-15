// server/utils/helpers.js
// Reusable utility helpers for date formatting, coordinate conversion, etc.

/**
 * Formats a date to ISO string without milliseconds
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date = new Date()) => {
  return date.toISOString().split('.')[0] + 'Z';
};

/**
 * Formats a date to YYYY-MM-DD for API queries
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
const formatDateForAPI = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

/**
 * Converts a country/region name to approximate GeoJSON coordinates.
 * Used when news articles don't provide exact coordinates.
 * @param {string} country - Country name
 * @returns {Object} GeoJSON Point object
 */
const countryToCoordinates = (country) => {
  const coordinateMap = {
    // Major oil/gas producing regions
    'united states': { lng: -95.7129, lat: 37.0902 },
    'usa': { lng: -95.7129, lat: 37.0902 },
    'russia': { lng: 105.3188, lat: 61.524 },
    'saudi arabia': { lng: 45.0792, lat: 23.8859 },
    'iran': { lng: 53.688, lat: 32.4279 },
    'iraq': { lng: 43.6793, lat: 33.2232 },
    'china': { lng: 104.1954, lat: 35.8617 },
    'india': { lng: 78.9629, lat: 20.5937 },
    'brazil': { lng: -51.9253, lat: -14.235 },
    'canada': { lng: -106.3468, lat: 56.1304 },
    'nigeria': { lng: 8.6753, lat: 9.082 },
    'venezuela': { lng: -66.5897, lat: 6.4238 },
    'norway': { lng: 8.4689, lat: 60.472 },
    'united arab emirates': { lng: 53.8478, lat: 23.4241 },
    'uae': { lng: 53.8478, lat: 23.4241 },
    'kuwait': { lng: 47.4818, lat: 29.3117 },
    'libya': { lng: 17.2283, lat: 26.3351 },
    'algeria': { lng: 1.6596, lat: 28.0339 },
    'qatar': { lng: 51.1839, lat: 25.3548 },
    'angola': { lng: 17.8739, lat: -11.2027 },
    'mexico': { lng: -102.5528, lat: 23.6345 },
    'kazakhstan': { lng: 66.9237, lat: 48.0196 },
    'ukraine': { lng: 31.1656, lat: 48.3794 },
    'israel': { lng: 34.8516, lat: 31.0461 },
    'palestine': { lng: 35.2332, lat: 31.9522 },
    'yemen': { lng: 48.5164, lat: 15.5527 },
    'syria': { lng: 38.9968, lat: 34.8021 },
    'turkey': { lng: 35.2433, lat: 38.9637 },
    'egypt': { lng: 30.8025, lat: 26.8206 },
    'germany': { lng: 10.4515, lat: 51.1657 },
    'united kingdom': { lng: -3.436, lat: 55.3781 },
    'uk': { lng: -3.436, lat: 55.3781 },
    'france': { lng: 2.2137, lat: 46.2276 },
    'japan': { lng: 138.2529, lat: 36.2048 },
    'south korea': { lng: 127.7669, lat: 35.9078 },
    'australia': { lng: 133.7751, lat: -25.2744 },
    'indonesia': { lng: 113.9213, lat: -0.7893 },
    'malaysia': { lng: 101.9758, lat: 4.2105 },
    'oman': { lng: 55.9754, lat: 21.4735 },
    'colombia': { lng: -74.2973, lat: 4.5709 },
    'argentina': { lng: -63.6167, lat: -38.4161 },
    'south africa': { lng: 22.9375, lat: -30.5595 },
    'poland': { lng: 19.1451, lat: 51.9194 },
    'netherlands': { lng: 5.2913, lat: 52.1326 },
  };

  const key = (country || '').toLowerCase().trim();
  const coords = coordinateMap[key];

  if (coords) {
    return {
      type: 'Point',
      coordinates: [coords.lng, coords.lat],
    };
  }

  // Default to center of world map if country not found
  return {
    type: 'Point',
    coordinates: [0, 20],
  };
};

/**
 * Calculates a simple sentiment score from text content.
 * Returns a value between -1 (very negative) and 1 (very positive).
 * @param {string} text - The text to analyze
 * @returns {number} Sentiment score
 */
const calculateSentiment = (text) => {
  try {
    const Sentiment = require('sentiment');
    const sentiment = new Sentiment();
    const result = sentiment.analyze(text || '');
    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, result.comparative));
  } catch {
    return 0;
  }
};

/**
 * Truncates text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
const truncateText = (text, maxLength = 300) => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
};

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Resolves after delay
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  formatDate,
  formatDateForAPI,
  countryToCoordinates,
  calculateSentiment,
  truncateText,
  delay,
};
