import officeChair from "../../public/Products/office chair.jpeg";
import ProductCatalog from "../components/ProductCatalog";
import SecondaryPage from "../components/SecondaryPage";
import { getProducts } from "../lib/products";
import { getCategories } from "../../actions/category-catalog";

export const dynamic = "force-dynamic";

export default async function OfficeChairsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const category = categories.find((item) => item.id === "office");

  return <SecondaryPage active={category?.name} eyebrow="WORK SMARTER, SIT BETTER" title={category?.name || "Chair Collection"} description={category?.description || "Explore premium seating for every space."} image={category?.image || officeChair}><ProductCatalog categories={categories} products={products} initialSelectedCategory={category?.id} eyebrow="WORKSPACE ESSENTIALS" title={category?.name || "Chair Collection"} /></SecondaryPage>;
}
