import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getPersistentJson, isPersistentDataConfigured, savePersistentJson } from "../app/lib/imagekit-store";

const categoriesPath = join(process.cwd(), "data", "categories.json");

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function writeCategories(categories) {
  if (isPersistentDataConfigured()) {
    await savePersistentJson("categories.json", categories);
    return;
  }

  const temporaryPath = `${categoriesPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(categories, null, 2)}\n`, "utf8");
  await rename(temporaryPath, categoriesPath);
}

export async function getCategories() {
  const fallbackCategories = JSON.parse(await readFile(categoriesPath, "utf8"));
  const categories = isPersistentDataConfigured() ? await getPersistentJson("categories.json", fallbackCategories) : fallbackCategories;
  if (!Array.isArray(categories)) throw new Error("Categories must be a list.");
  return categories;
}

export async function getStorefrontCategories() {
  const categories = await getCategories();
  return categories.filter((category) => category.isActive !== false);
}

export async function createCategory(changes) {
  const categories = await getCategories();
  const name = typeof changes.name === "string" ? changes.name.trim() : "";
  const slugSource = typeof changes.slug === "string" && changes.slug.trim() ? changes.slug : name;
  const slug = slugify(slugSource);
  const description = typeof changes.description === "string" ? changes.description.trim() : "";
  const image = typeof changes.image === "string" ? changes.image.trim() : "";
  const featured = changes.featured === true;
  const isActive = changes.isActive !== false;

  if (!name) throw new Error("Category name cannot be empty.");
  if (!slug) throw new Error("Category slug cannot be empty.");
  if (categories.some((category) => category.id === slug || category.slug === slug)) throw new Error("A category already uses that name or slug.");

  const category = { id: slug, name, slug, description, image, defaultImage: image, featured, isActive };
  await writeCategories([...categories, category]);
  return category;
}

export async function updateCategory(id, changes) {
  const categories = await getCategories();
  const index = categories.findIndex((category) => category.id === id);
  if (index === -1) throw new Error("Category not found.");

  const current = categories[index];
  const name = typeof changes.name === "string" ? changes.name.trim() : current.name;
  const slug = typeof changes.slug === "string" ? slugify(changes.slug) : current.slug;
  const description = typeof changes.description === "string" ? changes.description.trim() : current.description;
  const image = typeof changes.image === "string" ? changes.image.trim() : current.image;
  const featured = typeof changes.featured === "boolean" ? changes.featured : current.featured;
  const isActive = typeof changes.isActive === "boolean" ? changes.isActive : current.isActive !== false;

  if (!name) throw new Error("Category name cannot be empty.");
  if (!slug) throw new Error("Category slug cannot be empty.");
  if (categories.some((category) => category.id !== id && category.slug === slug)) throw new Error("A category already uses that slug.");

  const category = { ...current, name, slug, description, image, featured, isActive };
  const nextCategories = [...categories];
  nextCategories[index] = category;
  await writeCategories(nextCategories);
  return category;
}

export async function deleteCategory(id) {
  const categories = await getCategories();
  if (categories.length <= 1) throw new Error("Keep at least one category in the catalog.");
  if (!categories.some((category) => category.id === id)) throw new Error("Category not found.");

  const nextCategories = categories.filter((category) => category.id !== id);
  await writeCategories(nextCategories);
  return { fallbackCategory: nextCategories[0] };
}
