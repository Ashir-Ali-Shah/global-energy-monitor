// client/src/components/PriceCards.jsx
// Energy price cards showing latest commodity prices — light theme

import { useEnergyPrices } from '../hooks/useEnergyPrices';

const COMMODITY_META = {
  'crude-oil': {
    icon: '🛢️',
    label: 'Crude Oil (WTI)',
    accent: '#c45e2a',
    bg: '#fdf6f1',
  },
  gasoline: {
    icon: '⛽',
    label: 'Gasoline',
    accent: '#1a7d5c',
    bg: '#f1faf6',
  },
  diesel: {
    icon: '🏭',
    label: 'Diesel',
    accent: '#c45e2a',
    bg: '#fdf6f1',
  },
  'heating-oil': {
    icon: '🔥',
    label: 'Heating Oil',
    accent: '#b5850a',
    bg: '#fdf9ed',
  },
  'natural-gas': {
    icon: '💨',
    label: 'Natural Gas',
    accent: '#1a6fa0',
    bg: '#f0f7fd',
  },
  propane: {
    icon: '🧪',
    label: 'Propane',
    accent: '#6c63ff',
    bg: '#f5f4ff',
  },
};

export default function PriceCards() {
  const { latestPrices, loading, error } = useEnergyPrices();

  if (loading) {
    return (
      <div className="price-cards-grid" id="price-cards">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="price-card skeleton">
            <div className="skeleton-line w60" />
            <div className="skeleton-line w80" />
            <div className="skeleton-line w40" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="price-cards-error" id="price-cards">
        <p>⚠️ Unable to load energy prices</p>
        <small>{error}</small>
      </div>
    );
  }

  if (!latestPrices || latestPrices.length === 0) {
    return (
      <div className="price-cards-empty" id="price-cards">
        <p>📊 No price data available yet. Data syncs every 45 minutes.</p>
      </div>
    );
  }

  return (
    <div className="price-cards-grid" id="price-cards">
      {latestPrices.map((price) => {
        const meta = COMMODITY_META[price._id] || {
          icon: '📊',
          label: price._id,
          accent: '#6c63ff',
          bg: '#f5f4ff',
        };
        const isNegative = price.changePercent < 0;
        const trendColor = isNegative ? '#d1293d' : '#1a7d5c';
        const trendIcon = isNegative ? '▼' : '▲';

        return (
          <div
            key={price._id}
            className="price-card"
            style={{ background: meta.bg, borderTopColor: meta.accent, borderTopWidth: 3 }}
          >
            <div className="price-card-header">
              <span className="price-card-icon">{meta.icon}</span>
              <span className="price-card-label">{meta.label}</span>
            </div>
            <div className="price-card-value" style={{ color: meta.accent }}>
              ${price.latestPrice?.toFixed(2) || 'N/A'}
              <span className="price-card-unit">{price.unit}</span>
            </div>
            <div className="price-card-trend" style={{ color: trendColor }}>
              <span className="trend-icon">{trendIcon}</span>
              <span className="trend-value">{Math.abs(price.changePercent || 0).toFixed(2)}%</span>
              <span className="trend-label">{price.trend || 'stable'}</span>
            </div>
            <div className="price-card-date">
              {price.date
                ? new Date(price.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                : '—'}
            </div>
          </div>
        );
      })}
    </div>
  );
}