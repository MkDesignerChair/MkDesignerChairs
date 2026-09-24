"use client";

import { usePathname } from "next/navigation";
import { SiteNavigation } from "./SecondaryPage";

export default function StorefrontNavigation({ categories }) {
  const pathname = usePathname();
  const active = pathname === "/" ? "/" : pathname.startsWith("/office-chairs") ? "/office-chairs" : pathname.startsWith("/dining-chairs") ? "/dining-chairs" : pathname.startsWith("/shop") || pathname.startsWith("/products") ? "/shop" : pathname.startsWith("/about") ? "/about" : pathname.startsWith("/contact") ? "/contact" : undefined;

  if (pathname.startsWith("/admin")) return null;

  return <div className="global-storefront-navigation"><SiteNavigation active={active} categories={categories} /></div>;
}
