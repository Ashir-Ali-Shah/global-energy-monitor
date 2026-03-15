// server/models/SyncLog.js
// Tracks synchronization history to manage API rate limits

const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema(
  {
    // Which service performed the sync
    service: {
      type: String,
      required: true,
      enum: ['eia', 'newsdata'],
      index: true,
    },

    // Status of the sync operation
    status: {
      type: String,
      required: true,
      enum: ['started', 'completed', 'failed'],
    },

    // Number of records fetched
    recordsFetched: {
      type: Number,
      default: 0,
    },

    // Number of new records inserted
    recordsInserted: {
      type: Number,
      default: 0,
    },

    // Number of records updated
    recordsUpdated: {
      type: Number,
      default: 0,
    },

    // Error message if sync failed
    errorMessage: {
      type: String,
      default: null,
    },

    // Duration of the sync in milliseconds
    durationMs: {
      type: Number,
      default: 0,
    },

    // Timestamp when the sync started
    syncStartedAt: {
      type: Date,
      default: Date.now,
    },

    // Timestamp when the sync completed
    syncCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding the last sync time efficiently
syncLogSchema.index({ service: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('SyncLog', syncLogSchema);
