// client/src/components/AlertDetail.jsx
// Modal/panel showing detailed view of a selected alert — light theme

import { useApp } from '../context/AppContext';

const SEVERITY_COLORS = {
  critical: '#d1293d',
  high: '#c45e2a',
  medium: '#b5850a',
  low: '#1a7d5c',
};

const CATEGORY_ICONS = {
  petroleum: '🛢️',
  'natural-gas': '🔥',
  conflict: '⚔️',
  logistics: '🚢',
  energy: '⚡',
  general: '📰',
};

export default function AlertDetail() {
  const { selectedAlert, clearSelection } = useApp();

  if (!selectedAlert) return null;

  const {
    title,
    description,
    content,
    source,
    sourceUrl,
    country,
    category,
    sentimentScore,
    severity,
    keywords,
    imageUrl,
    publishedAt,
  } = selectedAlert;

  return (
    <div className="alert-detail-overlay" onClick={clearSelection} id="alert-detail">
      <div className="alert-detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={clearSelection}>✕</button>

        <div className="detail-header">
          <div className="detail-badge" style={{ background: SEVERITY_COLORS[severity] }}>
            <span>{CATEGORY_ICONS[category] || '📰'}</span>
            <span>{severity?.toUpperCase()}</span>
          </div>
          <span className="detail-category">{category}</span>
        </div>

        {imageUrl && (
          <div className="detail-image">
            <img
              src={imageUrl}
              alt={title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <h2 className="detail-title">{title}</h2>

        <div className="detail-meta">
          <span>📍 {country || 'Unknown'}</span>
          <span>
            📅{' '}
            {publishedAt
              ? new Date(publishedAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              : '—'}
          </span>
          <span>📡 {source}</span>
        </div>

        <div className="detail-sentiment">
          <span className="sentiment-label">Sentiment Analysis</span>
          <div className="sentiment-bar-container">
            <div
              className="sentiment-bar"
              style={{
                width: `${Math.abs(sentimentScore || 0) * 100}%`,
                background:
                  (sentimentScore || 0) < 0
                    ? 'linear-gradient(90deg, #d1293d, #c45e2a)'
                    : 'linear-gradient(90deg, #1a7d5c, #1a6fa0)',
                marginLeft: (sentimentScore || 0) < 0 ? 'auto' : '50%',
                marginRight: (sentimentScore || 0) >= 0 ? 'auto' : '50%',
              }}
            />
          </div>
          <span
            className="sentiment-value"
            style={{ color: (sentimentScore || 0) < 0 ? '#d1293d' : '#1a7d5c' }}
          >
            {(sentimentScore || 0).toFixed(3)}
          </span>
        </div>

        {description && (
          <div className="detail-section">
            <h4>Summary</h4>
            <p>{description}</p>
          </div>
        )}

        {content && (
          <div className="detail-section">
            <h4>Content</h4>
            <p>{content}</p>
          </div>
        )}

        {keywords && keywords.length > 0 && (
          <div className="detail-keywords">
            <h4>Keywords</h4>
            <div className="keyword-chips">
              {keywords.map((kw, idx) => (
                <span key={idx} className="keyword-chip">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {sourceUrl && (
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="detail-link">
            Read Full Article →
          </a>
        )}
      </div>
    </div>
  );
}