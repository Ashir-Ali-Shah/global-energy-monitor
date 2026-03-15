// client/src/services/api.js
// Centralized API client for communicating with the backend

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error';
    console.error(`API Error: ${message}`);
    return Promise.reject(new Error(message));
  }
);

// ─── Alert API ────────────────────────────────────────────
export const alertAPI = {
  getAll: (params = {}) => apiClient.get('/alerts', { params }),
  getStats: () => apiClient.get('/alerts/stats'),
  getNearby: (lng, lat, radius = 500) =>
    apiClient.get('/alerts/nearby', { params: { lng, lat, radius } }),
  triggerSync: () => apiClient.post('/alerts/sync'),
};

// ─── Energy Price API ─────────────────────────────────────
export const energyAPI = {
  getLatest: () => apiClient.get('/energy/latest'),
  getHistory: (commodity, months = 12) =>
    apiClient.get(`/energy/history/${commodity}`, { params: { months } }),
  getAll: (limit = 50) => apiClient.get('/energy/all', { params: { limit } }),
  triggerSync: () => apiClient.post('/energy/sync'),
};

// ─── Sync API ─────────────────────────────────────────────
export const syncAPI = {
  getStatus: () => apiClient.get('/sync/status'),
  getLogs: (limit = 20) => apiClient.get('/sync/logs', { params: { limit } }),
};

// ─── Health API ───────────────────────────────────────────
export const healthAPI = {
  check: () => apiClient.get('/health'),
};

export default apiClient;
