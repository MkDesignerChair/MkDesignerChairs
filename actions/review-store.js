import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const filePath = join(process.cwd(), "data", "reviews.json");
const editableFields = new Set(["customerName", "customerRole", "productName", "rating", "reviewText", "isApproved", "isFeatured"]);

async function readReviews() {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeReviews(reviews) {
  await writeFile(`${filePath}.tmp`, `${JSON.stringify(reviews, null, 2)}\n`, "utf8");
  await rename(`${filePath}.tmp`, filePath);
}

function sanitizeChanges(changes) {
  if (!changes || typeof changes !== "object") throw new Error("Invalid review changes.");
  const next = {};

  for (const [field, value] of Object.entries(changes)) {
    if (!editableFields.has(field)) continue;
    if (["customerName", "customerRole", "productName", "reviewText"].includes(field)) {
      if (typeof value !== "string") throw new Error(`Invalid ${field}.`);
      next[field] = value.trim();
    }
    if (["isApproved", "isFeatured"].includes(field)) {
      if (typeof value !== "boolean") throw new Error(`Invalid ${field}.`);
      next[field] = value;
    }
    if (field === "rating") {
      const rating = Number(value);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");
      next.rating = rating;
    }
  }

  if (next.isFeatured) next.isApproved = true;
  return next;
}

export async function getReviews() {
  const reviews = await readReviews();
  return reviews.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export async function getFeaturedReviews() {
  const reviews = await getReviews();
  return reviews.filter((review) => review.isApproved && review.isFeatured);
}

export async function updateReview(id, changes) {
  if (typeof id !== "string" || !id) throw new Error("Review ID is required.");
  const reviews = await readReviews();
  const index = reviews.findIndex((review) => review.id === id);
  if (index === -1) throw new Error("Review not found.");

  reviews[index] = { ...reviews[index], ...sanitizeChanges(changes) };
  await writeReviews(reviews);
  return reviews[index];
}

export async function deleteReview(id) {
  if (typeof id !== "string" || !id) throw new Error("Review ID is required.");
  const reviews = await readReviews();
  const nextReviews = reviews.filter((review) => review.id !== id);
  if (nextReviews.length === reviews.length) throw new Error("Review not found.");
  await writeReviews(nextReviews);
}

export async function updateReviewCustomerName(previousName, nextName) {
  const reviews = await readReviews();
  const normalizedName = previousName.trim().toLowerCase();
  const nextReviews = reviews.map((review) => review.customerName.trim().toLowerCase() === normalizedName ? { ...review, customerName: nextName } : review);

  if (nextReviews.some((review, index) => review !== reviews[index])) await writeReviews(nextReviews);
}
