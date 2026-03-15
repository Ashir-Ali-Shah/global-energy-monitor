// server/models/EnergyPrice.js
// Mongoose schema for energy price data from EIA API

const mongoose = require('mongoose');

const energyPriceSchema = new mongoose.Schema(
  {
    // Type of energy commodity
    commodity: {
      type: String,
      required: true,
      enum: ['crude-oil', 'gasoline', 'diesel', 'heating-oil', 'natural-gas', 'propane'],
    },

    // Sub-type or series name from EIA
    seriesId: {
      type: String,
      required: true,
    },

    // Human-readable series description
    seriesDescription: {
      type: String,
      default: '',
    },

    // Price value
    value: {
      type: Number,
      required: true,
    },

    // Unit of measurement (e.g., $/barrel, $/gallon, $/MMBtu)
    unit: {
      type: String,
      default: 'USD',
    },

    // The period this price applies to (e.g., '2024-01', 'weekly')
    period: {
      type: String,
      required: true,
    },

    // Date of the price observation
    date: {
      type: Date,
      required: true,
    },

    // Region this price applies to
    region: {
      type: String,
      default: 'US',
    },

    // GeoJSON for the region center (for map visualization)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    // Percentage change from previous period
    changePercent: {
      type: Number,
      default: 0,
    },

    // Direction of price movement
    trend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'stable',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
energyPriceSchema.index({ commodity: 1, date: -1 });
energyPriceSchema.index({ seriesId: 1, period: 1 }, { unique: true });
energyPriceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EnergyPrice', energyPriceSchema);
