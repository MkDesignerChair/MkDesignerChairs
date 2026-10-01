import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getPersistentJson, isPersistentDataConfigured, savePersistentJson } from "../app/lib/imagekit-store";

const filePath = join(process.cwd(), "data", "orders.json");
export const orderSteps = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

async function readOrders() {
  const fallbackOrders = JSON.parse(await readFile(filePath, "utf8"));
  const orders = isPersistentDataConfigured() ? await getPersistentJson("orders.json", fallbackOrders) : fallbackOrders;
  if (!Array.isArray(orders)) throw new Error("Orders must be a list.");
  return orders;
}

async function writeOrders(orders) {
  if (isPersistentDataConfigured()) {
    await savePersistentJson("orders.json", orders);
    return;
  }

  await writeFile(`${filePath}.tmp`, `${JSON.stringify(orders, null, 2)}\n`, "utf8");
  await rename(`${filePath}.tmp`, filePath);
}

function withStatus(order, status, timestamp) {
  const completedSteps = orderSteps.slice(0, orderSteps.indexOf(status) + 1);
  const timeline = { ...order.timeline };
  for (const step of completedSteps) {
    if (!timeline[step]) timeline[step] = timestamp;
  }

  return { ...order, status, timeline, statusUpdatedAt: timestamp };
}

export async function getOrders() {
  const orders = await readOrders();
  return orders.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export async function getOrdersForCustomerEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return [];

  const orders = await readOrders();
  return orders
    .filter((order) => String(order.customer?.email || "").trim().toLowerCase() === normalizedEmail)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export async function updateOrderStatus(id, status) {
  if (typeof id !== "string" || !id) throw new Error("Order ID is required.");
  if (!orderSteps.includes(status)) throw new Error("Invalid order status.");

  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) throw new Error("Order not found.");

  orders[index] = withStatus(orders[index], status, new Date().toISOString());
  await writeOrders(orders);
  return orders[index];
}

export async function getOrder(id) {
  const orders = await readOrders();
  return orders.find((order) => order.id === id) || null;
}

let checkoutOrderWrite = Promise.resolve();
let shiprocketWebhookWrite = Promise.resolve();

function serializeCheckoutWrite(work) {
  const save = checkoutOrderWrite.then(work);
  checkoutOrderWrite = save.catch(() => {});
  return save;
}

function serializeShiprocketWebhookWrite(work) {
  const save = shiprocketWebhookWrite.then(work);
  shiprocketWebhookWrite = save.catch(() => {});
  return save;
}

export function savePendingOrder(order) {
  return serializeCheckoutWrite(async () => {
    const orders = await readOrders();
    const existing = orders.find((item) => item.payment?.razorpayOrderId === order.payment.razorpayOrderId);
    if (existing) return existing;
    await writeOrders([order, ...orders]);
    return order;
  });
}

export function savePaidOrder(order) {
  return serializeCheckoutWrite(async () => {
    const orders = await readOrders();
    const existing = orders.find((item) => item.payment?.transactionId === order.payment.transactionId || item.payment?.razorpayOrderId === order.payment.razorpayOrderId);
    if (existing) {
      if (existing.payment.status === "Paid") return existing;
      const updated = { ...existing, payment: order.payment };
      await writeOrders(orders.map((item) => item.id === existing.id ? updated : item));
      return updated;
    }
    await writeOrders([order, ...orders]);
    return order;
  });
}

export async function updateShiprocketShipment(id, shipment) {
  if (typeof id !== "string" || !id) throw new Error("Order ID is required.");
  if (!shipment || typeof shipment !== "object") throw new Error("Invalid Shiprocket shipment.");

  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) throw new Error("Order not found.");

  const current = orders[index];
  const currentShipping = current.shipping || {};
  const estimatedDeliveryDate = shipment.estimatedDelivery
    ? String(shipment.estimatedDelivery)
    : currentShipping.estimatedDeliveryDate || "";
  orders[index] = {
    ...current,
    shipping: {
      ...currentShipping,
      courier: shipment.courierName || currentShipping.courier || "Shiprocket courier",
      trackingNumber: shipment.awb || currentShipping.trackingNumber || "Not assigned",
      trackingUrl: shipment.trackingUrl || currentShipping.trackingUrl || "",
      estimatedDeliveryDate,
      shiprocket: shipment,
    },
  };
  await writeOrders(orders);
  return orders[index];
}

function webhookOrderStatus(payload) {
  const status = `${payload.current_status || ""} ${payload.shipment_status || ""}`.toUpperCase().replace(/[_-]/g, " ");
  if (status.includes("DELIVERED")) return "delivered";
  if (status.includes("OUT FOR DELIVERY")) return "out_for_delivery";
  if (status.includes("IN TRANSIT") || status.includes("SHIPPED") || status.includes("PICKED UP") || status.includes("MANIFEST")) return "shipped";
  if (status.includes("PACKED")) return "packed";
  if (status.includes("CONFIRMED")) return "confirmed";
  return "";
}

function normalizedWebhookScans(payload) {
  if (!Array.isArray(payload.scans)) return [];
  return payload.scans.slice(-15).map((scan) => ({
    date: String(scan.date || ""),
    status: String(scan["sr-status-label"] || scan.status || ""),
    activity: String(scan.activity || ""),
    location: String(scan.location || ""),
  }));
}

function webhookEventKey(payload, scans) {
  const explicitId = String(payload.event_id || payload.webhook_id || "").trim();
  if (explicitId) return `event:${explicitId}`;

  const fingerprint = JSON.stringify({
    awb: String(payload.awb || "").trim(),
    sourceOrderId: String(payload.order_id || "").trim(),
    shiprocketOrderId: String(payload.sr_order_id || "").trim(),
    status: String(payload.current_status || payload.shipment_status || "").trim(),
    statusId: String(payload.current_status_id || payload.shipment_status_id || "").trim(),
    etd: String(payload.etd || "").trim(),
    scans,
  });
  return `hash:${createHash("sha256").update(fingerprint).digest("hex")}`;
}

function shipmentTrackingUrl(payload, currentShipment) {
  const suppliedUrl = payload.tracking_url || payload.track_url || payload.tracking_data?.track_url || payload.tracking_data?.tracking_url;
  if (typeof suppliedUrl === "string" && /^https:\/\//i.test(suppliedUrl.trim())) return suppliedUrl.trim();
  return currentShipment.trackingUrl || "";
}

export async function applyShiprocketTrackingEvent(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Invalid tracking event.");
  return serializeShiprocketWebhookWrite(async () => {
    const awb = String(payload.awb || "").trim();
    const sourceOrderId = String(payload.order_id || "").trim();
    const shiprocketOrderId = String(payload.sr_order_id || "").trim();
    if (!awb && !sourceOrderId && !shiprocketOrderId) throw new Error("Tracking event does not identify an order.");

    const orders = await readOrders();
    const index = orders.findIndex((order) => {
      const shipment = order.shipping?.shiprocket || {};
      const numericOrderNumber = String(order.orderNumber || "").replace(/\D/g, "");
      return (awb && (shipment.awb === awb || order.shipping?.trackingNumber === awb)) ||
        (sourceOrderId && (shipment.sourceOrderId === sourceOrderId || order.orderNumber === sourceOrderId || numericOrderNumber === sourceOrderId)) ||
        (shiprocketOrderId && shipment.orderId === shiprocketOrderId);
    });
    if (index === -1) return null;

    const timestamp = new Date().toISOString();
    const order = orders[index];
    const shipping = order.shipping || {};
    const existingShipment = shipping.shiprocket || {};
    const scans = normalizedWebhookScans(payload);
    const eventKey = webhookEventKey(payload, scans);
    const priorEventKeys = Array.isArray(existingShipment.webhookEventKeys) ? existingShipment.webhookEventKeys : [];
    if (priorEventKeys.includes(eventKey)) return order;

    const shipment = {
      ...existingShipment,
      awb: awb || existingShipment.awb || "",
      courierName: String(payload.courier_name || existingShipment.courierName || "Shiprocket courier"),
      status: String(payload.current_status || payload.shipment_status || existingShipment.status || ""),
      statusId: String(payload.current_status_id || payload.shipment_status_id || existingShipment.statusId || ""),
      sourceOrderId: sourceOrderId || existingShipment.sourceOrderId || order.orderNumber,
      orderId: shiprocketOrderId || existingShipment.orderId || "",
      trackingUrl: shipmentTrackingUrl(payload, existingShipment),
      estimatedDelivery: String(payload.etd || existingShipment.estimatedDelivery || ""),
      lastActivity: scans.at(-1)?.activity || String(payload.activity || existingShipment.lastActivity || ""),
      lastLocation: scans.at(-1)?.location || String(payload.location || existingShipment.lastLocation || ""),
      scans: scans.length ? scans : existingShipment.scans || [],
      webhookEventKeys: [...priorEventKeys, eventKey].slice(-50),
      lastWebhookAt: timestamp,
    };
    let nextOrder = {
      ...order,
      shipping: {
        ...shipping,
        courier: shipment.courierName,
        trackingNumber: shipment.awb || shipping.trackingNumber || "Not assigned",
        trackingUrl: shipment.trackingUrl || shipping.trackingUrl || "",
        estimatedDeliveryDate: shipment.estimatedDelivery || shipping.estimatedDeliveryDate || "",
        shiprocket: shipment,
      },
    };
    const nextStatus = webhookOrderStatus(payload);
    if (nextStatus && orderSteps.indexOf(nextStatus) >= orderSteps.indexOf(nextOrder.status)) {
      nextOrder = withStatus(nextOrder, nextStatus, timestamp);
    }

    orders[index] = nextOrder;
    await writeOrders(orders);
    return nextOrder;
  });
}

export async function updateOrderCustomerByEmail(email, changes) {
  const orders = await readOrders();
  const normalizedEmail = email.trim().toLowerCase();
  const nextOrders = orders.map((order) => order.customer.email.toLowerCase() === normalizedEmail ? { ...order, customer: { ...order.customer, ...changes } } : order);

  if (nextOrders.some((order, index) => order !== orders[index])) await writeOrders(nextOrders);
}
