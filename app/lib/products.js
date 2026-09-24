import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { getCatalogOverrides } from "../../actions/catalog";
import { getCategories } from "../../actions/category-catalog";

const defaultCategoryIds = ["office", "dining", "lounge", "accent", "ergonomic"];
const defaultFeaturedProducts = new Set([
  "office chair.jpeg",
  "WhatsApp Image 2026-09-12 at 1.09.05 PMasd.jpeg",
  "WhatsApp Image 2026-09-12 at 1.09.06 PMdfd.jpeg",
  "WhatsApp Image 2026-09-12 at 1.09.07 PMdfd.jpeg",
]);

function formatProductName(filename, index) {
  if (filename === "office chair.jpeg") {
    return "Executive Office Chair";
  }

  return `Signature Chair ${String(index + 1).padStart(2, "0")}`;
}

async function getCatalogProducts() {
  const filenames = (await readdir(join(process.cwd(), "Public", "Products"))).filter((filename) => /\.(jpe?g|png)$/i.test(filename)).sort();
  const [overrides, categories] = await Promise.all([getCatalogOverrides(), getCategories()]);
  const fallbackCategory = categories[0];

  if (!fallbackCategory) throw new Error("At least one category is required.");

  return filenames.map((filename, index) => {
    const name = formatProductName(filename, index);
    const price = 7999 + (index % 10) * 750;
    const override = overrides[filename] || {};
    const defaultCategoryId = filename === "office chair.jpeg" ? "office" : defaultCategoryIds[(index - 1 + defaultCategoryIds.length) % defaultCategoryIds.length];
    const legacyCategory = categories.find((category) => category.name === override.category);
    const category = categories.find((item) => item.id === (override.categoryId || legacyCategory?.id || defaultCategoryId)) || fallbackCategory;
    const { category: unusedLegacyCategory, categoryId: unusedCategoryId, ...productOverride } = override;

    return { id: filename, image: `/api/product-image?name=${encodeURIComponent(filename)}`, name, price, category: category.name, categoryId: category.id, categorySlug: category.slug, featured: defaultFeaturedProducts.has(filename), ...productOverride, detailSlug: `catalog-${index + 1}` };
  });
}

export async function getProducts() {
  const products = await getCatalogProducts();

  return products.filter((product) => product.isActive !== false);
}

export async function getAdminProducts() {
  return getCatalogProducts();
}
