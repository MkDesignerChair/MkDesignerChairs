import diningRoom from "../../Public/Dinning Chair.jpeg";
import ProductCatalog from "../components/ProductCatalog";
import SecondaryPage from "../components/SecondaryPage";
import { getProducts } from "../lib/products";

export const dynamic = "force-dynamic";

export default async function DiningChairsPage() {
  const products = await getProducts();

  return <SecondaryPage active="Dining Chairs" eyebrow="GATHER IN COMFORT" title="Dining Chairs" description="Beautifully crafted dining seating that turns everyday meals into memorable moments." image={diningRoom}><ProductCatalog products={products} initialSelectedCategory="Dining Chairs" eyebrow="DINING COLLECTION" title="Dining Chairs" /></SecondaryPage>;
}
