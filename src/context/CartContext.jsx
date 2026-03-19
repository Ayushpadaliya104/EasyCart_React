import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { clearMyCartApi, fetchMyCartApi, replaceMyCartApi } from '../services/cartService';

const CartContext = createContext();
const CART_GUEST_KEY = 'cart_guest';

const safeRead = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
};

const getCartStorageKey = (user) => {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email) {
    return CART_GUEST_KEY;
  }
  return `cart_${email}`;
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => safeRead(CART_GUEST_KEY));
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCart = async () => {
      if (!user) {
        setCartItems(safeRead(CART_GUEST_KEY));
        return;
      }

      const userKey = getCartStorageKey(user);
      const userLocalItems = safeRead(userKey);

      if (userLocalItems.length > 0) {
        setCartItems(userLocalItems);
      } else {
        setCartItems([]);
      }

      const guestItems = safeRead(CART_GUEST_KEY);

      if (!user) {
        return;
      }

      try {
        setIsSyncing(true);
        const serverItems = await fetchMyCartApi();

        if (!isMounted) {
          return;
        }

        if (serverItems.length > 0) {
          setCartItems(serverItems);
          localStorage.setItem(userKey, JSON.stringify(serverItems));
          return;
        }

        const sourceItems = userLocalItems.length > 0 ? userLocalItems : guestItems;

        if (sourceItems.length > 0) {
          const syncedItems = await replaceMyCartApi(sourceItems);
          if (!isMounted) {
            return;
          }
          setCartItems(syncedItems);
          localStorage.setItem(userKey, JSON.stringify(syncedItems));
          localStorage.removeItem(CART_GUEST_KEY);
        }
      } catch (_error) {
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    loadCart();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem(getCartStorageKey(user), JSON.stringify(cartItems));

    if (!user || isSyncing) {
      return;
    }

    const timer = setTimeout(() => {
      replaceMyCartApi(cartItems).catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [cartItems, user, isSyncing]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);

    if (user) {
      clearMyCartApi().catch(() => {});
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
