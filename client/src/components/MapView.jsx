// client/src/components/MapView.jsx
// Interactive react-leaflet map component for visualizing alerts

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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

// Optional helper component to handle map side effects
function MapController({ alerts }) {
  const map = useMap();
  useEffect(() => {
    // We could adjust map bounds here based on alerts if needed
  }, [alerts, map]);
  return null;
}

export default function MapView({ alerts = [] }) {
  const { setSelectedAlert } = useApp();

  return (
    <div className="map-container" id="map-view">
      <MapContainer
        center={[20, 25]}
        zoom={2}
        style={{ width: '100%', height: '100%', background: '#0a0a1a' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapController alerts={alerts} />

        {alerts.map((alert) => {
          if (!alert.location?.coordinates) return null;
          const [lng, lat] = alert.location.coordinates;
          if (lng === 0 && lat === 0) return null;

          const severityColor = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.medium;
          
          // Radius calculation based on severity
          let radius = 8;
          if (alert.severity === 'critical') radius = 14;
          if (alert.severity === 'high') radius = 11;

          return (
            <div key={alert.sourceId || alert._id}>
              {/* Outer pulsing ring for critical/high alerts */}
              {(alert.severity === 'critical' || alert.severity === 'high') && (
                <CircleMarker
                  center={[lat, lng]}
                  radius={radius + 4}
                  pathOptions={{
                    color: severityColor,
                    fillColor: severityColor,
                    fillOpacity: 0.2,
                    className: 'pulse-ring'
                  }}
                  interactive={false}
                />
              )}
              
              {/* Core interactive CircleMarker */}
              <CircleMarker
                center={[lat, lng]}
                radius={radius}
                pathOptions={{
                  color: '#ffffff',
                  weight: 1,
                  fillColor: severityColor,
                  fillOpacity: 0.8,
                  className: 'core-marker'
                }}
                eventHandlers={{
                  click: () => setSelectedAlert(alert),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95} className="custom-leaflet-tooltip">
                  <div className="tooltip-content">
                    <div className="tooltip-header">
                      <span>{CATEGORY_ICONS[alert.category] || '📰'}</span>
                      <span style={{ color: severityColor, fontWeight: 'bold' }}>
                        {alert.category.toUpperCase()}
                      </span>
                    </div>
                    <h4>{alert.title}</h4>
                    <div className="tooltip-meta">
                      <span>📍 {alert.country || 'Unknown'}</span>
                      <span>Sentiment: {(alert.sentimentScore || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            </div>
          );
        })}
      </MapContainer>

      <div className="map-legend">
        <h4>Severity</h4>
        {Object.entries(SEVERITY_COLORS).map(([level, color]) => (
          <div key={level} className="legend-item">
            <span className="legend-dot" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
            <span className="legend-label">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
