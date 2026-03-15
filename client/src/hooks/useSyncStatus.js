// client/src/hooks/useSyncStatus.js
// Custom hook for monitoring sync status

import { useState, useEffect, useCallback } from 'react';
import { syncAPI } from '../services/api';

export function useSyncStatus() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const statusRes = await syncAPI.getStatus();
      const logsRes = await syncAPI.getLogs(10);
      setStatus(statusRes.data);
      setLogs(logsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch sync status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll every 2 minutes for status updates
    const interval = setInterval(fetchStatus, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { status, logs, loading, refresh: fetchStatus };
}
