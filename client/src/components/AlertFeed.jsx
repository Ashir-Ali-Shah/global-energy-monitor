// client/src/components/AlertFeed.jsx
// Real-time scrollable feed of latest alerts/news

import { useApp } from '../context/AppContext';

const SEVERITY_COLORS = {
  critical: '#ff2d55',
  high: '#ff6b35',
  medium: '#ffbe0b',
  low: '#06d6a0',
};

const CATEGORY_ICONS = {
  petroleum: '🛢️',
  'natural-gas': '🔥',
  conflict: '⚔️',
  logistics: '🚢',
  energy: '⚡',
  general: '📰',
};

export default function AlertFeed({ alerts = [], loading }) {
  const { filterCategory, setFilterCategory, setSelectedAlert } = useApp();

  const categories = ['all', 'petroleum', 'natural-gas', 'conflict', 'logistics', 'energy'];

  const filteredAlerts = filterCategory === 'all'
    ? alerts
    : alerts.filter((a) => a.category === filterCategory);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="alert-feed" id="alert-feed">
      <div className="feed-header">
        <h3>🔔 Live Alerts</h3>
        <span className="alert-count">{filteredAlerts.length}</span>
      </div>

      <div className="feed-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat === 'all' ? '🌍 All' : `${CATEGORY_ICONS[cat] || ''} ${cat}`}
          </button>
        ))}
      </div>

      <div className="feed-list">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="alert-item skeleton">
              <div className="skeleton-line w80" />
              <div className="skeleton-line w60" />
            </div>
          ))
        ) : filteredAlerts.length === 0 ? (
          <div className="feed-empty">
            <p>No alerts in this category yet.</p>
          </div>
        ) : (
          filteredAlerts.slice(0, 50).map((alert) => (
            <div
              key={alert._id || alert.sourceId}
              className="alert-item"
              onClick={() => setSelectedAlert(alert)}
              style={{ borderLeftColor: SEVERITY_COLORS[alert.severity] }}
            >
              <div className="alert-item-header">
                <span className="alert-item-icon">{CATEGORY_ICONS[alert.category] || '📰'}</span>
                <span
                  className="alert-item-severity"
                  style={{ color: SEVERITY_COLORS[alert.severity] }}
                >
                  {alert.severity}
                </span>
                <span className="alert-item-time">{formatTime(alert.publishedAt)}</span>
              </div>
              <h4 className="alert-item-title">{alert.title}</h4>
              <div className="alert-item-meta">
                <span className="alert-item-country">📍 {alert.country || 'Unknown'}</span>
                <span className={`alert-item-sentiment ${(alert.sentimentScore || 0) < 0 ? 'negative' : 'positive'}`}>
                  {(alert.sentimentScore || 0) < 0 ? '😟' : '😊'} {(alert.sentimentScore || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
