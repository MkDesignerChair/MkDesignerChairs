import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOrdersForCustomerEmail } from "../../actions/order-store";
import CustomerOrdersLiveRefresh from "../components/CustomerOrdersLiveRefresh";
import { CUSTOMER_SESSION_COOKIE, getCustomerSession } from "../lib/customer-auth";
import { getAdminProducts } from "../lib/products";

export const dynamic = "force-dynamic";

const trackingLabels = {
  placed: "Order placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

const progressSteps = [
  ["placed", "Order placed"],
  ["confirmed", "Confirmed"],
  ["packed", "Packed"],
  ["shipped", "Shipped"],
  ["out_for_delivery", "Out for delivery"],
  ["delivered", "Delivered"],
];

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function formatDateTime(value) {
  if (!value) return "Awaiting update";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function trackingUrl(order) {
  const shipment = order.shipping?.shiprocket;
  if (!shipment?.awb) return "";
  return order.shipping?.trackingUrl || shipment.trackingUrl || `https://shiprocket.co/tracking/${encodeURIComponent(shipment.awb)}`;
}

function FulfillmentProgress({ order }) {
  const currentIndex = Math.max(0, progressSteps.findIndex(([status]) => status === order.status));
  return <section className="customer-fulfillment-progress"><header><span>Live fulfillment progress</span><strong>{trackingLabels[order.status] || order.status}</strong></header><ol>{progressSteps.map(([status, label], index) => {
    const complete = index <= currentIndex;
    return <li className={complete ? "complete" : ""} key={status}><i aria-hidden="true" /><div><strong>{label}</strong><small>{complete ? formatDateTime(order.timeline?.[status]) : "Awaiting update"}</small></div></li>;
  })}</ol></section>;
}

function ShipmentTracking({ order, shipment, url }) {
  if (!shipment?.shipmentId) return <section className="customer-shipment-card customer-shipment-card--pending"><header><div><span>Shipment tracking</span><h3>Preparing your delivery</h3></div><em>Pending</em></header><p>We’ll share your Shiprocket tracking information after the shipment is created.</p></section>;

  const scans = Array.isArray(shipment.scans) ? shipment.scans.slice(-8).reverse() : [];
  const hasAwb = Boolean(shipment.awb);
  return <section className="customer-shipment-card"><header><div><span>Shipment tracking</span><h3>Powered by Shiprocket</h3></div><em>Live</em></header><div className="customer-shipment-summary"><span className="customer-shipment-state">{shipment.status || trackingLabels[order.status] || "Shipment created"}</span><span><small>Current location</small><strong>{shipment.lastLocation || "Awaiting carrier scan"}</strong></span></div><dl className="customer-shipment-meta"><div><dt>Shiprocket order ID</dt><dd>{shipment.orderId || "Pending"}</dd></div><div><dt>Shipment ID</dt><dd>{shipment.shipmentId}</dd></div><div><dt>Courier</dt><dd>{shipment.courierName || "Pending assignment"}</dd></div><div><dt>AWB number</dt><dd>{shipment.awb || "Pending assignment"}</dd></div>{shipment.estimatedDelivery && <div><dt>Estimated delivery</dt><dd>{formatDate(shipment.estimatedDelivery)}</dd></div>}</dl>{hasAwb && <a className="customer-track-button" href={url} rel="noreferrer" target="_blank">Track shipment on Shiprocket <span aria-hidden="true">↗</span></a>}{shipment.lastActivity && <p className="customer-latest-tracking"><strong>Latest update:</strong> {shipment.lastActivity}</p>}{scans.length > 0 && <div className="customer-scan-timeline"><h4>Tracking timeline</h4><ol>{scans.map((scan, index) => <li className={index === 0 ? "latest" : ""} key={`${scan.date}-${scan.activity}-${index}`}><i aria-hidden="true" /><div><strong>{scan.activity || scan.status || "Carrier update"}{index === 0 && <small>Latest</small>}</strong><span>{scan.location || "Location unavailable"} · {formatDateTime(scan.date)}</span></div></li>)}</ol></div>}</section>;
}

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const session = getCustomerSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!session) redirect("/login?next=%2Forders");

  const [orders, products] = await Promise.all([getOrdersForCustomerEmail(session.email), getAdminProducts()]);
  const productImagesById = new Map(products.map((product) => [product.id, product.image]));
  const productImagesByName = new Map(products.map((product) => [product.name.trim().toLowerCase(), product.image]));

  return <main className="cart-page customer-orders-page"><CustomerOrdersLiveRefresh /><section className="cart-shell"><p className="eyebrow">YOUR PURCHASES</p><h1>My Orders</h1><p className="customer-orders-intro">Track your purchases and view delivery updates from Shiprocket.</p>{orders.length === 0 ? <section className="empty-cart"><h2>No orders yet</h2><p>Orders you place while signed in with this email will appear here.</p><Link className="gold-button" href="/shop">Browse the shop</Link></section> : <section className="customer-orders-list">{orders.map((order) => {
    const shipment = order.shipping?.shiprocket;
    const awb = shipment?.awb || "";
    const url = trackingUrl(order);
    return <article className="customer-order-card" key={order.id}><header><div><span>{order.orderNumber}</span><h2>{trackingLabels[order.status] || order.status}</h2><small>Placed {formatDate(order.createdAt)}</small></div><strong>{formatMoney(order.totalAmount)}</strong></header><div className="customer-order-items">{order.items.map((item, index) => { const image = item.image || productImagesById.get(item.id) || productImagesByName.get(String(item.name || "").trim().toLowerCase()) || "/placeholder.png"; return <div key={`${item.name}-${index}`}><img alt={item.name} src={image} /><span><strong>{item.name}</strong><small>Quantity {item.quantity}</small></span></div>; })}</div><div className="customer-order-tracking"><FulfillmentProgress order={order} /><ShipmentTracking order={order} shipment={shipment} url={url} /></div>{!awb && shipment?.shipmentId && <footer><p>Tracking will be available once Shiprocket assigns an AWB number.</p></footer>}</article>;
  })}</section>}</section></main>;
}
