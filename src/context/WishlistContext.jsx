import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const WISHLIST_GUEST_KEY = 'wishlist';

const getWishlistStorageKey = (user) => {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email) {
    return WISHLIST_GUEST_KEY;
  }
  return `wishlist_${email}`;
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem(WISHLIST_GUEST_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const key = getWishlistStorageKey(user);
    const saved = localStorage.getItem(key);
    setWishlistItems(saved ? JSON.parse(saved) : []);
  }, [user]);

  useEffect(() => {
    const key = getWishlistStorageKey(user);
    localStorage.setItem(key, JSON.stringify(wishlistItems));
  }, [wishlistItems, user]);

  const addToWishlist = (product) => {
    setWishlistItems(prevItems => {
      const exists = prevItems.find(item => item.id === product.id);
      if (exists) {
        return prevItems;
      }
      return [...prevItems, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
