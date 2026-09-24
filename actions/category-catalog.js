import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const categoriesPath = join(process.cwd(), "data", "categories.json");

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function writeCategories(categories) {
  const temporaryPath = `${categoriesPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(categories, null, 2)}\n`, "utf8");
  await rename(temporaryPath, categoriesPath);
}

export async function getCategories() {
  const categories = JSON.parse(await readFile(categoriesPath, "utf8"));
  if (!Array.isArray(categories)) throw new Error("Categories must be a list.");
  return categories;
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

  if (!name) throw new Error("Category name cannot be empty.");
  if (!slug) throw new Error("Category slug cannot be empty.");
  if (categories.some((category) => category.id !== id && category.slug === slug)) throw new Error("A category already uses that slug.");

  const category = { ...current, name, slug, description, image, featured };
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
