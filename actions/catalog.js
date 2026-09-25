import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getCategories } from "./category-catalog";
import { getPersistentJson, isPersistentDataConfigured, savePersistentJson } from "../app/lib/imagekit-store";

const overridesPath = join(process.cwd(), "data", "catalog-overrides.json");

function parseOverrides(contents) {
  const parsed = JSON.parse(contents);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Catalog overrides must be an object.");
  }

  return parsed;
}

export async function getCatalogOverrides() {
  const contents = await readFile(overridesPath, "utf8");
  const fallbackOverrides = parseOverrides(contents);
  return isPersistentDataConfigured() ? getPersistentJson("catalog-overrides.json", fallbackOverrides) : fallbackOverrides;
}

async function saveCatalogOverrides(overrides) {
  if (isPersistentDataConfigured()) {
    await savePersistentJson("catalog-overrides.json", overrides);
    return;
  }

  const directory = join(process.cwd(), "data");
  const temporaryPath = `${overridesPath}.tmp`;
  await mkdir(directory, { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");
  await rename(temporaryPath, overridesPath);
}

export async function deleteCatalogProduct(productId) {
  if (typeof productId !== "string" || !productId.trim()) {
    throw new Error("A product ID is required.");
  }

  const overrides = await getCatalogOverrides();
  const nextOverrides = { ...overrides, [productId]: { ...(overrides[productId] || {}), isDeleted: true } };
  await saveCatalogOverrides(nextOverrides);
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
  const categoryId = typeof changes.categoryId === "string" ? changes.categoryId : undefined;
  const isActive = typeof changes.isActive === "boolean" ? changes.isActive : undefined;
  const featured = typeof changes.featured === "boolean" ? changes.featured : undefined;
  const isCustomProduct = typeof changes.isCustomProduct === "boolean" ? changes.isCustomProduct : undefined;
  const stock = typeof changes.stock === "number" ? changes.stock : undefined;
  const galleryImages = Array.isArray(changes.galleryImages) ? changes.galleryImages : undefined;
  const textFields = ["shortDescription", "description", "material", "dimensions", "weightCapacity", "warranty", "finishOptions", "faqs", "seoTitle", "seoDescription", "badge", "image"];

  if (name !== undefined && !name) throw new Error("Product name cannot be empty.");
  if (price !== undefined && (!Number.isFinite(price) || price < 1)) throw new Error("Price must be a positive number.");
  if (categoryId !== undefined && !(await getCategories()).some((category) => category.id === categoryId)) throw new Error("Choose a valid chair category.");
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) throw new Error("Stock must be a whole number.");
  if (galleryImages !== undefined && (galleryImages.length > 8 || galleryImages.some((image) => typeof image !== "string" || !image.trim()))) {
    throw new Error("Add up to eight valid gallery images.");
  }

  const overrides = await getCatalogOverrides();
  const nextOverride = { ...(overrides[productId] || {}) };
  if (name !== undefined) nextOverride.name = name;
  if (price !== undefined) nextOverride.price = Math.round(price);
  if (categoryId !== undefined) nextOverride.categoryId = categoryId;
  if (isActive !== undefined) nextOverride.isActive = isActive;
  if (featured !== undefined) nextOverride.featured = featured;
  if (isCustomProduct !== undefined) nextOverride.isCustomProduct = isCustomProduct;
  if (stock !== undefined) nextOverride.stock = stock;
  if (galleryImages !== undefined) nextOverride.galleryImages = [...new Set(galleryImages.map((image) => image.trim()))];
  for (const field of textFields) {
    if (typeof changes[field] === "string") nextOverride[field] = changes[field].trim();
  }

  const nextOverrides = { ...overrides, [productId]: nextOverride };
  await saveCatalogOverrides(nextOverrides);

  return nextOverride;
}
