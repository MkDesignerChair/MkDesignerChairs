import officeChair from "../../public/Products/office chair.jpeg";
import { notFound } from "next/navigation";
import ProductCatalog from "../components/ProductCatalog";
import SecondaryPage from "../components/SecondaryPage";
import { getProducts } from "../lib/products";
import { getStorefrontCategories } from "../../actions/category-catalog";

export const dynamic = "force-dynamic";

export default async function OfficeChairsPage() {
  const [products, categories] = await Promise.all([getProducts(), getStorefrontCategories()]);
  const category = categories.find((item) => item.id === "office");
  if (!category) notFound();

  return <SecondaryPage active={category.name} eyebrow="WORK SMARTER, SIT BETTER" title={category.name} description={category.description} image={category.image || officeChair}><ProductCatalog categories={categories} products={products} initialSelectedCategory={category.id} eyebrow="WORKSPACE ESSENTIALS" title={category.name} /></SecondaryPage>;
}
