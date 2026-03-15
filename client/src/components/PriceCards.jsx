// client/src/components/PriceCards.jsx
// Energy price cards showing latest commodity prices with trend indicators

import { useEnergyPrices } from '../hooks/useEnergyPrices';

const COMMODITY_META = {
  'crude-oil': { icon: '🛢️', label: 'Crude Oil (WTI)', gradient: 'linear-gradient(135deg, #1a1a2e, #2d1b3d)' },
  'gasoline': { icon: '⛽', label: 'Gasoline', gradient: 'linear-gradient(135deg, #1a2a1a, #1b3d2d)' },
  'diesel': { icon: '🏭', label: 'Diesel', gradient: 'linear-gradient(135deg, #2a1a1a, #3d2d1b)' },
  'heating-oil': { icon: '🔥', label: 'Heating Oil', gradient: 'linear-gradient(135deg, #2a2a1a, #3d361b)' },
  'natural-gas': { icon: '💨', label: 'Natural Gas', gradient: 'linear-gradient(135deg, #1a2a2a, #1b3d3d)' },
  'propane': { icon: '🧪', label: 'Propane', gradient: 'linear-gradient(135deg, #1a1a2a, #1b1b3d)' },
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
        const meta = COMMODITY_META[price._id] || { icon: '📊', label: price._id, gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' };
        const isNegative = price.changePercent < 0;
        const trendColor = isNegative ? '#ff2d55' : '#06d6a0';
        const trendIcon = isNegative ? '▼' : '▲';

        return (
          <div
            key={price._id}
            className="price-card"
            style={{ background: meta.gradient }}
          >
            <div className="price-card-header">
              <span className="price-card-icon">{meta.icon}</span>
              <span className="price-card-label">{meta.label}</span>
            </div>
            <div className="price-card-value">
              ${price.latestPrice?.toFixed(2) || 'N/A'}
              <span className="price-card-unit">{price.unit}</span>
            </div>
            <div className="price-card-trend" style={{ color: trendColor }}>
              <span className="trend-icon">{trendIcon}</span>
              <span className="trend-value">{Math.abs(price.changePercent || 0).toFixed(2)}%</span>
              <span className="trend-label">{price.trend || 'stable'}</span>
            </div>
            <div className="price-card-date">
              {price.date ? new Date(price.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
