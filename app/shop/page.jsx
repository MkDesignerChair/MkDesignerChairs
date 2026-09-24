import ProductCatalog from "../components/ProductCatalog";
import { SiteNavigation } from "../components/SecondaryPage";
import { getProducts } from "../lib/products";
import { getCategories } from "../../actions/category-catalog";

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const params = await searchParams;
  const requestedCategory = typeof params?.category === "string" ? params.category : undefined;
  const selectedCategory = categories.find((category) => category.slug === requestedCategory || category.name === requestedCategory)?.id;

  return <main className="shop-page"><SiteNavigation active="Shop" /><section className="shop-hero"><p className="eyebrow">CURATED FOR COMFORT</p><h1>Shop Premium<br /><span>Designer Chairs</span></h1><p>Explore every chair in our collection and find a design made for your space.</p></section><ProductCatalog categories={categories} products={products} initialSelectedCategory={selectedCategory} /></main>;
}
