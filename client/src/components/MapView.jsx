// client/src/components/MapView.jsx
// Interactive react-leaflet map component — light theme

import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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

function MapController({ alerts }) {
  const map = useMap();
  useEffect(() => {
    // Could adjust map bounds based on alerts if needed
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
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        {/* Light/warm CartoDB Voyager tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapController alerts={alerts} />

        {alerts.map((alert) => {
          if (!alert.location?.coordinates) return null;
          const [lng, lat] = alert.location.coordinates;
          if (lng === 0 && lat === 0) return null;

          const severityColor = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.medium;

          let radius = 8;
          if (alert.severity === 'critical') radius = 14;
          if (alert.severity === 'high') radius = 11;

          return (
            <div key={alert.sourceId || alert._id}>
              {(alert.severity === 'critical' || alert.severity === 'high') && (
                <CircleMarker
                  center={[lat, lng]}
                  radius={radius + 5}
                  pathOptions={{
                    color: severityColor,
                    fillColor: severityColor,
                    fillOpacity: 0.15,
                    weight: 1,
                  }}
                  interactive={false}
                />
              )}

              <CircleMarker
                center={[lat, lng]}
                radius={radius}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2,
                  fillColor: severityColor,
                  fillOpacity: 0.85,
                }}
                eventHandlers={{
                  click: () => setSelectedAlert(alert),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -10]}
                  opacity={1}
                  className="custom-leaflet-tooltip"
                >
                  <div className="tooltip-content">
                    <div className="tooltip-header">
                      <span>{CATEGORY_ICONS[alert.category] || '📰'}</span>
                      <span style={{ color: severityColor, fontWeight: 'bold' }}>
                        {alert.category?.toUpperCase()}
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
            <span
              className="legend-dot"
              style={{ background: color, border: `2px solid ${color}40` }}
            />
            <span className="legend-label">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}