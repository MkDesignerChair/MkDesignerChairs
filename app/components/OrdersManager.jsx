"use client";

import { useState } from "react";

const trackingSteps = [["placed", "Order Placed"], ["confirmed", "Confirmed"], ["packed", "Packed"], ["shipped", "Shipped"], ["out_for_delivery", "Out for Delivery"], ["delivered", "Delivered"]];

function formatMoney(value) { return `₹${Number(value).toLocaleString("en-IN")}`; }

function formatDate(value, includeTime = false) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function statusLabel(status) { return trackingSteps.find(([value]) => value === status)?.[1] || status; }

function OrderTimeline({ order }) {
  const currentIndex = trackingSteps.findIndex(([status]) => status === order.status);
  return <ol className="admin-order-timeline">{trackingSteps.map(([status, label], index) => {
    const timestamp = order.timeline?.[status];
    const completed = index <= currentIndex;
    return <li className={completed ? "complete" : ""} key={status}><span aria-hidden="true" /><div><strong>{label}</strong><small>{completed ? timestamp ? formatDate(timestamp, true) : "Completed" : "Awaiting update"}</small></div></li>;
  })}</ol>;
}

function ShiprocketDelivery({ isSaving, onAction, order }) {
  const shipment = order.shipping?.shiprocket;
  const isCreated = Boolean(shipment?.shipmentId);
  const hasAwb = Boolean(shipment?.awb);
  const pickupScheduled = Boolean(shipment?.pickupScheduledAt);

  return <section className="admin-shiprocket-panel">
    <header><div><p className="admin-kicker">SHIPROCKET</p><h3>Delivery partner</h3>{isCreated && <small className="admin-shiprocket-order-id">Shiprocket Order ID: {shipment.orderId}</small>}</div><span className={`admin-shiprocket-state admin-shiprocket-state--${isCreated ? "ready" : "idle"}`}>{isCreated ? shipment.status || "Shipment created" : "Not created"}</span></header>
    {isCreated ? <div className="admin-shiprocket-details"><span><small>Shipment ID</small><strong>{shipment.shipmentId}</strong></span><span><small>Courier</small><strong>{shipment.courierName || "Select on AWB assignment"}</strong></span><span><small>AWB</small><strong>{shipment.awb || "Not assigned"}</strong></span>{shipment.pickupToken && <span><small>Pickup token</small><strong>{shipment.pickupToken}</strong></span>}{shipment.lastActivity && <p><strong>Latest update:</strong> {shipment.lastActivity}{shipment.lastLocation ? ` · ${shipment.lastLocation}` : ""}</p>}</div> : <p className="admin-shiprocket-hint">Create a shipment only after confirming the customer address and packed parcel details.</p>}
    <div className="admin-shiprocket-actions">
      {!isCreated && <button disabled={isSaving} onClick={() => onAction(order.id, "create")} type="button">{isSaving ? "Creating…" : "Create shipment"}</button>}
      {isCreated && !hasAwb && <button disabled={isSaving} onClick={() => onAction(order.id, "assign_awb")} type="button">{isSaving ? "Assigning…" : "Assign AWB"}</button>}
      {hasAwb && !pickupScheduled && <button disabled={isSaving} onClick={() => onAction(order.id, "schedule_pickup")} type="button">{isSaving ? "Scheduling…" : "Schedule pickup"}</button>}
      {pickupScheduled && <span className="admin-shiprocket-complete">Pickup scheduled {formatDate(shipment.pickupScheduledAt, true)}</span>}
    </div>
  </section>;
}

function OrderDetails({ order, isSaving, onShipmentAction, onStatusChange }) {
  const address = order.shipping || {};
  return <div className="admin-order-details"><div className="admin-order-info-grid"><section><h3>Customer</h3><p><strong>{order.customer.name}</strong><a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>{order.customer.phone && <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`}>{order.customer.phone}</a>}</p></section><section><h3>Payment</h3><p><strong>{order.payment.method}</strong><span className={`admin-payment-status admin-payment-status--${order.payment.status.toLowerCase()}`}>{order.payment.status}</span><small>Payment ID: {order.payment.transactionId || "Not available"}</small></p></section><section><h3>Delivery</h3><p><strong>{address.courier || "Courier pending"}</strong><small>Tracking: {address.trackingNumber || "Not assigned"}</small><small>Estimated: {formatDate(address.estimatedDeliveryDate)}</small></p></section><section><h3>Shipping address</h3><p><strong>{address.addressLine1}</strong>{address.addressLine2 && <span>{address.addressLine2}</span>}<span>{address.city}, {address.state} {address.postalCode}</span></p></section></div><section className="admin-order-items"><h3>Ordered products</h3>{order.items.map((item, index) => <div key={`${item.name}-${index}`}><span><strong>{item.name}</strong><small>Qty {item.quantity} × {formatMoney(item.unitPrice)}</small></span><b>{formatMoney(item.quantity * item.unitPrice)}</b></div>)}<footer><span>Subtotal <b>{formatMoney(order.subtotal)}</b></span><span>Shipping <b>{order.shippingCost ? formatMoney(order.shippingCost) : "Free"}</b></span><strong>Total <b>{formatMoney(order.totalAmount)}</b></strong></footer></section><section className="admin-order-tracking"><div><h3>Order tracking</h3><p>Track fulfillment updates and manage the live Shiprocket delivery workflow.</p></div><ShiprocketDelivery isSaving={isSaving} onAction={onShipmentAction} order={order} /><OrderTimeline order={order} /><label>Fulfillment status<select disabled={isSaving} value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)}>{trackingSteps.map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></label></section></div>;
}

export default function OrdersManager({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [savingOrderId, setSavingOrderId] = useState("");
  const [message, setMessage] = useState("");

  function replaceOrder(order) { setOrders((current) => current.map((item) => item.id === order.id ? order : item)); }

  async function updateStatus(id, status) {
    setSavingOrderId(id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update fulfillment status.");
      replaceOrder(result.order);
      setMessage(`${result.order.orderNumber} is now ${statusLabel(result.order.status)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update fulfillment status.");
    } finally { setSavingOrderId(""); }
  }

  async function updateShipment(id, action) {
    const labels = { create: "create a Shiprocket shipment", assign_awb: "assign an AWB", schedule_pickup: "schedule pickup" };
    if (!window.confirm(`Are you sure you want to ${labels[action]} for this order?`)) return;
    setSavingOrderId(id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/shipments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update the Shiprocket shipment.");
      replaceOrder(result.order);
      setMessage(`${result.order.orderNumber}: ${labels[action]} completed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update the Shiprocket shipment.");
    } finally { setSavingOrderId(""); }
  }

  return <><div className="admin-page-heading"><div><p className="admin-kicker">CUSTOMER FULFILLMENT</p><h1>Orders</h1><p>Review order details, then create, label, and schedule each shipment when it is ready.</p></div></div>{message && <p className="admin-message" role="status">{message}</p>}{orders.length === 0 ? <section className="admin-empty"><span>⌁</span><h2>No orders yet</h2><p>New purchase orders will appear here with their payment and delivery details.</p></section> : <section className="admin-orders-list" aria-label="Order tracking dashboard">{orders.map((order) => <details className="admin-order-card" key={order.id}><summary><div><span className="admin-order-number">{order.orderNumber}</span><strong>{order.customer.name}</strong><small>{formatDate(order.createdAt, true)}</small></div><div><span className={`admin-order-status admin-order-status--${order.status}`}>{statusLabel(order.status)}</span><span className="admin-order-expand">View details</span></div></summary><OrderDetails isSaving={savingOrderId === order.id} onShipmentAction={updateShipment} onStatusChange={updateStatus} order={order} /></details>)}</section>}</>;
}
