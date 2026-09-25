"use client";

import { useMemo, useState } from "react";

const statusLabels = { new: "New", contacted: "Contacted", in_progress: "In Progress", resolved: "Resolved" };

function formatDate(value, includeTime = false) {
  return new Intl.DateTimeFormat("en-IN", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function EnquiriesManager({ initialInquiries }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [busyInquiryId, setBusyInquiryId] = useState("");
  const [message, setMessage] = useState("");

  const visibleInquiries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...inquiries].filter((inquiry) => statusFilter === "all" || inquiry.status === statusFilter).filter((inquiry) => !dateFilter || inquiry.receivedAt.slice(0, 10) === dateFilter).filter((inquiry) => !query || [inquiry.firstName, inquiry.lastName, inquiry.email, inquiry.phone, inquiry.message].some((value) => value?.toLowerCase().includes(query))).sort((left, right) => sortBy === "oldest" ? new Date(left.receivedAt) - new Date(right.receivedAt) : new Date(right.receivedAt) - new Date(left.receivedAt));
  }, [dateFilter, inquiries, search, sortBy, statusFilter]);

  async function persistInquiry(id, changes, successMessage) {
    setBusyInquiryId(id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/inquiries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, changes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update enquiry.");
      setInquiries((current) => current.map((inquiry) => inquiry.id === id ? result.inquiry : inquiry));
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update enquiry.");
    } finally {
      setBusyInquiryId("");
    }
  }

  async function removeInquiry(id) {
    if (!window.confirm("Delete this enquiry permanently?")) return;
    setBusyInquiryId(id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/inquiries", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to delete enquiry.");
      setInquiries((current) => current.filter((inquiry) => inquiry.id !== id));
      setMessage("Enquiry deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete enquiry.");
    } finally {
      setBusyInquiryId("");
    }
  }

  return <><div className="admin-page-heading"><div><p className="admin-kicker">CUSTOMER MESSAGES</p><h1>Enquiries</h1><p>Review contact requests, update their progress, and keep customer conversations organized.</p></div></div><div className="admin-enquiry-tools"><label className="admin-search">⌕<input onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or message" value={search} /></label><select aria-label="Filter enquiries by status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="all">All statuses</option>{Object.entries(statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select><input aria-label="Filter enquiries by date" onChange={(event) => setDateFilter(event.target.value)} type="date" value={dateFilter} /><select aria-label="Sort enquiries" onChange={(event) => setSortBy(event.target.value)} value={sortBy}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>{message && <p className="admin-message" role="status">{message}</p>}{visibleInquiries.length === 0 ? <section className="admin-empty"><span>⌁</span><h2>No enquiries found</h2><p>{inquiries.length === 0 ? "New contact-form messages will appear here automatically." : "Try adjusting the search or filters."}</p></section> : <section className="admin-enquiries-list" aria-label="Customer enquiry management">{visibleInquiries.map((inquiry) => { const isBusy = busyInquiryId === inquiry.id; const fullName = `${inquiry.firstName} ${inquiry.lastName}`; return <details className="admin-enquiry-card" key={inquiry.id}><summary><div><span className={inquiry.isRead ? "admin-enquiry-read" : "admin-enquiry-read admin-enquiry-read--new"}>{inquiry.isRead ? "Read" : "Unread"}</span><strong>{fullName}</strong><small>{inquiry.email} · {formatDate(inquiry.receivedAt, true)}</small></div><div><span className={`admin-enquiry-status admin-enquiry-status--${inquiry.status}`}>{statusLabels[inquiry.status]}</span><span className="admin-order-expand">View message <b aria-hidden="true">→</b></span></div></summary><div className="admin-enquiry-details"><section><h3>Customer details</h3><p><strong>{fullName}</strong><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>{inquiry.phone && <a href={`tel:${inquiry.phone.replace(/\s/g, "")}`}>{inquiry.phone}</a>}<small>Submitted {formatDate(inquiry.receivedAt, true)}</small></p></section><section className="admin-enquiry-message"><h3>Message</h3><p>{inquiry.message}</p></section><section className="admin-enquiry-controls"><h3>Manage enquiry</h3><label>Status<select disabled={isBusy} onChange={(event) => persistInquiry(inquiry.id, { status: event.target.value }, `Enquiry marked ${statusLabels[event.target.value]}.`)} value={inquiry.status}>{Object.entries(statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></label><div><button className="admin-account-toggle" disabled={isBusy} onClick={() => persistInquiry(inquiry.id, { isRead: !inquiry.isRead }, inquiry.isRead ? "Enquiry marked unread." : "Enquiry marked read.")} type="button">Mark as {inquiry.isRead ? "unread" : "read"}</button><button className="admin-delete-review" disabled={isBusy} onClick={() => removeInquiry(inquiry.id)} type="button">Delete enquiry</button></div></section></div></details>; })}</section>}</>;
}
