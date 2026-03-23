import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, fetchPublicStoreSettingsApi } from '../services/storeSettingsService';

const StoreSettingsContext = createContext(null);

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const latest = await fetchPublicStoreSettingsApi();
      setSettings(latest);
    } catch (_error) {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      refreshSettings,
      setSettings
    }),
    [settings, loading]
  );

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within StoreSettingsProvider');
  }
  return context;
}
