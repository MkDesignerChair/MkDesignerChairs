import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { getCatalogOverrides } from "../../actions/catalog";

const productCategories = ["Office Chairs", "Dining Chairs", "Lounge Chairs", "Accent Chairs", "Ergonomic Chairs"];

function formatProductName(filename, index) {
  if (filename === "office chair.jpeg") {
    return "Executive Office Chair";
  }

  return `Signature Chair ${String(index + 1).padStart(2, "0")}`;
}

async function getCatalogProducts() {
  const filenames = (await readdir(join(process.cwd(), "Public", "Products"))).filter((filename) => /\.(jpe?g|png)$/i.test(filename)).sort();
  const overrides = await getCatalogOverrides();

  return filenames.map((filename, index) => {
    const name = formatProductName(filename, index);
    const price = 7999 + (index % 10) * 750;
    const category = filename === "office chair.jpeg" ? "Office Chairs" : productCategories[(index - 1 + productCategories.length) % productCategories.length];
    const override = overrides[filename] || {};

    return { id: filename, image: `/api/product-image?name=${encodeURIComponent(filename)}`, name, price, category, ...override };
  });
}

export async function getProducts() {
  const products = await getCatalogProducts();

  return products.filter((product) => product.isActive !== false);
}

export async function getAdminProducts() {
  return getCatalogProducts();
}
