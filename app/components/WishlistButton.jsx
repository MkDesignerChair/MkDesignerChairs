"use client";

import { useCart } from "./StoreProvider";

export default function WishlistButton({ className = "heart-button", product }) {
  const { toggleWishlist, wishlistItems } = useCart();
  const isSaved = wishlistItems.some((item) => item.id === product.id);

  return <button className={`${className}${isSaved ? " is-active" : ""}`} type="button" aria-label={`${isSaved ? "Remove" : "Add"} ${product.name} ${isSaved ? "from" : "to"} wishlist`} aria-pressed={isSaved} onClick={() => toggleWishlist(product)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg></button>;
}
