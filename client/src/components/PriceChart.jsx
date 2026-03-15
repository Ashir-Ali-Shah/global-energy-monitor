// client/src/components/PriceChart.jsx
// Recharts-based price history chart for selected commodities

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { usePriceHistory } from '../hooks/useEnergyPrices';

const COMMODITIES = [
  { value: 'crude-oil', label: 'Crude Oil (WTI)', color: '#6c63ff' },
  { value: 'gasoline', label: 'Gasoline', color: '#06d6a0' },
  { value: 'diesel', label: 'Diesel', color: '#ff6b35' },
  { value: 'natural-gas', label: 'Natural Gas', color: '#ffbe0b' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-date">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="tooltip-value" style={{ color: entry.color }}>
          {entry.name}: ${entry.value?.toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export default function PriceChart() {
  const [selectedCommodity, setSelectedCommodity] = useState('crude-oil');
  const [months, setMonths] = useState(12);
  const { history, loading } = usePriceHistory(selectedCommodity, months);

  const selectedMeta = COMMODITIES.find((c) => c.value === selectedCommodity) || COMMODITIES[0];

  const chartData = history.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    price: item.value,
    change: item.changePercent,
  }));

  return (
    <div className="price-chart-container" id="price-chart">
      <div className="chart-header">
        <h3 className="chart-title">📈 Price History</h3>
        <div className="chart-controls">
          <div className="commodity-selector">
            {COMMODITIES.map((c) => (
              <button
                key={c.value}
                className={`commodity-btn ${selectedCommodity === c.value ? 'active' : ''}`}
                onClick={() => setSelectedCommodity(c.value)}
                style={selectedCommodity === c.value ? { borderColor: c.color, color: c.color } : {}}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="time-selector">
            {[3, 6, 12, 24].map((m) => (
              <button
                key={m}
                className={`time-btn ${months === m ? 'active' : ''}`}
                onClick={() => setMonths(m)}
              >
                {m}M
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-area">
        {loading ? (
          <div className="chart-loading">
            <div className="spinner" />
            <span>Loading chart data...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="chart-empty">
            <p>📊 No historical data available for {selectedMeta.label}.</p>
            <small>Data will populate after the next sync cycle.</small>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedMeta.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={selectedMeta.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#8884d8', fontSize: 12 }}
                stroke="#2a2a4a"
              />
              <YAxis
                tick={{ fill: '#8884d8', fontSize: 12 }}
                stroke="#2a2a4a"
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="price"
                name={selectedMeta.label}
                stroke={selectedMeta.color}
                fill="url(#priceGradient)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, stroke: selectedMeta.color, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
