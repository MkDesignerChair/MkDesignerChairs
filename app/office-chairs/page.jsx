import officeChair from "../../Public/Products/office chair.jpeg";
import ProductCatalog from "../components/ProductCatalog";
import SecondaryPage from "../components/SecondaryPage";
import { getProducts } from "../lib/products";

export const dynamic = "force-dynamic";

export default async function OfficeChairsPage() {
  const products = await getProducts();

  return <SecondaryPage active="Office Chairs" eyebrow="WORK SMARTER, SIT BETTER" title="Office Chairs" description="Ergonomic seating designed to keep every workday comfortable, focused and refined." image={officeChair}><ProductCatalog products={products} initialSelectedCategory="Office Chairs" eyebrow="WORKSPACE ESSENTIALS" title="Office Chairs" /></SecondaryPage>;
}
