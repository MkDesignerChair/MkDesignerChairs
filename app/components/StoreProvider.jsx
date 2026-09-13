"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "mk-designer-chairs-cart";

export function StoreProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedItems = window.localStorage.getItem(STORAGE_KEY);

    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [isReady, items]);

  const value = useMemo(() => ({
    addItem(product) {
      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          return currentItems.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }

        return [...currentItems, { ...product, quantity: 1 }];
      });
    },
    decrementItem(productId) {
      setItems((currentItems) => currentItems.flatMap((item) => {
        if (item.id !== productId) {
          return [item];
        }

        return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
      }));
    },
    incrementItem(productId) {
      setItems((currentItems) => currentItems.map((item) => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
    },
    removeItem(productId) {
      setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
    },
    items,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used within StoreProvider");
  }

  return cart;
}
