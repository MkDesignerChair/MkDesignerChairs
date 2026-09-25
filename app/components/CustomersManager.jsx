"use client";

import { useMemo, useState } from "react";

function formatMoney(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function updateList(setCustomers, id, changes) {
  setCustomers((current) => current.map((customer) => customer.id === id ? { ...customer, ...changes } : customer));
}

export default function CustomersManager({ initialCustomers }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [busyCustomerId, setBusyCustomerId] = useState("");
  const [message, setMessage] = useState("");

  const visibleCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...customers].filter((customer) => statusFilter === "all" || customer.status === statusFilter).filter((customer) => !query || [customer.name, customer.email, customer.phone].some((value) => value.toLowerCase().includes(query))).sort((left, right) => {
      if (sortBy === "spending") return right.totalSpent - left.totalSpent;
      if (sortBy === "orders") return right.orderCount - left.orderCount;
      if (sortBy === "name") return left.name.localeCompare(right.name);
      return new Date(right.latestActivity) - new Date(left.latestActivity);
    });
  }, [customers, search, sortBy, statusFilter]);

  async function persistCustomer(id, changes, successMessage) {
    setBusyCustomerId(id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/customers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, changes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update customer.");
      setCustomers((current) => current.map((customer) => customer.id === id ? result.customer : customer));
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update customer.");
    } finally {
      setBusyCustomerId("");
    }
  }

  async function removeCustomer(id, name) {
    if (!window.confirm(`Remove ${name}'s customer profile? Existing order records will be kept.`)) return;
    setBusyCustomerId(id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/customers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to remove customer.");
      setCustomers((current) => current.filter((customer) => customer.id !== id));
      setMessage("Customer profile removed. Historical order records were kept.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to remove customer.");
    } finally {
      setBusyCustomerId("");
    }
  }

  return <><div className="admin-page-heading"><div><p className="admin-kicker">CUSTOMER ACCOUNTS</p><h1>Customers</h1><p>Manage registered accounts and review each customer’s purchase and feedback history.</p></div></div><div className="admin-customer-tools"><label className="admin-search">⌕<input onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or phone" value={search} /></label><select aria-label="Filter customers by account status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="all">All accounts</option><option value="active">Active</option><option value="deactivated">Deactivated</option></select><select aria-label="Sort customers" onChange={(event) => setSortBy(event.target.value)} value={sortBy}><option value="recent">Latest activity</option><option value="spending">Highest spending</option><option value="orders">Most orders</option><option value="name">Name A–Z</option></select></div>{message && <p className="admin-message" role="status">{message}</p>}{visibleCustomers.length === 0 ? <section className="admin-empty"><span>⌁</span><h2>No matching customers</h2><p>Try changing your search or account-status filter.</p></section> : <section className="admin-customers-list" aria-label="Customer account management">{visibleCustomers.map((customer) => { const isBusy = busyCustomerId === customer.id; return <details className="admin-customer-card" key={customer.id}><summary><div><span className={customer.status === "active" ? "admin-customer-status admin-customer-status--active" : "admin-customer-status"}>{customer.status === "active" ? "Active" : "Deactivated"}</span><strong>{customer.name}</strong><small>{customer.email} · Joined {formatDate(customer.registeredAt)}</small></div><div><span>{customer.orderCount} order{customer.orderCount === 1 ? "" : "s"}</span><b>{formatMoney(customer.totalSpent)}</b><span className="admin-order-expand">View profile <b aria-hidden="true">→</b></span></div></summary><div className="admin-customer-details"><section className="admin-customer-profile"><h3>Account details</h3><div><label>Name<input disabled={isBusy} onChange={(event) => updateList(setCustomers, customer.id, { name: event.target.value })} value={customer.name} /></label><label>Email<input disabled={isBusy} onChange={(event) => updateList(setCustomers, customer.id, { email: event.target.value })} type="email" value={customer.email} /></label><label>Phone<input disabled={isBusy} onChange={(event) => updateList(setCustomers, customer.id, { phone: event.target.value })} value={customer.phone} /></label></div><p>Registered {formatDate(customer.registeredAt)} · Latest activity {formatDate(customer.latestActivity)}</p><div className="admin-customer-actions"><button className="admin-save-product" disabled={isBusy} onClick={() => persistCustomer(customer.id, customer, "Customer profile saved and linked order details updated.")} type="button">{isBusy ? "Saving…" : "Save profile"}</button><button className="admin-account-toggle" disabled={isBusy} onClick={() => persistCustomer(customer.id, { status: customer.status === "active" ? "deactivated" : "active" }, customer.status === "active" ? "Customer account deactivated." : "Customer account activated.")} type="button">{customer.status === "active" ? "Deactivate account" : "Activate account"}</button><button className="admin-delete-review" disabled={isBusy} onClick={() => removeCustomer(customer.id, customer.name)} type="button">Delete profile</button></div></section><section className="admin-customer-history"><h3>Order history</h3>{customer.orders.length === 0 ? <p>No purchase orders yet.</p> : customer.orders.map((order) => <div className="admin-customer-history-row" key={order.id}><span><strong>{order.orderNumber}</strong><small>{formatDate(order.createdAt)} · {order.status.replaceAll("_", " ")}</small></span><b>{formatMoney(order.totalAmount)}</b></div>)}</section><section className="admin-customer-history"><h3>Review history</h3>{customer.reviews.length === 0 ? <p>No reviews submitted yet.</p> : customer.reviews.map((review) => <div className="admin-customer-review" key={review.id}><strong>{review.productName} · {review.rating}/5</strong><p>{review.reviewText}</p><small>{review.isApproved ? "Approved" : "Pending review"}{review.isFeatured ? " · Featured" : ""}</small></div>)}</section></div></details>; })}</section>}</>;
}
