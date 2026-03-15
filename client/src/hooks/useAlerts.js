// client/src/hooks/useAlerts.js
// Custom hook for fetching and caching global alerts data

import { useState, useEffect, useCallback, useRef } from 'react';
import { alertAPI } from '../services/api';

const CACHE_DURATION = 5 * 60 * 1000; // Cache for 5 minutes

export function useAlerts(filters = {}) {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef({ data: null, timestamp: 0 });
  const statsCacheRef = useRef({ data: null, timestamp: 0 });

  const fetchAlerts = useCallback(async (forceRefresh = false) => {
    const now = Date.now();

    // Return cached data if fresh
    if (!forceRefresh && cacheRef.current.data && now - cacheRef.current.timestamp < CACHE_DURATION) {
      setAlerts(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await alertAPI.getAll(filters);
      const data = response.data || [];
      cacheRef.current = { data, timestamp: now };
      setAlerts(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    const now = Date.now();
    if (statsCacheRef.current.data && now - statsCacheRef.current.timestamp < CACHE_DURATION) {
      setStats(statsCacheRef.current.data);
      return;
    }

    try {
      const response = await alertAPI.getStats();
      const data = response.data || [];
      statsCacheRef.current = { data, timestamp: now };
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch alert stats:', err);
    }
  }, []);

  const refresh = useCallback(() => {
    cacheRef.current = { data: null, timestamp: 0 };
    statsCacheRef.current = { data: null, timestamp: 0 };
    fetchAlerts(true);
    fetchStats();
  }, [fetchAlerts, fetchStats]);

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [fetchAlerts, fetchStats]);

  return { alerts, stats, loading, error, refresh };
}
