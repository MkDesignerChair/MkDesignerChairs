import diningRoom from "../../public/Dinning Chair.jpeg";
import ProductCatalog from "../components/ProductCatalog";
import SecondaryPage from "../components/SecondaryPage";
import { getProducts } from "../lib/products";
import { getCategories } from "../../actions/category-catalog";

export const dynamic = "force-dynamic";

export default async function DiningChairsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const category = categories.find((item) => item.id === "dining");

  return <SecondaryPage active={category?.name} eyebrow="GATHER IN COMFORT" title={category?.name || "Chair Collection"} description={category?.description || "Explore premium seating for every space."} image={category?.image || diningRoom}><ProductCatalog categories={categories} products={products} initialSelectedCategory={category?.id} eyebrow="DINING COLLECTION" title={category?.name || "Chair Collection"} /></SecondaryPage>;
}
