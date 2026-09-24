import "./globals.css";
import SiteFooter from "./components/SiteFooter";
import { StoreProvider } from "./components/StoreProvider";
import StorefrontNavigation from "./components/StorefrontNavigation";
import { getCategories } from "../actions/category-catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Designer Chairs | Premium Seating",
  description: "Premium chairs for a better tomorrow.",
  icons: {
    icon: [{ url: "/fevicon.png", type: "image/png" }],
    shortcut: ["/fevicon.png"],
    apple: [{ url: "/fevicon.png", type: "image/png" }],
  },
};

export default async function RootLayout({ children }) {
  const categories = await getCategories();

  return (
    <html lang="en">
      <body><StoreProvider><StorefrontNavigation categories={categories} />{children}<SiteFooter /></StoreProvider></body>
    </html>
  );
}
