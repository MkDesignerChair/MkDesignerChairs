import { redirect } from "next/navigation";
import AdminDashboard from "../components/AdminDashboard";
import { isAdminAuthenticated } from "../lib/admin-auth";
import { getAdminProducts } from "../lib/products";
import { getSiteContent } from "../../actions/site-content";
import { getCategories } from "../../actions/category-catalog";
import { getReviews } from "../../actions/review-store";
import { getOrders } from "../../actions/order-store";
import { getCustomers } from "../../actions/customer-store";
import { getInquiries } from "../../actions/inquiry-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!await isAdminAuthenticated()) {
    redirect("/admin/login");
  }

  const [products, siteContent, categories, reviews, orders, customers, inquiries] = await Promise.all([getAdminProducts(), getSiteContent(), getCategories(), getReviews(), getOrders(), getCustomers(), getInquiries()]);

  return <AdminDashboard adminEmail={process.env.ADMIN_EMAIL} categories={categories} customers={customers} inquiries={inquiries} orders={orders} products={products} reviews={reviews} siteContent={siteContent} />;
}
