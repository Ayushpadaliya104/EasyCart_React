import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const WISHLIST_GUEST_KEY = 'wishlist';

const readWishlistFromStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Unable to read wishlist from localStorage key: ${key}`, error);
    return [];
  }
};

const compactWishlistProduct = (product = {}) => ({
  id: product.id,
  name: product.name,
  title: product.title,
  price: product.price,
  originalPrice: product.originalPrice,
  image: product.image,
  images: Array.isArray(product.images) ? product.images.slice(0, 2) : undefined,
  category: product.category,
  rating: product.rating,
  stock: product.stock,
});

const writeWishlistToStorage = (key, items) => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch (error) {
    if (error?.name === 'QuotaExceededError') {
      // Retry once with a more compact payload to prevent app crash.
      try {
        const compactItems = items.map(compactWishlistProduct);
        localStorage.setItem(key, JSON.stringify(compactItems));
        return true;
      } catch (retryError) {
        console.warn(`Wishlist storage quota exceeded for key: ${key}`, retryError);
        return false;
      }
    }

    console.warn(`Unable to save wishlist to localStorage key: ${key}`, error);
    return false;
  }
};

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
    return readWishlistFromStorage(WISHLIST_GUEST_KEY);
  });

  useEffect(() => {
    const key = getWishlistStorageKey(user);
    setWishlistItems(readWishlistFromStorage(key));
  }, [user]);

  useEffect(() => {
    const key = getWishlistStorageKey(user);
    writeWishlistToStorage(key, wishlistItems);
  }, [wishlistItems, user]);

  const addToWishlist = (product) => {
    setWishlistItems(prevItems => {
      const exists = prevItems.find(item => item.id === product.id);
      if (exists) {
        return prevItems;
      }
      return [...prevItems, compactWishlistProduct(product)];
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
