"use client";

import { usePathname } from "next/navigation";
import { SiteNavigation } from "./SecondaryPage";

export default function StorefrontNavigation() {
  const pathname = usePathname();
  const active = pathname === "/" ? "Home" : pathname.startsWith("/office-chairs") ? "Office Chairs" : pathname.startsWith("/dining-chairs") ? "Dining Chairs" : pathname.startsWith("/shop") || pathname.startsWith("/products") ? "Shop" : pathname.startsWith("/about") ? "About" : pathname.startsWith("/contact") ? "Contact" : undefined;

  if (pathname.startsWith("/admin")) return null;

  return <div className="global-storefront-navigation"><SiteNavigation active={active} /></div>;
}
