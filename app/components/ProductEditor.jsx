"use client";

import { useState } from "react";

const categories = ["Office Chairs", "Dining Chairs", "Lounge Chairs", "Accent Chairs", "Ergonomic Chairs"];

export default function ProductEditor({ product, onClose, onSaved }) {
  const [draft, setDraft] = useState(product);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function setField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function uploadImage(file) {
    if (!file) return;
    setIsSaving(true);
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body: formData });
    const result = await response.json();
    setIsSaving(false);
    if (!response.ok) { setMessage(result.error || "Unable to upload image."); return; }
    setField("image", result.image);
    setMessage("Image uploaded. Save the chair to publish it.");
  }

  async function save(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    const { id, ...changes } = draft;
    const response = await fetch("/api/admin/catalog", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, changes: { ...changes, price: Number(draft.price), stock: Number(draft.stock || 0) } }) });
    const result = await response.json();
    setIsSaving(false);
    if (!response.ok) { setMessage(result.error || "Unable to save chair."); return; }
    onSaved({ ...draft, ...result.override });
    onClose();
  }

  return <section className="admin-product-editor"><div className="admin-page-heading"><div><p className="admin-kicker">CHAIR CATALOG</p><h1>Edit product</h1><p>Update all customer-facing information for {product.name}.</p></div><button className="admin-site-link" type="button" onClick={onClose}>← Back to products</button></div><form onSubmit={save}><div className="admin-editor-grid"><section className="admin-editor-card"><h2>Basic information</h2><label>Product name<input required value={draft.name} onChange={(event) => setField("name", event.target.value)} /></label><div className="admin-editor-two"><label>Category<select value={draft.category} onChange={(event) => setField("category", event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Price (₹)<input min="1" required type="number" value={draft.price} onChange={(event) => setField("price", event.target.value)} /></label></div><label>Short description<textarea value={draft.shortDescription || ""} onChange={(event) => setField("shortDescription", event.target.value)} /></label><label>Full description<textarea rows="6" value={draft.description || ""} onChange={(event) => setField("description", event.target.value)} /></label></section><section className="admin-editor-card"><h2>Image & availability</h2><img className="admin-editor-image" src={draft.image} alt={draft.name} /><label className="admin-file-input">Replace product image<input accept="image/jpeg,image/png,image/webp" disabled={isSaving} type="file" onChange={(event) => uploadImage(event.target.files?.[0])} /></label><small>JPG, PNG, or WEBP · max 5 MB</small><label>Stock quantity<input min="0" type="number" value={draft.stock || 0} onChange={(event) => setField("stock", event.target.value)} /></label><label>Badge / tag<input placeholder="Best seller, New arrival" value={draft.badge || ""} onChange={(event) => setField("badge", event.target.value)} /></label><label className="admin-check"><input checked={draft.isActive !== false} type="checkbox" onChange={(event) => setField("isActive", event.target.checked)} />Visible in storefront</label><label className="admin-check"><input checked={Boolean(draft.featured)} type="checkbox" onChange={(event) => setField("featured", event.target.checked)} />Feature on homepage</label></section><section className="admin-editor-card"><h2>Chair specifications</h2><div className="admin-editor-two">{[["material", "Upholstery material"], ["finishOptions", "Finish / colors"], ["dimensions", "Dimensions"], ["weightCapacity", "Weight capacity"], ["warranty", "Warranty"]].map(([field, label]) => <label key={field}>{label}<input value={draft[field] || ""} onChange={(event) => setField(field, event.target.value)} /></label>)}</div></section><section className="admin-editor-card"><h2>Product FAQs</h2><label>Questions and answers<textarea rows="7" placeholder={"What is the weight capacity?\n130 kg\n\nDoes it require assembly?\nMinimal assembly is required."} value={draft.faqs || ""} onChange={(event) => setField("faqs", event.target.value)} /></label><small>Use a blank line between FAQs.</small></section><section className="admin-editor-card"><h2>Search metadata</h2><label>SEO title<input value={draft.seoTitle || ""} onChange={(event) => setField("seoTitle", event.target.value)} /></label><label>SEO description<textarea rows="4" value={draft.seoDescription || ""} onChange={(event) => setField("seoDescription", event.target.value)} /></label></section></div>{message && <p className="admin-message" role="status">{message}</p>}<button className="admin-save-product" disabled={isSaving} type="submit">{isSaving ? "Saving…" : "Save product changes"}</button></form></section>;
}
