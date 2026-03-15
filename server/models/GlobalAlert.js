// server/models/GlobalAlert.js
// Mongoose schema for global alerts — stores news/logistics alerts with GeoJSON

const mongoose = require('mongoose');

const globalAlertSchema = new mongoose.Schema(
  {
    // Unique identifier from the source API
    sourceId: {
      type: String,
      required: true,
      index: true,
    },

    // Title of the alert/article
    title: {
      type: String,
      required: true,
    },

    // Description or summary
    description: {
      type: String,
      default: '',
    },

    // Full content of the article
    content: {
      type: String,
      default: '',
    },

    // Source of the alert (e.g., 'newsdata', 'eia')
    source: {
      type: String,
      required: true,
      enum: ['newsdata', 'eia', 'manual'],
    },

    // Original source URL
    sourceUrl: {
      type: String,
      default: '',
    },

    // GeoJSON location data
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 && coords[0] <= 180 &&
              coords[1] >= -90 && coords[1] <= 90
            );
          },
          message: 'Invalid coordinates. Must be [longitude, latitude].',
        },
      },
    },

    // Country/region associated with the alert
    country: {
      type: String,
      default: 'Unknown',
    },

    // Category of the alert
    category: {
      type: String,
      enum: ['petroleum', 'natural-gas', 'conflict', 'logistics', 'energy', 'general'],
      default: 'general',
    },

    // Sentiment score (-1 to 1)
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },

    // Severity level for visual display
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // Keywords extracted from the article
    keywords: {
      type: [String],
      default: [],
    },

    // Image URL if available
    imageUrl: {
      type: String,
      default: '',
    },

    // Publication date of the original article
    publishedAt: {
      type: Date,
      default: Date.now,
    },

    // Whether the alert is currently active
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create 2dsphere index for geospatial queries
globalAlertSchema.index({ location: '2dsphere' });

// Compound index for efficient querying
globalAlertSchema.index({ source: 1, publishedAt: -1 });
globalAlertSchema.index({ category: 1, isActive: 1 });
globalAlertSchema.index({ sourceId: 1, source: 1 }, { unique: true });

module.exports = mongoose.model('GlobalAlert', globalAlertSchema);
