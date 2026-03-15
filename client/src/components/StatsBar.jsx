// client/src/components/StatsBar.jsx
// Top statistics bar showing key metrics

export default function StatsBar({ alerts = [], stats = [] }) {
  const totalAlerts = alerts.length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const highCount = alerts.filter((a) => a.severity === 'high').length;
  const avgSentiment = alerts.length > 0
    ? alerts.reduce((sum, a) => sum + (a.sentimentScore || 0), 0) / alerts.length
    : 0;
  const countriesAffected = new Set(alerts.map((a) => a.country)).size;

  const metrics = [
    { label: 'Total Alerts', value: totalAlerts, icon: '🔔', color: '#6c63ff' },
    { label: 'Critical', value: criticalCount, icon: '🔴', color: '#ff2d55' },
    { label: 'High Priority', value: highCount, icon: '🟠', color: '#ff6b35' },
    { label: 'Avg Sentiment', value: avgSentiment.toFixed(2), icon: avgSentiment < 0 ? '📉' : '📈', color: avgSentiment < 0 ? '#ff2d55' : '#06d6a0' },
    { label: 'Countries', value: countriesAffected, icon: '🌍', color: '#ffbe0b' },
  ];

  return (
    <div className="stats-bar" id="stats-bar">
      {metrics.map((metric) => (
        <div key={metric.label} className="stat-item">
          <span className="stat-icon">{metric.icon}</span>
          <div className="stat-content">
            <span className="stat-value" style={{ color: metric.color }}>
              {metric.value}
            </span>
            <span className="stat-label">{metric.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
