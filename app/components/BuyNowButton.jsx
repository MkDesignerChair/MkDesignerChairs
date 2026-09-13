"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./StoreProvider";

export default function BuyNowButton({ product }) {
  const router = useRouter();
  const { addItem } = useCart();

  function buyNow() {
    addItem(product);
    router.push("/cart");
  }

  return <button className="buy-now" type="button" onClick={buyNow}>Buy now</button>;
}
