import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/office-chairs", label: "Office Chairs" },
  { href: "/dining-chairs", label: "Dining Chairs" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function SiteNavigation({ active }) {
  return (
    <nav className="inner-navbar" aria-label="Main navigation">
      <Link className="brand" href="/" aria-label="Designer Chairs home"><span className="brand-mark">MK</span><span>DESIGNER CHAIRS</span></Link>
      <div className="inner-nav-links">{links.map((link) => <Link className={link.label === active ? "active" : ""} href={link.href} key={link.href}>{link.label}</Link>)}</div>
      <details className="mobile-navigation">
        <summary aria-label="Open navigation menu"><span /><span /><span /></summary>
        <div className="mobile-navigation-panel">{links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</div>
      </details>
      <Link className="quote-button" href="/contact">Get Quote</Link>
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
