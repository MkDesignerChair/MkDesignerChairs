import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getProducts, resolveCatalogProductId } from "./products";
import { getSiteContent } from "../../actions/site-content";

export class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

export function razorpayConfiguration() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  if (!keyId || !keySecret || !publicKeyId) throw new CheckoutError("Razorpay keys are missing. Configure all three Razorpay environment variables and restart the server.", 503);
  if (keyId !== publicKeyId) throw new CheckoutError("The public Razorpay key ID does not match the server key ID.", 503);
  return { keyId, keySecret };
}

export function keyPaymentMode(keyId) {
  if (keyId.startsWith("rzp_test_")) return "Test mode";
  if (keyId.startsWith("rzp_live_")) return "Live mode";
  throw new CheckoutError("The Razorpay key ID is invalid.", 503);
}

export function validatePaymentSettings(settings) {
  const { keyId } = razorpayConfiguration();
  if (settings.maintenanceMode) throw new CheckoutError("Checkout is temporarily unavailable while the store is under maintenance.", 503);
  if (!settings.storeOpen) throw new CheckoutError("The store is currently closed. Please try again during business hours.", 503);
  if (settings.razorpayConnection === "Not configured") throw new CheckoutError("Online payment is currently unavailable. Contact the store for assistance.", 503);
  if (settings.paymentMode !== keyPaymentMode(keyId)) throw new CheckoutError("The selected payment mode does not match the configured Razorpay key. Update the store setting or environment key.", 503);
  return keyId;
}

export function validateDeliveryRegion(value, postalCode) {
  const pins = String(value || "").match(/\b\d{6}\b/g) || [];
  if (pins.length && !pins.includes(postalCode)) {
    throw new CheckoutError("Delivery is not available for this PIN code.");
  }
}

export async function priceCart(cart) {
  if (!Array.isArray(cart) || cart.length === 0 || cart.length > 50) throw new CheckoutError("Your cart is empty or too large.");
  const products = new Map((await getProducts()).map((product) => [product.id, product]));
  const quantities = new Map();
  for (const item of cart) {
    if (!item || typeof item.id !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new CheckoutError("Your cart contains an invalid item.");
    }
    const productId = resolveCatalogProductId(item.id);
    quantities.set(productId, (quantities.get(productId) || 0) + item.quantity);
  }
  const items = [...quantities].map(([id, quantity]) => {
    const product = products.get(id);
    const hasStockValue = product?.stock !== undefined && product?.stock !== null && product?.stock !== "";
    const stock = Number(product?.stock);
    if (!product || !Number.isSafeInteger(product.price) || product.price < 1 || quantity > 99 || (hasStockValue && (!Number.isInteger(stock) || stock < quantity))) {
      throw new CheckoutError("A cart item is unavailable. Refresh the shop and try again.");
    }
    return { id, image: product.image, name: product.name, quantity, unitPrice: product.price };
  });
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const { settings } = await getSiteContent();
  if (settings.maintenanceMode || !settings.storeOpen) {
    throw new CheckoutError(settings.maintenanceMode ? "Checkout is temporarily unavailable while the store is under maintenance." : "The store is currently closed. Please try again during business hours.", 503);
  }
  const charge = Number(settings.shippingCharge);
  const threshold = Number(settings.freeShippingThreshold);
  if (!Number.isSafeInteger(charge) || charge < 0 || !Number.isSafeInteger(threshold) || threshold < 0) {
    throw new CheckoutError("Shipping settings are invalid. Contact the store.", 503);
  }
  const shippingCost = subtotal >= threshold ? 0 : charge;
  const totalAmount = subtotal + shippingCost;
  if (!Number.isSafeInteger(totalAmount * 100) || totalAmount < 1) throw new CheckoutError("Order total is invalid.");
  return { items, subtotal, shippingCost, totalAmount };
}

export function validateShipping(value) {
  if (!value || typeof value !== "object") throw new CheckoutError("Enter a shipping address.");
  const fields = ["phone", "addressLine1", "city", "state", "postalCode"];
  const shipping = Object.fromEntries(fields.map((field) => [field, typeof value[field] === "string" ? value[field].trim() : ""]));
  shipping.addressLine2 = typeof value.addressLine2 === "string" ? value.addressLine2.trim() : "";
  if (!/^\d{10}$/.test(shipping.phone) || !/^\d{6}$/.test(shipping.postalCode) || !shipping.addressLine1 || !shipping.city || !shipping.state || fields.some((field) => shipping[field].length > 150) || shipping.addressLine2.length > 150) {
    throw new CheckoutError("Enter a complete Indian address, a 10 digit phone number, and a 6 digit PIN code.");
  }
  return shipping;
}

export async function razorpayRequest(path, options = {}) {
  const { keyId, keySecret } = razorpayConfiguration();
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) throw new CheckoutError(`Razorpay request failed (${response.status}): ${data.error?.description || data.error?.code || "Please try again."}`, 502);
  return data;
}

export function createCheckoutToken(order) {
  const { keySecret } = razorpayConfiguration();
  const payload = Buffer.from(JSON.stringify({ ...order, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", keySecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readCheckoutToken(token) {
  const { keySecret } = razorpayConfiguration();
  if (typeof token !== "string" || token.length > 12000) throw new CheckoutError("Checkout session is invalid.");
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) throw new CheckoutError("Checkout session is invalid.");
  const expected = createHmac("sha256", keySecret).update(payload).digest("base64url");
  if (!safeEqual(signature, expected)) throw new CheckoutError("Checkout session is invalid.");
  const order = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!order || order.expiresAt < Date.now() || !/^order_[A-Za-z0-9]+$/.test(order.razorpayOrderId)) throw new CheckoutError("Checkout session has expired. Start payment again.");
  return order;
}

export function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function newOrderNumber(prefix) {
  const normalizedPrefix = String(prefix || "MK").trim() || "MK";
  return `${normalizedPrefix}-${Date.now()}-${randomUUID().slice(0, 8)}`;
}
