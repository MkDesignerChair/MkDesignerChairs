"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../components/StoreProvider";

function formatPrice(price) {
  return `₹ ${price.toLocaleString("en-IN")}`;
}

function CartAccessAction({ user }) {
  if (!user) return <Link className="gold-button" href="/login?next=%2Fcart">Sign in to continue</Link>;

  return <div className="cart-signed-in"><span>Signed in as {user.name}</span><small>{user.email}</small><p>Checkout will appear here once payment processing is connected.</p></div>;
}

export default function CartPage() {
  const { clearCart, decrementItem, incrementItem, isReady, items, removeItem, totalItems } = useCart();
  const [user, setUser] = useState(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const total = items.reduce((amount, item) => amount + item.price * item.quantity, 0);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const result = response.ok ? await response.json() : { user: null };
      if (!active) return;

      setUser(result.user || null);
      setIsSessionReady(true);
    }

    loadSession();
    return () => {
      active = false;
    };
  }, []);

  if (!isReady || !isSessionReady) return <main className="cart-page"><section className="cart-shell" aria-busy="true"><p className="eyebrow">YOUR SELECTION</p><h1>Your Cart</h1></section></main>;

  return <main className="cart-page"><section className="cart-shell"><p className="eyebrow">YOUR SELECTION</p><h1>Your Cart</h1>{items.length === 0 ? <div className="empty-cart"><h2>Your cart is empty.</h2><p>Discover a chair that belongs in your space.</p><Link className="gold-button" href="/shop">Browse the Shop</Link></div> : <div className="cart-layout"><div className="cart-items">{items.map((item) => <article className="cart-item" key={item.id}><img src={item.image} alt={item.name} /><div><h2>{item.name}</h2><strong>{formatPrice(item.price)}</strong><div className="quantity-controls"><button type="button" onClick={() => decrementItem(item.id)} aria-label={`Decrease ${item.name} quantity`}>−</button><span>{item.quantity}</span><button type="button" onClick={() => incrementItem(item.id)} aria-label={`Increase ${item.name} quantity`}>+</button></div></div><button className="remove-item" type="button" onClick={() => removeItem(item.id)}>Remove</button></article>)}</div><aside className="cart-summary"><span>{totalItems} item{totalItems === 1 ? "" : "s"}</span><h2>Order Summary</h2><div><span>Subtotal</span><strong>{formatPrice(total)}</strong></div><div><span>Delivery</span><strong>Calculated later</strong></div><div className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></div><CartAccessAction user={user} /><button className="remove-item cart-clear" type="button" onClick={clearCart}>Clear cart</button></aside></div>}</section></main>;
}
