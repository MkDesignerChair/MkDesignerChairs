"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useCart } from "../components/StoreProvider";

const PENDING_PAYMENT_KEY = "mk-designer-chairs-pending-payment";

function formatPrice(value) {
  return `₹ ${Number(value).toLocaleString("en-IN")}`;
}

async function postJson(path, body) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Checkout request failed.");
  return result;
}

export default function CheckoutPage() {
  const { clearCart, isReady, items } = useCart();
  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [completedOrder, setCompletedOrder] = useState("");
  const [shipping, setShipping] = useState({ phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "" });

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => { if (active) setUser(result.user || null); })
      .catch(() => { if (active) setError("Unable to check your session. Refresh the page."); })
      .finally(() => { if (active) setSessionReady(true); });
    const saved = window.sessionStorage.getItem(PENDING_PAYMENT_KEY);
    if (saved) {
      try { setPendingPayment(JSON.parse(saved)); } catch { window.sessionStorage.removeItem(PENDING_PAYMENT_KEY); }
    }
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isReady || !items.length || pendingPayment) return;
    let active = true;
    setQuote(null);
    postJson("/api/checkout/quote", { items: items.map(({ id, quantity }) => ({ id, quantity })) })
      .then((result) => { if (active) { setQuote(result); setError(""); } })
      .catch((cause) => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, [isReady, items, pendingPayment]);

  async function confirmPayment(payment) {
    setBusy(true);
    setError("");
    try {
      const result = await postJson("/api/checkout/verify", payment);
      window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
      setPendingPayment(null);
      setCompletedOrder(result.orderNumber);
      clearCart();
    } catch (cause) {
      setError(`${cause.message} Your payment details are saved in this browser; use Retry confirmation.`);
    } finally {
      setBusy(false);
    }
  }

  async function startPayment(event) {
    event.preventDefault();
    if (busy || !quote) return;
    if (!window.Razorpay) { setError("Razorpay checkout did not load. Refresh the page and try again."); return; }
    setBusy(true);
    setError("");
    try {
      const result = await postJson("/api/checkout", { items: items.map(({ id, quantity }) => ({ id, quantity })), shipping });
      if (result.totalAmount !== quote.totalAmount) {
        setQuote({ subtotal: result.subtotal, shippingCost: result.shippingCost, totalAmount: result.totalAmount, estimatedDeliveryTime: result.estimatedDeliveryTime });
        throw new Error("The order total changed. Review the total and start payment again.");
      }
      const checkout = new window.Razorpay({
        key: result.keyId,
        amount: result.amount,
        currency: "INR",
        name: "MK Designer Chairs",
        order_id: result.orderId,
        prefill: { name: user.name, email: user.email, contact: shipping.phone },
        handler: (response) => {
          const payment = { token: result.token, ...response };
          window.sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment));
          setPendingPayment(payment);
          confirmPayment(payment);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      checkout.on("payment.failed", () => { setError("Payment was not completed. You can try again."); setBusy(false); });
      checkout.open();
    } catch (cause) {
      setError(cause.message);
      setBusy(false);
    }
  }

  if (!isReady || !sessionReady) return <main className="cart-page"><section className="cart-shell" aria-busy="true"><h1>Checkout</h1></section></main>;
  if (completedOrder) return <main className="cart-page"><section className="cart-shell checkout-complete"><p className="eyebrow">PAYMENT COMPLETE</p><h1>Thank you for your order</h1><p>Order {completedOrder} is confirmed. We’ll prepare your chairs for delivery.</p><Link className="gold-button" href="/shop">Continue shopping</Link></section></main>;
  if (!user) return <main className="cart-page"><section className="cart-shell"><h1>Sign in to checkout</h1><Link className="gold-button" href="/login?next=%2Fcheckout">Sign in to continue</Link></section></main>;
  if (!items.length && !pendingPayment) return <main className="cart-page"><section className="cart-shell"><h1>Your cart is empty</h1><Link className="gold-button" href="/shop">Browse the shop</Link></section></main>;

  return <main className="cart-page"><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} onError={() => setError("Razorpay checkout did not load. Refresh the page and try again.")} /><section className="cart-shell"><p className="eyebrow">SECURE PAYMENT</p><h1>Checkout</h1><div className="cart-layout"><form className="checkout-form" onSubmit={startPayment}><h2>Delivery address</h2><p>Signed in as {user.name} ({user.email})</p>{[["phone", "Phone number", "tel", "10 digit mobile number"], ["addressLine1", "Street address", "text", "House number and street"], ["addressLine2", "Apartment or landmark (optional)", "text", ""], ["city", "City", "text", ""], ["state", "State", "text", ""], ["postalCode", "PIN code", "text", "6 digit PIN code"]].map(([field, label, type, placeholder]) => <label key={field}>{label}<input required={field !== "addressLine2"} type={type} inputMode={field === "postalCode" ? "numeric" : undefined} maxLength={field === "phone" ? 10 : field === "postalCode" ? 6 : 150} pattern={field === "phone" ? "[0-9]{10}" : field === "postalCode" ? "[0-9]{6}" : undefined} placeholder={placeholder} value={shipping[field]} onChange={(event) => setShipping({ ...shipping, [field]: event.target.value })} disabled={busy || Boolean(pendingPayment)} /></label>)}{error && <p className="checkout-error" role="alert">{error}</p>}{pendingPayment ? <button className="gold-button" type="button" disabled={busy} onClick={() => confirmPayment(pendingPayment)}>{busy ? "Confirming payment…" : "Retry confirmation"}</button> : <button className="gold-button" type="submit" disabled={busy || !quote || !scriptReady}>{busy ? "Opening payment…" : !quote ? "Calculating total…" : !scriptReady ? "Loading secure payment…" : `Pay ${formatPrice(quote.totalAmount)}`}</button>}</form><aside className="cart-summary"><span>{items.length} product{items.length === 1 ? "" : "s"}</span><h2>Order Summary</h2>{items.map((item) => <div key={item.id}><span>{item.name} × {item.quantity}</span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}<div><span>Subtotal</span><strong>{quote ? formatPrice(quote.subtotal) : "Calculating…"}</strong></div><div><span>Delivery</span><strong>{quote ? quote.shippingCost ? formatPrice(quote.shippingCost) : "Free" : "Calculating…"}</strong></div>{quote?.estimatedDeliveryTime && <div><span>Estimated delivery</span><strong>{quote.estimatedDeliveryTime}</strong></div>}<div className="cart-total"><span>Total</span><strong>{quote ? formatPrice(quote.totalAmount) : "Calculating…"}</strong></div><Link href="/cart">Back to cart</Link></aside></div></section></main>;
}
