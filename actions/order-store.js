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
      estimatedDeliveryDate,
      shiprocket: shipment,
    },
  };
  await writeOrders(orders);
  return orders[index];
}

function webhookOrderStatus(payload) {
  const status = `${payload.current_status || ""} ${payload.shipment_status || ""}`.toUpperCase();
  if (status.includes("DELIVERED")) return "delivered";
  if (status.includes("OUT FOR DELIVERY")) return "out_for_delivery";
  if (status.includes("IN TRANSIT") || status.includes("SHIPPED") || status.includes("PICKED UP") || status.includes("MANIFEST")) return "shipped";
  if (status.includes("PACKED")) return "packed";
  if (status.includes("CONFIRMED")) return "confirmed";
  return "";
}

export async function applyShiprocketTrackingEvent(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Invalid tracking event.");
  const awb = String(payload.awb || "").trim();
  const sourceOrderId = String(payload.order_id || "").trim();
  const shiprocketOrderId = String(payload.sr_order_id || "").trim();
  if (!awb && !sourceOrderId && !shiprocketOrderId) throw new Error("Tracking event does not identify an order.");

  const orders = await readOrders();
  const index = orders.findIndex((order) => {
    const shipment = order.shipping?.shiprocket || {};
    return (awb && (shipment.awb === awb || order.shipping?.trackingNumber === awb)) ||
      (sourceOrderId && (shipment.sourceOrderId === sourceOrderId || order.orderNumber === sourceOrderId)) ||
      (shiprocketOrderId && shipment.orderId === shiprocketOrderId);
  });
  if (index === -1) return null;

  const timestamp = new Date().toISOString();
  const order = orders[index];
  const shipping = order.shipping || {};
  const existingShipment = shipping.shiprocket || {};
  const scans = Array.isArray(payload.scans) ? payload.scans.slice(-15).map((scan) => ({
    date: String(scan.date || ""),
    status: String(scan["sr-status-label"] || scan.status || ""),
    activity: String(scan.activity || ""),
    location: String(scan.location || ""),
  })) : existingShipment.scans || [];
  const shipment = {
    ...existingShipment,
    awb: awb || existingShipment.awb || "",
    courierName: String(payload.courier_name || existingShipment.courierName || "Shiprocket courier"),
    status: String(payload.current_status || payload.shipment_status || existingShipment.status || ""),
    statusId: String(payload.current_status_id || payload.shipment_status_id || existingShipment.statusId || ""),
    sourceOrderId: sourceOrderId || existingShipment.sourceOrderId || order.orderNumber,
    orderId: shiprocketOrderId || existingShipment.orderId || "",
    estimatedDelivery: String(payload.etd || existingShipment.estimatedDelivery || ""),
    lastActivity: scans.at(-1)?.activity || String(payload.activity || existingShipment.lastActivity || ""),
    lastLocation: scans.at(-1)?.location || String(payload.location || existingShipment.lastLocation || ""),
    scans,
    lastWebhookAt: timestamp,
  };
  let nextOrder = {
    ...order,
    shipping: {
      ...shipping,
      courier: shipment.courierName,
      trackingNumber: shipment.awb || shipping.trackingNumber || "Not assigned",
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
}

export async function updateOrderCustomerByEmail(email, changes) {
  const orders = await readOrders();
  const normalizedEmail = email.trim().toLowerCase();
  const nextOrders = orders.map((order) => order.customer.email.toLowerCase() === normalizedEmail ? { ...order, customer: { ...order.customer, ...changes } } : order);

  if (nextOrders.some((order, index) => order !== orders[index])) await writeOrders(nextOrders);
}
