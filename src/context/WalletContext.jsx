import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthContext';
import { fetchWalletSummaryApi } from '../services/walletService';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState('');

  const refreshWallet = useCallback(async () => {
    if (!user) {
      setWallet(null);
      setWalletError('');
      return null;
    }

    try {
      setWalletLoading(true);
      setWalletError('');
      const summary = await fetchWalletSummaryApi();
      setWallet(summary);
      return summary;
    } catch (error) {
      setWalletError(error?.response?.data?.message || 'Failed to load wallet');
      return null;
    } finally {
      setWalletLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        walletLoading,
        walletError,
        refreshWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }

  return context;
}
