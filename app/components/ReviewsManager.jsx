"use client";

import { useState } from "react";

function formatReviewDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function ReviewsManager({ initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [busyReviewId, setBusyReviewId] = useState("");
  const [message, setMessage] = useState("");

  function updateDraft(id, field, value) {
    setReviews((current) => current.map((review) => review.id === id ? { ...review, [field]: value } : review));
  }

  async function readApiResponse(response) {
    const body = await response.text();
    if (!body) return { error: "The server returned an empty response." };
    try {
      return JSON.parse(body);
    } catch {
      return { error: "The server returned an invalid response." };
    }
  }

  async function persistReview(id, changes, successMessage) {
    setBusyReviewId(id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, changes }) });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.error || "Unable to update review.");
      setReviews((current) => current.map((review) => review.id === id ? result.review : review));
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update review.");
    } finally {
      setBusyReviewId("");
    }
  }

  async function deleteReview(id) {
    if (!window.confirm("Delete this review permanently?")) return;
    setBusyReviewId(id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.error || "Unable to delete review.");
      setReviews((current) => current.filter((review) => review.id !== id));
      setMessage("Review deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete review.");
    } finally {
      setBusyReviewId("");
    }
  }

  return <><div className="admin-page-heading"><div><p className="admin-kicker">CUSTOMER FEEDBACK</p><h1>Reviews</h1><p>Moderate submitted reviews and select approved feedback for the homepage.</p></div></div>{message && <p className="admin-message" role="status">{message}</p>}{reviews.length === 0 ? <section className="admin-empty"><span>☆</span><h2>No customer reviews yet</h2><p>Reviews submitted after purchases will appear here for approval and moderation.</p></section> : <section className="admin-reviews-grid" aria-label="Customer review management">{reviews.map((review) => { const isBusy = busyReviewId === review.id; return <article className="admin-review-card" key={review.id}><header><div><span className={review.isApproved ? "admin-review-status admin-review-status--approved" : "admin-review-status"}>{review.isApproved ? "Approved" : "Pending review"}</span><h2>{review.customerName}</h2><p>{review.productName} · {formatReviewDate(review.createdAt)}</p></div><strong aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong></header><div className="admin-review-fields"><label>Customer name<input disabled={isBusy} value={review.customerName} onChange={(event) => updateDraft(review.id, "customerName", event.target.value)} /></label><label>Customer role<input disabled={isBusy} value={review.customerRole} onChange={(event) => updateDraft(review.id, "customerRole", event.target.value)} /></label><label>Purchased product<input disabled={isBusy} value={review.productName} onChange={(event) => updateDraft(review.id, "productName", event.target.value)} /></label><label>Rating<select disabled={isBusy} value={review.rating} onChange={(event) => updateDraft(review.id, "rating", Number(event.target.value))}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}</select></label><label className="admin-review-text">Review<textarea disabled={isBusy} rows="4" value={review.reviewText} onChange={(event) => updateDraft(review.id, "reviewText", event.target.value)} /></label></div><div className="admin-review-controls"><label className="admin-check"><input checked={review.isApproved} disabled={isBusy} type="checkbox" onChange={(event) => persistReview(review.id, { isApproved: event.target.checked, isFeatured: event.target.checked ? review.isFeatured : false }, event.target.checked ? "Review approved." : "Review returned to pending.")} />Approve review</label><label className="admin-check"><input checked={review.isFeatured} disabled={isBusy} type="checkbox" onChange={(event) => persistReview(review.id, { isFeatured: event.target.checked, isApproved: event.target.checked ? true : review.isApproved }, event.target.checked ? "Review is now featured on the homepage." : "Review removed from the homepage.")} />Featured review</label></div><div className="admin-review-actions"><button className="admin-save-product" disabled={isBusy} type="button" onClick={() => persistReview(review.id, review, "Review changes saved.")}>{isBusy ? "Saving…" : "Save changes"}</button><button className="admin-delete-review" disabled={isBusy} type="button" onClick={() => deleteReview(review.id)}>Delete review</button></div></article>; })}</section>}</>;
}
