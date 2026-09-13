import "./globals.css";
import { StoreProvider } from "./components/StoreProvider";

export const metadata = {
  title: "Designer Chairs | Premium Seating",
  description: "Premium chairs for a better tomorrow.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><StoreProvider>{children}</StoreProvider></body>
    </html>
  );
}
