import Image from "next/image";
import Link from "next/link";
import logo from "../../Public/logo.png";
import HeaderActions from "./HeaderActions";

const links = [
  { href: "/", label: "Home" },
  { href: "/office-chairs", label: "Office Chairs" },
  { href: "/dining-chairs", label: "Dining Chairs" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const mobileShopCategories = ["Office Chairs", "Dining Chairs", "Lounge Chairs", "Accent Chairs", "Ergonomic Chairs"];

export function SiteNavigation({ active }) {
  return (
    <nav className="inner-navbar" aria-label="Main navigation">
      <Link className="brand" href="/" aria-label="Designer Chairs home"><Image className="brand-logo" src={logo} alt="MK Designer Chairs" width={154} priority /></Link>
      <div className="inner-nav-links">{links.map((link) => <Link className={link.label === active ? "active" : ""} href={link.href} key={link.href}>{link.label}</Link>)}</div>
      <div className="header-controls"><HeaderActions /><Link className="quote-button" href="/contact">Get Quote</Link></div>
      <details className="mobile-navigation">
        <summary aria-label="Open navigation menu"><span /><span /><span /></summary>
        <div className="mobile-navigation-panel">
          <div className="mobile-menu-search" aria-hidden="true"><span>Search chairs...</span><span>⌕</span></div>
          {links.filter((link) => ["Office Chairs", "Dining Chairs"].includes(link.label)).map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          <details className="mobile-shop-menu">
            <summary>Shop<span aria-hidden="true" /></summary>
            <div>{mobileShopCategories.map((category) => <Link href={`/shop?category=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}<Link href="/shop">Shop All</Link></div>
          </details>
          {links.filter((link) => ["About", "Contact"].includes(link.label)).map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          <Link className="mobile-menu-auth" href="/login">Login / Register</Link>
          <div className="mobile-menu-contact"><a href="tel:+910000000000">+91 00000 00000</a><a href="mailto:info@designerchairs.example">info@designerchairs.example</a></div>
        </div>
      </details>
    </nav>
  );
}

export default function SecondaryPage({ active, eyebrow, title, description, image, children }) {
  return (
    <main className="inner-page">
      <section className="inner-hero">
        <Image className="inner-hero-image" src={image} alt="Designer chair in a premium interior" fill priority sizes="100vw" />
        <div className="inner-hero-shade" />
        <SiteNavigation active={active} />
        <div className="inner-hero-copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p><Link className="gold-button" href="/contact">Request a Quote</Link></div>
      </section>
      {children}
    </main>
  );
}
