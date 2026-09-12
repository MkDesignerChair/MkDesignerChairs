import "./globals.css";

export const metadata = {
  title: "Designer Chairs | Premium Seating",
  description: "Premium chairs for a better tomorrow.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
