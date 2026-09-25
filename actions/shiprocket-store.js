import { assignAwb, createShipment, schedulePickup } from "../app/lib/shiprocket";
import { getOrder, updateShiprocketShipment } from "./order-store";

async function requireOrder(id) {
  const order = await getOrder(id);
  if (!order) throw new Error("Order not found.");
  return order;
}

export async function createShiprocketShipmentForOrder(id) {
  const order = await requireOrder(id);
  const existingShipment = order.shipping?.shiprocket;
  if (existingShipment?.shipmentId) throw new Error("This order already has a Shiprocket shipment.");

  const shipment = await createShipment(order);
  return updateShiprocketShipment(id, shipment);
}

export async function assignShiprocketAwbForOrder(id, courierId) {
  const order = await requireOrder(id);
  const shipment = order.shipping?.shiprocket;
  if (!shipment?.shipmentId) throw new Error("Create the Shiprocket shipment before assigning an AWB.");
  if (shipment.awb) throw new Error("This order already has an AWB.");

  const updatedShipment = await assignAwb(order, shipment, courierId);
  return updateShiprocketShipment(id, updatedShipment);
}

export async function scheduleShiprocketPickupForOrder(id) {
  const order = await requireOrder(id);
  const shipment = order.shipping?.shiprocket;
  if (!shipment?.shipmentId || !shipment.awb) throw new Error("Assign an AWB before scheduling pickup.");
  if (shipment.pickupScheduledAt) throw new Error("Pickup is already scheduled for this order.");

  const updatedShipment = await schedulePickup(shipment);
  return updateShiprocketShipment(id, updatedShipment);
}
