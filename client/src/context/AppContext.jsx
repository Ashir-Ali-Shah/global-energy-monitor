// client/src/context/AppContext.jsx
// Global state management using React Context API

import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedCommodity, setSelectedCommodity] = useState('crude-oil');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDarkMode] = useState(true); // Default to dark mode

  const clearSelection = useCallback(() => {
    setSelectedAlert(null);
  }, []);

  const value = {
    activeTab,
    setActiveTab,
    selectedAlert,
    setSelectedAlert,
    selectedCommodity,
    setSelectedCommodity,
    filterCategory,
    setFilterCategory,
    isDarkMode,
    clearSelection,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
