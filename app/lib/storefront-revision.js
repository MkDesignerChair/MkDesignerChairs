import { createHash } from "node:crypto";
import { getStorefrontCategories } from "../../actions/category-catalog";
import { getFeaturedReviews } from "../../actions/review-store";
import { getSiteContent } from "../../actions/site-content";
import { getProducts } from "./products";

export async function getStorefrontRevision() {
  const [content, categories, products, reviews] = await Promise.all([getSiteContent(), getStorefrontCategories(), getProducts(), getFeaturedReviews()]);
  return createHash("sha256").update(JSON.stringify({ content, categories, products, reviews })).digest("hex");
}
