// client/src/App.jsx
// Root application component — assembles all views

import { AppProvider, useApp } from './context/AppContext';
import { useAlerts } from './hooks/useAlerts';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import MapView from './components/MapView';
import PriceCards from './components/PriceCards';
import PriceChart from './components/PriceChart';
import AlertFeed from './components/AlertFeed';
import AlertDetail from './components/AlertDetail';
import './App.css';

function AppContent() {
  const { activeTab } = useApp();
  const { alerts, stats, loading, error, refresh } = useAlerts();

  return (
    <div className="app-container">
      <Header />
      <StatsBar alerts={alerts} stats={stats} />

      <main className="app-main">
        {activeTab === 'map' && (
          <div className="map-layout">
            <div className="map-section">
              <MapView alerts={alerts} />
            </div>
            <aside className="sidebar-section">
              <AlertFeed alerts={alerts} loading={loading} />
            </aside>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="dashboard-layout">
            <section className="dashboard-section">
              <PriceCards />
            </section>
            <section className="dashboard-section">
              <PriceChart />
            </section>
            <section className="dashboard-section dashboard-alerts">
              <AlertFeed alerts={alerts} loading={loading} />
            </section>
          </div>
        )}
      </main>

      <AlertDetail />

      {error && (
        <div className="global-error">
          <p>⚠️ {error}</p>
          <button onClick={refresh}>Retry</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
