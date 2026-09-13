import { redirect } from "next/navigation";
import AdminDashboard from "../components/AdminDashboard";
import { isAdminAuthenticated } from "../lib/admin-auth";
import { getAdminProducts } from "../lib/products";
import { getSiteContent } from "../../actions/site-content";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!await isAdminAuthenticated()) {
    redirect("/admin/login");
  }

  const products = await getAdminProducts();
  const siteContent = await getSiteContent();

  return <AdminDashboard adminEmail={process.env.ADMIN_EMAIL} products={products} siteContent={siteContent} />;
}
