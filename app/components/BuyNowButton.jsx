"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./StoreProvider";

export default function BuyNowButton({ disabled, product }) {
  const router = useRouter();
  const { addItem } = useCart();

  function buyNow() {
    addItem(product);
    router.push("/cart");
  }

  return <button className="buy-now" disabled={disabled} type="button" onClick={buyNow}>{disabled ? "Out of stock" : "Buy now"}</button>;
}
