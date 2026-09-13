"use client";

import { useCart } from "./StoreProvider";

function CartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2 11.2h10.7l2-8H6" /><circle cx="9" cy="19.3" r="1.2" /><circle cx="17.5" cy="19.3" r="1.2" /></svg>;
}

export default function AddToCartButton({ product }) {
  const { addItem } = useCart();

  return <button className="add-cart" type="button" onClick={() => addItem(product)} aria-label={`Add ${product.name} to cart`}><CartIcon /></button>;
}
