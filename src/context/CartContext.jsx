import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { clearMyCartApi, fetchMyCartApi, replaceMyCartApi } from '../services/cartService';

const CartContext = createContext();
const CART_GUEST_KEY = 'cart_guest';

const safeRead = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

const normalizeQuantity = (quantity) => {
  const parsed = Number(quantity);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
};

const compactCartProduct = (product = {}) => ({
  id: product.id,
  name: product.name,
  title: product.title,
  price: product.price,
  originalPrice: product.originalPrice,
  image: product.image || (Array.isArray(product.images) ? product.images[0] : undefined),
  category: product.category,
  rating: product.rating,
  stock: product.stock,
  quantity: normalizeQuantity(product.quantity),
});

const writeCartToStorage = (key, items) => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch (error) {
    if (error?.name === 'QuotaExceededError') {
      try {
        const compactItems = (Array.isArray(items) ? items : []).map(compactCartProduct);
        localStorage.setItem(key, JSON.stringify(compactItems));
        return true;
      } catch (_retryError) {
        return false;
      }
    }
    return false;
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
          const compactServerItems = serverItems.map(compactCartProduct);
          setCartItems(compactServerItems);
          writeCartToStorage(userKey, compactServerItems);
          return;
        }

        const sourceItems = (userLocalItems.length > 0 ? userLocalItems : guestItems)
          .map(compactCartProduct);

        if (sourceItems.length > 0) {
          const syncedItems = await replaceMyCartApi(sourceItems);
          if (!isMounted) {
            return;
          }
          const compactSyncedItems = syncedItems.map(compactCartProduct);
          setCartItems(compactSyncedItems);
          writeCartToStorage(userKey, compactSyncedItems);
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
    writeCartToStorage(getCartStorageKey(user), cartItems);

    if (!user || isSyncing) {
      return;
    }

    const timer = setTimeout(() => {
      replaceMyCartApi(cartItems).catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [cartItems, user, isSyncing]);

  const addToCart = (product) => {
    const nextItem = compactCartProduct(product);

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === nextItem.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === nextItem.id
            ? { ...item, quantity: item.quantity + normalizeQuantity(nextItem.quantity) }
            : item
        );
      }
      return [...prevItems, nextItem];
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
