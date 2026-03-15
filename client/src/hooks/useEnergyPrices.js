// client/src/hooks/useEnergyPrices.js
// Custom hook for fetching and caching energy price data

import { useState, useEffect, useCallback, useRef } from 'react';
import { energyAPI } from '../services/api';

const CACHE_DURATION = 5 * 60 * 1000; // Cache for 5 minutes

export function useEnergyPrices() {
  const [latestPrices, setLatestPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef({ data: null, timestamp: 0 });

  const fetchLatestPrices = useCallback(async (forceRefresh = false) => {
    const now = Date.now();

    if (!forceRefresh && cacheRef.current.data && now - cacheRef.current.timestamp < CACHE_DURATION) {
      setLatestPrices(cacheRef.current.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await energyAPI.getLatest();
      const data = response.data || [];
      cacheRef.current = { data, timestamp: now };
      setLatestPrices(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch latest prices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    cacheRef.current = { data: null, timestamp: 0 };
    fetchLatestPrices(true);
  }, [fetchLatestPrices]);

  useEffect(() => {
    fetchLatestPrices();
  }, [fetchLatestPrices]);

  return { latestPrices, loading, error, refresh };
}

export function usePriceHistory(commodity, months = 12) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!commodity) return;
    try {
      setLoading(true);
      setError(null);
      const response = await energyAPI.getHistory(commodity, months);
      setHistory(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch price history:', err);
    } finally {
      setLoading(false);
    }
  }, [commodity, months]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refresh: fetchHistory };
}
