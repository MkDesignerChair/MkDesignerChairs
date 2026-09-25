import diningRoom from "../../public/Dinning Chair.jpeg";
import { notFound } from "next/navigation";
import ProductCatalog from "../components/ProductCatalog";
import SecondaryPage from "../components/SecondaryPage";
import { getProducts } from "../lib/products";
import { getStorefrontCategories } from "../../actions/category-catalog";

export const dynamic = "force-dynamic";

export default async function DiningChairsPage() {
  const [products, categories] = await Promise.all([getProducts(), getStorefrontCategories()]);
  const category = categories.find((item) => item.id === "dining");
  if (!category) notFound();

  return <SecondaryPage active={category.name} eyebrow="GATHER IN COMFORT" title={category.name} description={category.description} image={category.image || diningRoom}><ProductCatalog categories={categories} products={products} initialSelectedCategory={category.id} eyebrow="DINING COLLECTION" title={category.name} /></SecondaryPage>;
}
