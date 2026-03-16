// client/src/components/SyncIndicator.jsx
// Shows data sync status and last sync time — light theme

import { useSyncStatus } from '../hooks/useSyncStatus';

export default function SyncIndicator() {
  const { status, loading } = useSyncStatus();

  const formatLastSync = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading || !status) {
    return (
      <div className="sync-indicator" id="sync-indicator">
        <div className="sync-dot syncing" />
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Checking...</span>
      </div>
    );
  }

  return (
    <div className="sync-indicator" id="sync-indicator">
      <div className="sync-services">
        {Object.entries(status).map(([service, info]) => (
          <div key={service} className="sync-service">
            <div className={`sync-dot ${info.shouldSync ? 'pending' : 'synced'}`} />
            <span className="sync-service-name">{service.toUpperCase()}</span>
            <span className="sync-service-time">{formatLastSync(info.lastSync)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}