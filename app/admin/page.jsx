import { redirect } from "next/navigation";
import AdminDashboard from "../components/AdminDashboard";
import { isAdminAuthenticated } from "../lib/admin-auth";
import { getAdminProducts } from "../lib/products";
import { getSiteContent } from "../../actions/site-content";
import { getCategories } from "../../actions/category-catalog";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!await isAdminAuthenticated()) {
    redirect("/admin/login");
  }

  const [products, siteContent, categories] = await Promise.all([getAdminProducts(), getSiteContent(), getCategories()]);

  return <AdminDashboard adminEmail={process.env.ADMIN_EMAIL} categories={categories} products={products} siteContent={siteContent} />;
}
