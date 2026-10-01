"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "mk-designer-chairs-cart";
const WISHLIST_STORAGE_KEY = "mk-designer-chairs-wishlist";

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

function readStoredWishlist() {
  try {
    const value = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!value) return [];

    const products = JSON.parse(value);
    return Array.isArray(products) ? products.filter((product) => product && typeof product.id === "string" && typeof product.name === "string" && typeof product.image === "string" && Number.isFinite(product.price)) : [];
  } catch {
    window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
    return [];
  }
}

export function StoreProvider({ children }) {
  const [items, setItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const cartMessageTimer = useRef(null);

  useEffect(() => {
    setItems(readStoredCart());
    setWishlistItems(readStoredWishlist());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [isReady, items]);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    }
  }, [isReady, wishlistItems]);

  useEffect(() => () => {
    if (cartMessageTimer.current) window.clearTimeout(cartMessageTimer.current);
  }, []);

  function showStoreMessage(message) {
    if (cartMessageTimer.current) window.clearTimeout(cartMessageTimer.current);
    setCartMessage(message);
    cartMessageTimer.current = window.setTimeout(() => setCartMessage(""), 3000);
  }

  const value = useMemo(() => ({
    addItem(product) {
      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          return currentItems.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }

        return [...currentItems, { ...product, quantity: 1 }];
      });
      showStoreMessage(`${product.name} added to your cart.`);
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
    toggleWishlist(product) {
      const isSaved = wishlistItems.some((item) => item.id === product.id);
      setWishlistItems((currentItems) => isSaved ? currentItems.filter((item) => item.id !== product.id) : [...currentItems, product]);
      showStoreMessage(isSaved ? `${product.name} removed from your wishlist.` : `${product.name} added to your wishlist.`);
    },
    removeWishlistItem(productId) {
      setWishlistItems((currentItems) => currentItems.filter((item) => item.id !== productId));
    },
    items,
    isReady,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    wishlistItems,
    wishlistTotal: wishlistItems.length,
  }), [isReady, items, wishlistItems]);

  return <CartContext.Provider value={value}>{children}{cartMessage && <div className="cart-toast" role="status" aria-live="polite"><span aria-hidden="true">✓</span>{cartMessage}</div>}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used within StoreProvider");
  }

  return cart;
}
