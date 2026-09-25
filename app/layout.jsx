import "./globals.css";
import SiteFooter from "./components/SiteFooter";
import { StoreProvider } from "./components/StoreProvider";
import StorefrontNavigation from "./components/StorefrontNavigation";
import { getStorefrontCategories } from "../actions/category-catalog";
import { getSiteContent } from "../actions/site-content";
import StoreStatusNotice from "./components/StoreStatusNotice";

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
  const [categories, content] = await Promise.all([getStorefrontCategories(), getSiteContent()]);

  return (
    <html lang="en">
      <body><StoreProvider><StorefrontNavigation categories={categories} /><StoreStatusNotice settings={content.settings} />{children}<SiteFooter settings={content.settings} /></StoreProvider></body>
    </html>
  );
}
