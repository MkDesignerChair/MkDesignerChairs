import ProductCatalog from "../components/ProductCatalog";
import { SiteNavigation } from "../components/SecondaryPage";
import { getProducts } from "../lib/products";

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }) {
  const products = await getProducts();
  const params = await searchParams;
  const selectedCategory = typeof params?.category === "string" ? params.category : undefined;

  return <main className="shop-page"><SiteNavigation active="Shop" /><section className="shop-hero"><p className="eyebrow">CURATED FOR COMFORT</p><h1>Shop Premium<br /><span>Designer Chairs</span></h1><p>Explore every chair in our collection and find a design made for your space.</p></section><ProductCatalog products={products} initialSelectedCategory={selectedCategory} /></main>;
}
