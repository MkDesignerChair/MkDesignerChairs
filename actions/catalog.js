import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const overridesPath = join(process.cwd(), "data", "catalog-overrides.json");
const allowedCategories = new Set(["Office Chairs", "Dining Chairs", "Lounge Chairs", "Accent Chairs", "Ergonomic Chairs"]);

function parseOverrides(contents) {
  const parsed = JSON.parse(contents);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Catalog overrides must be an object.");
  }

  return parsed;
}

export async function getCatalogOverrides() {
  const contents = await readFile(overridesPath, "utf8");

  return parseOverrides(contents);
}

export async function updateCatalogOverride(productId, changes) {
  if (typeof productId !== "string" || !productId.trim()) {
    throw new Error("A product ID is required.");
  }

  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    throw new Error("Product changes must be an object.");
  }

  const name = typeof changes.name === "string" ? changes.name.trim() : undefined;
  const price = typeof changes.price === "number" ? changes.price : undefined;
  const category = typeof changes.category === "string" ? changes.category : undefined;
  const isActive = typeof changes.isActive === "boolean" ? changes.isActive : undefined;
  const featured = typeof changes.featured === "boolean" ? changes.featured : undefined;
  const stock = typeof changes.stock === "number" ? changes.stock : undefined;
  const textFields = ["shortDescription", "description", "material", "dimensions", "weightCapacity", "warranty", "finishOptions", "faqs", "seoTitle", "seoDescription", "badge", "image"];

  if (name !== undefined && !name) throw new Error("Product name cannot be empty.");
  if (price !== undefined && (!Number.isFinite(price) || price < 1)) throw new Error("Price must be a positive number.");
  if (category !== undefined && !allowedCategories.has(category)) throw new Error("Choose a valid chair category.");
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) throw new Error("Stock must be a whole number.");

  const overrides = await getCatalogOverrides();
  const nextOverride = { ...(overrides[productId] || {}) };
  if (name !== undefined) nextOverride.name = name;
  if (price !== undefined) nextOverride.price = Math.round(price);
  if (category !== undefined) nextOverride.category = category;
  if (isActive !== undefined) nextOverride.isActive = isActive;
  if (featured !== undefined) nextOverride.featured = featured;
  if (stock !== undefined) nextOverride.stock = stock;
  for (const field of textFields) {
    if (typeof changes[field] === "string") nextOverride[field] = changes[field].trim();
  }

  const nextOverrides = { ...overrides, [productId]: nextOverride };
  const directory = join(process.cwd(), "data");
  const temporaryPath = `${overridesPath}.tmp`;
  await mkdir(directory, { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(nextOverrides, null, 2)}\n`, "utf8");
  await rename(temporaryPath, overridesPath);

  return nextOverride;
}
