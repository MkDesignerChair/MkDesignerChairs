"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "mk-designer-chairs-cart";

function isStoredCartItem(value) {
  return value && typeof value === "object" && typeof value.id === "string" && typeof value.image === "string" && typeof value.name === "string" && Number.isFinite(value.price) && value.price >= 0 && Number.isInteger(value.quantity) && value.quantity > 0;
}

function readStoredCart() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];

    const parsedItems = JSON.parse(value);
    return Array.isArray(parsedItems) ? parsedItems.filter(isStoredCartItem) : [];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function StoreProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
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
    clearCart() {
      setItems([]);
    },
    items,
    isReady,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
  }), [isReady, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used within StoreProvider");
  }

  return cart;
}
