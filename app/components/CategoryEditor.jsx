"use client";

import { useState } from "react";

export default function CategoryEditor({ category, productCount, onClose, onDeleted, onSaved }) {
  const [draft, setDraft] = useState(category);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const previewImage = draft.image || draft.defaultImage || "/placeholder.png";
  const hasUploadedImage = draft.image?.startsWith("/uploads/");

  function setField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function saveCategory(changes) {
    const response = await fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: category.id, changes }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to save category.");
    setDraft(result.category);
    onSaved(result.category);
    return result.category;
  }

  async function save(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      await saveCategory({ name: draft.name, slug: draft.slug, description: draft.description, featured: draft.featured, image: draft.image });
      setMessage("Category saved. Product choices and storefront filters are updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save category.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteUploadedImage(image) {
    if (!image?.startsWith("/uploads/")) return;
    const response = await fetch("/api/admin/category-media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image }) });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Unable to remove the image.");
    }
  }

  async function uploadImage(file) {
    if (!file) return;
    const previousImage = draft.image;
    setIsSaving(true);
    setMessage("");
    const formData = new FormData();
    formData.set("file", file);
    try {
      const uploadResponse = await fetch("/api/admin/category-media", { method: "POST", body: formData });
      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadResult.error || "Unable to upload image.");
      await saveCategory({ image: uploadResult.image });
      await deleteUploadedImage(previousImage);
      setMessage("Category image updated and published.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update image.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeImage() {
    const previousImage = draft.image;
    setIsSaving(true);
    setMessage("");
    try {
      await saveCategory({ image: "" });
      await deleteUploadedImage(previousImage);
      setMessage("Uploaded image removed. The original category image is restored.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to remove image.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeCategory() {
    if (!window.confirm(`Delete ${category.name}? Its ${productCount} product${productCount === 1 ? "" : "s"} will move to the remaining fallback category.`)) return;
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: category.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to delete category.");
      onDeleted(category.id, result.fallbackCategory);
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete category.");
    } finally {
      setIsSaving(false);
    }
  }

  return <section className="admin-product-editor"><div className="admin-page-heading"><div><p className="admin-kicker">CATALOG STRUCTURE</p><h1>Edit category</h1><p>Changes update product selection, shop filters, and category links throughout the storefront.</p></div><button className="admin-site-link admin-editor-back" type="button" onClick={onClose}>← Back to categories</button></div><form onSubmit={save}><div className="admin-editor-grid"><section className="admin-editor-card"><h2>Category details</h2><label>Category name<input required value={draft.name} onChange={(event) => setField("name", event.target.value)} /></label><label>Slug<input required value={draft.slug} onChange={(event) => setField("slug", event.target.value)} /></label><label>Description<textarea rows="5" value={draft.description} onChange={(event) => setField("description", event.target.value)} /></label><label className="admin-check"><input checked={Boolean(draft.featured)} type="checkbox" onChange={(event) => setField("featured", event.target.checked)} />Featured Category</label><p className="admin-editor-hint">Featured categories appear in the homepage “Designed for Every Space” section.</p></section><section className="admin-editor-card"><h2>Category image</h2><img className="admin-editor-image" src={previewImage} alt={draft.name} /><label className="admin-file-input">{hasUploadedImage ? "Replace category image" : "Upload category image"}<input accept="image/jpeg,image/png,image/webp" disabled={isSaving} type="file" onChange={(event) => { uploadImage(event.target.files?.[0]); event.target.value = ""; }} /></label><small>JPG, PNG, or WEBP · max 5 MB</small>{hasUploadedImage && <button className="admin-delete-image" disabled={isSaving} type="button" onClick={removeImage}>Delete uploaded image</button>}<p className="admin-editor-hint">{productCount} product{productCount === 1 ? "" : "s"} currently use this category.</p></section></div>{message && <p className="admin-message admin-category-message" role="status">{message}</p>}<div className="admin-category-editor-actions"><button className="admin-save-product" disabled={isSaving} type="submit">{isSaving ? "Saving…" : "Save category changes"}</button><button className="admin-delete-category" disabled={isSaving} type="button" onClick={removeCategory}>Delete category</button></div></form></section>;
}
