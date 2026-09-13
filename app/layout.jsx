import "./globals.css";
import SiteFooter from "./components/SiteFooter";
import { StoreProvider } from "./components/StoreProvider";
import StorefrontNavigation from "./components/StorefrontNavigation";

export const metadata = {
  title: "Designer Chairs | Premium Seating",
  description: "Premium chairs for a better tomorrow.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: ["/logo.png"],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><StoreProvider><StorefrontNavigation />{children}<SiteFooter /></StoreProvider></body>
    </html>
  );
}
