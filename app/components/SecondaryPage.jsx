"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import logo from "../../public/logo.png";
import HeaderActions from "./HeaderActions";

export function SiteNavigation({ active, categories = [] }) {
  const mobileMenuRef = useRef(null);
  const officeCategory = categories.find((category) => category.id === "office");
  const diningCategory = categories.find((category) => category.id === "dining");
  const categoryLinks = [
    ...(officeCategory ? [{ href: "/office-chairs", label: officeCategory.name }] : []),
    ...(diningCategory ? [{ href: "/dining-chairs", label: diningCategory.name }] : []),
  ];
  const links = [{ href: "/", label: "Home" }, ...categoryLinks, { href: "/shop", label: "Shop" }, { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }];

  function closeMobileMenu(event) {
    if (event.target.closest("a")) mobileMenuRef.current?.removeAttribute("open");
  }

  return (
    <nav className="inner-navbar" aria-label="Main navigation">
      <Link className="brand" href="/" aria-label="Designer Chairs home"><Image className="brand-logo" src={logo} alt="MK Designer Chairs" width={154} priority /></Link>
      <div className="inner-nav-links">{links.map((link) => <Link className={link.label === active || link.href === active ? "active" : ""} href={link.href} key={link.href}>{link.label}</Link>)}</div>
      <div className="header-controls"><HeaderActions /><Link className="quote-button" href="/contact">Get Quote</Link></div>
      <details className="mobile-navigation" ref={mobileMenuRef}>
        <summary aria-label="Open navigation menu"><span /><span /><span /></summary>
        <div className="mobile-navigation-panel" onClick={closeMobileMenu}>
          <div className="mobile-menu-search" aria-hidden="true"><span>Search chairs...</span><span>⌕</span></div>
          <Link href="/">Home</Link>
          {categoryLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          <details className="mobile-shop-menu">
            <summary>Shop<span aria-hidden="true" /></summary>
            <div>{categories.map((category) => <Link href={`/shop?category=${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}</Link>)}<Link href="/shop">Shop All</Link></div>
          </details>
          {links.filter((link) => ["About", "Contact"].includes(link.label)).map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          <Link className="mobile-menu-auth" href="/login">Login / Register</Link>
          <div className="mobile-menu-contact"><a href="tel:+910000000000">7620503029</a><a href="mailto:mkdesignerchair@gmail.com">mkdesignerchair@gmail.com</a></div>
        </div>
      </details>
    </nav>
  );
}

export default function SecondaryPage({ active, eyebrow, title, description, image, children, quoteHref = "/contact" }) {
  return (
    <main className="inner-page">
      <section className="inner-hero">
        <Image className="inner-hero-image" src={image} alt="Designer chair in a premium interior" fill priority sizes="100vw" />
        <div className="inner-hero-shade" />
        <SiteNavigation active={active} />
        <div className="inner-hero-copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p><Link className="gold-button" href={quoteHref}>Request a Quote</Link></div>
      </section>
      {children}
    </main>
  );
}
