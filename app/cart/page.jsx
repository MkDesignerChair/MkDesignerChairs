"use client";

import Link from "next/link";
import { useCart } from "../components/StoreProvider";

function formatPrice(price) {
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export default function CartPage() {
  const { decrementItem, incrementItem, items, removeItem, totalItems } = useCart();
  const total = items.reduce((amount, item) => amount + item.price * item.quantity, 0);

  return <main className="cart-page"><section className="cart-shell"><p className="eyebrow">YOUR SELECTION</p><h1>Your Cart</h1>{items.length === 0 ? <div className="empty-cart"><h2>Your cart is empty.</h2><p>Discover a chair that belongs in your space.</p><Link className="gold-button" href="/shop">Browse the Shop</Link></div> : <div className="cart-layout"><div className="cart-items">{items.map((item) => <article className="cart-item" key={item.id}><img src={item.image} alt={item.name} /><div><h2>{item.name}</h2><strong>{formatPrice(item.price)}</strong><div className="quantity-controls"><button type="button" onClick={() => decrementItem(item.id)} aria-label={`Decrease ${item.name} quantity`}>−</button><span>{item.quantity}</span><button type="button" onClick={() => incrementItem(item.id)} aria-label={`Increase ${item.name} quantity`}>+</button></div></div><button className="remove-item" type="button" onClick={() => removeItem(item.id)}>Remove</button></article>)}</div><aside className="cart-summary"><span>{totalItems} item{totalItems === 1 ? "" : "s"}</span><h2>Order Summary</h2><div><span>Subtotal</span><strong>{formatPrice(total)}</strong></div><div><span>Delivery</span><strong>Calculated later</strong></div><div className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></div><Link className="gold-button" href="/login">Continue to checkout</Link></aside></div>}</section></main>;
}
