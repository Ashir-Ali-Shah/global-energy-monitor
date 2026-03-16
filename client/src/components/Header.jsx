// client/src/components/Header.jsx
// Application header with navigation and branding — light theme

import SyncIndicator from './SyncIndicator';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { activeTab, setActiveTab } = useApp();

  const tabs = [
    { id: 'map', label: 'Map View', icon: '🗺️' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  ];

  return (
    <header className="app-header" id="app-header">
      <div className="header-brand">
        <div className="brand-logo">
          <span className="logo-icon">🌊</span>
          <div className="logo-text">
            <h1>Ripple Effect</h1>
            <span className="logo-subtitle">Global Energy &amp; Conflict Monitor</span>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-tab-icon">{tab.icon}</span>
            <span className="nav-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="header-right">
        <SyncIndicator />
      </div>
    </header>
  );
}