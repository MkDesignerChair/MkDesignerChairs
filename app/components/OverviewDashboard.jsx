"use client";

function formatMoney(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function orderStatusLabel(status) {
  return status.replaceAll("_", " ");
}

export default function OverviewDashboard({ customers, inquiries, onNavigate, orders, products, reviews }) {
  const paidRevenue = orders.filter((order) => order.payment?.status?.toLowerCase() === "paid").reduce((total, order) => total + Number(order.totalAmount || 0), 0);
  const openInquiries = inquiries.filter((inquiry) => inquiry.status !== "resolved").length;
  const pendingReviews = reviews.filter((review) => !review.isApproved).length;
  const activeProducts = products.filter((product) => product.isActive !== false).length;
  const recentOrders = orders.slice(0, 5);
  const recentInquiries = inquiries.slice(0, 4);

  return <><div className="admin-page-heading"><div><p className="admin-kicker">STORE PERFORMANCE</p><h1>Overview</h1><p>Live activity across orders, customer accounts, enquiries, and reviews.</p></div><a className="admin-site-link" href="/" rel="noreferrer" target="_blank">View store</a></div><div className="admin-stats admin-stats--live"><article><span>₹</span><strong>{formatMoney(paidRevenue)}</strong><small>Paid order revenue</small></article><article><span>◫</span><strong>{orders.length}</strong><small>Total orders</small></article><article><span>◉</span><strong>{customers.length}</strong><small>Registered customers</small></article><article><span>◷</span><strong>{openInquiries + pendingReviews}</strong><small>Items needing attention</small></article></div><section className="admin-overview-grid"><article className="admin-overview-panel"><header><div><p className="admin-kicker">LATEST SALES</p><h2>Recent orders</h2></div><button onClick={() => onNavigate("orders")} type="button">Manage orders</button></header>{recentOrders.length === 0 ? <p className="admin-overview-empty">No orders have been recorded yet.</p> : <div className="admin-overview-list">{recentOrders.map((order) => <div key={order.id}><span><strong>{order.orderNumber}</strong><small>{order.customer.name} · {formatDate(order.createdAt)}</small></span><span><em className={`admin-order-status admin-order-status--${order.status}`}>{orderStatusLabel(order.status)}</em><b>{formatMoney(order.totalAmount)}</b></span></div>)}</div>}</article><article className="admin-overview-panel"><header><div><p className="admin-kicker">CUSTOMER CARE</p><h2>Inbox & reviews</h2></div><button onClick={() => onNavigate("inquiries")} type="button">View enquiries</button></header><div className="admin-overview-care"><div><strong>{openInquiries}</strong><span>Open enquiries</span></div><div><strong>{pendingReviews}</strong><span>Reviews to moderate</span></div><div><strong>{activeProducts}</strong><span>Active products</span></div></div>{recentInquiries.length === 0 ? <p className="admin-overview-empty">No customer enquiries yet.</p> : <div className="admin-overview-list admin-overview-list--compact">{recentInquiries.map((inquiry) => <div key={inquiry.id}><span><strong>{inquiry.firstName} {inquiry.lastName}</strong><small>{inquiry.email} · {formatDate(inquiry.receivedAt)}</small></span><em className={`admin-enquiry-status admin-enquiry-status--${inquiry.status}`}>{inquiry.status.replaceAll("_", " ")}</em></div>)}</div>}</article></section></>;
}
