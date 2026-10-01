"use client";

import Link from "next/link";
import AddToCartButton from "../components/AddToCartButton";
import { useCart } from "../components/StoreProvider";

function formatPrice(price) {
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export default function WishlistPage() {
  const { isReady, removeWishlistItem, wishlistItems } = useCart();

  if (!isReady) return <main className="cart-page"><section className="cart-shell" aria-busy="true"><p className="eyebrow">SAVED FOR LATER</p><h1>Your Wishlist</h1></section></main>;

  return <main className="cart-page wishlist-page"><section className="cart-shell"><p className="eyebrow">SAVED FOR LATER</p><h1>Your Wishlist</h1>{wishlistItems.length === 0 ? <div className="empty-cart"><h2>Your wishlist is empty.</h2><p>Save your favourite chairs here while you explore.</p><Link className="gold-button" href="/shop">Browse the Shop</Link></div> : <div className="wishlist-grid">{wishlistItems.map((product) => <article className="wishlist-card" key={product.id}><Link href={`/products/${product.detailSlug || product.id}`}><img src={product.image} alt={product.name} /></Link><div><span>{product.category || "Designer chair"}</span><Link href={`/products/${product.detailSlug || product.id}`}><h2>{product.name}</h2></Link><strong>{formatPrice(product.price)}</strong><div className="wishlist-card-actions"><AddToCartButton product={product} /><button type="button" onClick={() => removeWishlistItem(product.id)}>Remove</button></div></div></article>)}</div>}</section></main>;
}
