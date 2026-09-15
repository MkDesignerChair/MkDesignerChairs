import Image from "next/image";
import banner from "../Public/banner.jpeg";
import bannerPhone from "../Public/banner_phone.png";
import logo from "../Public/logo.png";
import diningCollection from "../Public/Dinning Chair.jpeg";
import officeCollection from "../Public/upgrade your space.jpeg";
import pinkOfficeChair from "../Public/Products/WhatsApp Image 2026-09-12 at 1.09.05 PMasd.jpeg";
import yellowOfficeChair from "../Public/Products/WhatsApp Image 2026-09-12 at 1.09.06 PMdfd.jpeg";
import blueDiningChair from "../Public/Products/WhatsApp Image 2026-09-12 at 1.09.07 PMdfd.jpeg";
import officeChairImage from "../Public/Products/office chair.jpeg";
import AddToCartButton from "./components/AddToCartButton";
import BuyNowButton from "./components/BuyNowButton";
import HeaderActions from "./components/HeaderActions";
import Link from "next/link";
import { getSiteContent } from "./../actions/site-content";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Office Chairs", href: "/office-chairs" },
  { label: "Dining Chairs", href: "/dining-chairs" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const mobileShopCategories = ["Office Chairs", "Dining Chairs", "Lounge Chairs", "Accent Chairs", "Ergonomic Chairs"];

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4" /><path d="m16 16 4.2 4.2" /></svg>;
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2" /><path d="M5.1 20.1c.6-3.4 2.9-5.4 6.9-5.4s6.3 2 6.9 5.4" /></svg>;
}

function CartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2 11.2h10.7l2-8H6" /><circle cx="9" cy="19.3" r="1.2" /><circle cx="17.5" cy="19.3" r="1.2" /></svg>;
}

function DiamondIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="m4 11 4-6h16l4 6-12 16L4 11Z" /><path d="M4 11h24M8 5l8 22L24 5M11 11l5-6 5 6" /></svg>;
}

function ChairIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 15V5h14v10M7 15h18v7H7zM10 22v5M22 22v5M5 27h22" /><path d="M12 9h8" /></svg>;
}

function ShieldIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 27 8v8c0 6.4-4.6 10.6-11 13-6.4-2.4-11-6.6-11-13V8l11-5Z" /><path d="M16 10v11M11 15.5h10" /></svg>;
}

function Feature({ icon, title, subtitle }) {
  return <div className="feature"><span className="feature-icon">{icon}</span><span>{title}<br />{subtitle}</span></div>;
}

function CraftIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6" /><path d="m16 3 2.3 4.6 5.1-.5-.5 5.1 4.6 2.3-4.6 2.3.5 5.1-5.1-.5L16 29l-2.3-4.6-5.1.5.5-5.1L4.5 17.5l4.6-2.3-.5-5.1 5.1.5z" /></svg>;
}

function LeafIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M27 5C13 5 5 11.3 5 23c0 2.2.5 3.4.5 3.4S9 27 12 23.7C17.4 17.9 19.8 12.5 27 5Z" /><path d="M5.5 26.4C10.2 19.4 16.3 15.2 23.5 10.8" /></svg>;
}

function DeliveryIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3.5 7.5h16v14h-16zM19.5 12h5.2l3.8 4.7v4.8h-9z" /><circle cx="9" cy="24" r="2.2" /><circle cx="23.5" cy="24" r="2.2" /><path d="M23 12v5h5" /></svg>;
}

function SupportIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 17v-2a11 11 0 0 1 22 0v2M5 16h4v8H7a2 2 0 0 1-2-2zM27 16h-4v8h2a2 2 0 0 0 2-2zM23 24c0 3-2.6 4-6 4h-2" /></svg>;
}

function CollectionCard({ image, title, description, href, zoomedOut }) {
  return <a className={`collection-card${zoomedOut ? " collection-card--zoomed-out" : ""}`} href={href}><Image src={image} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" /><span className="collection-overlay" /><span className="collection-copy"><strong>{title}</strong><small>{description}</small><span className="collection-button">View Collection</span></span></a>;
}

function Benefit({ icon, title, description }) {
  return <div className="benefit"><span className="benefit-icon">{icon}</span><strong>{title}</strong><span>{description}</span></div>;
}

function FeaturedProductCard({ image, name, price, centered }) {
  const product = { id: name, image: image.src, name, price: Number(price.replace(",", "")) };

  return <article className="product-card"><div className={`product-image${centered ? " product-image--centered" : ""}`}><Image src={image} alt={name} fill sizes="(max-width: 600px) 80vw, (max-width: 1000px) 45vw, 25vw" /><button className="heart-button" type="button" aria-label={`Add ${name} to wishlist`}>♡</button></div><div className="product-details"><h3>{name}</h3><strong>₹ {price}</strong><AddToCartButton product={product} /></div></article>;
}

function EnhancedFeaturedProductCard({ image, name, price, centered }) {
  const slug = name.toLowerCase().replaceAll(" ", "-");
  const product = { id: name, image: image.src, name, price: Number(price.replace(",", "")) };

  return <article className="product-card featured-product-card"><div className={`product-image${centered ? " product-image--centered" : ""}`}><Link href={`/products/${slug}`} aria-label={`View ${name}`}><Image src={image} alt={name} fill sizes="(max-width: 600px) 80vw, (max-width: 1000px) 45vw, 25vw" /></Link><button className="heart-button" type="button" aria-label={`Add ${name} to wishlist`}>♡</button></div><div className="product-details"><Link className="featured-product-link" href={`/products/${slug}`}><h3>{name}</h3><strong>₹ {price}</strong></Link><div className="featured-product-actions"><AddToCartButton product={product} /><BuyNowButton product={product} /></div></div></article>;
}

function ProductCard({ image, name, price, centered }) {
  return <article className="product-card"><div className={`product-image${centered ? " product-image--centered" : ""}`}><Image src={image} alt={name} fill sizes="(max-width: 600px) 80vw, (max-width: 1000px) 45vw, 25vw" /><button className="heart-button" aria-label={`Add ${name} to wishlist`}>♡</button></div><div className="product-details"><h3>{name}</h3><strong>₹ {price}</strong><button className="add-cart" aria-label={`Add ${name} to cart`}><CartIcon /></button></div></article>;
}

function SpaceCard({ image, title, href }) {
  return <a className="space-card" href={href}><span className="space-card-image"><Image src={image} alt="" fill sizes="(max-width: 700px) 42vw, 18vw" /></span><span className="space-card-label"><span>{title}</span><span className="space-card-view">View more</span></span></a>;
}

function DetailPoint({ icon, children }) {
  return <li><span>{icon}</span><strong>{children}</strong></li>;
}

function CrownIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="m4 10 6 6 6-10 6 10 6-6-3 16H7zM7 28h18" /></svg>;
}

function ToolsIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="m7 5 5.2 5.2-3 3L4 8.1A8 8 0 0 0 12.3 19l9.2 9.2 4.1-4.1-9.2-9.2A8 8 0 0 0 27.9 7l-5.1 5.1-3-3L25 4" /></svg>;
}

function LayersIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 4 12 6-12 6L4 10zM4 16l12 6 12-6M4 22l12 6 12-6" /></svg>;
}

function Testimonial({ name, role, initials, quote }) {
  return <article className="testimonial-card"><span className="quote-mark">“</span><p>{quote}</p><span className="stars" aria-label="5 out of 5 stars">★★★★★</span><div className="customer"><span className="avatar">{initials}</span><span><strong>{name}</strong><small>{role}</small></span></div></article>;
}

export default async function Home() {
  const content = await getSiteContent();
  return (
    <>
      <main className="hero">
      <div className="hero-artwork" aria-hidden="true">
        <Image className="hero-image" src={banner} alt="" fill priority sizes="100vw" />
        <Image className="hero-image-phone" src={bannerPhone} alt="" fill priority sizes="(max-width: 620px) 100vw, 1px" />
        <div className="hero-shade" />
      </div>
      <nav className="navbar" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="Designer Chairs home">
          <Image className="brand-logo" src={logo} alt="MK Designer Chairs" width={154} priority />
        </a>
        <div className="nav-links">
            {navItems.map((item, index) => <a className={index === 0 ? "active" : ""} href={item.href} key={item.href}>{item.label}</a>)}
        </div>
        <details className="mobile-navigation">
          <summary aria-label="Open navigation menu"><span /><span /><span /></summary>
          <div className="mobile-navigation-panel">
            <div className="mobile-menu-search" aria-hidden="true"><span>Search chairs...</span><span>⌕</span></div>
            {navItems.filter((item) => ["Office Chairs", "Dining Chairs"].includes(item.label)).map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
            <details className="mobile-shop-menu">
              <summary>Shop<span aria-hidden="true" /></summary>
              <div>{mobileShopCategories.map((category) => <a href={`/shop?category=${encodeURIComponent(category)}`} key={category}>{category}</a>)}<a href="/shop">Shop All</a></div>
            </details>
            {navItems.filter((item) => ["About", "Contact"].includes(item.label)).map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
            <a className="mobile-menu-auth" href="/login">Login / Register</a>
            <div className="mobile-menu-contact"><a href="tel:+910000000000">+91 00000 00000</a><a href="mailto:info@designerchairs.example">info@designerchairs.example</a></div>
          </div>
        </details>
        <div className="header-controls"><HeaderActions /><a className="quote-button" href="#quote">Get Quote</a></div>
      </nav>

      <section className="hero-content" id="home">
        <p className="eyebrow">{content.hero.eyebrow}</p>
        <h1>{content.hero.title} <span>{content.hero.accent}</span></h1>
        <p className="intro">{content.hero.description}</p>
          <a className="explore-button" href="#collections">{content.hero.buttonText}</a>
      </section>

      <div className="features" aria-label="Product benefits">
        <Feature icon={<DiamondIcon />} title="Premium" subtitle="Quality" />
        <Feature icon={<ChairIcon />} title="Ergonomic" subtitle="Design" />
        <Feature icon={<ShieldIcon />} title="Built" subtitle="To Last" />
      </div>
      </main>

      <section className="collections section-shell" id="collections" aria-label="Chair collections">
        <CollectionCard image={officeChairImage} title={<>Office <br className="phone-title-break" />Chairs</>} description={<>Work Smarter<br />Sit Better</>} href="/shop?category=Office%20Chairs" />
        <CollectionCard image={diningCollection} title={<>Dining <br className="phone-title-break" />Chairs</>} description={<>Where Comfort<br />Meets Togetherness</>} href="/shop?category=Dining%20Chairs" />
      </section>

      <section className="benefits" aria-label="Why choose us">
        <Benefit icon={<ChairIcon />} title="Modern Design" description="For Every Space" />
        <Benefit icon={<CraftIcon />} title="Superior" description="Craftsmanship" />
        <Benefit icon={<LeafIcon />} title="Premium" description="Materials" />
        <Benefit icon={<DeliveryIcon />} title="Safe & Fast" description="Delivery" />
        <Benefit icon={<SupportIcon />} title="Dedicated" description="Customer Support" />
      </section>

      <section className="products section-shell" id="office-chairs">
        <div className="section-heading"><div><p className="eyebrow">FEATURED PRODUCTS</p><h2>Our Best Sellers</h2></div><a href="/shop">View All Products</a></div>
        <div className="product-grid">
          <EnhancedFeaturedProductCard image={officeChairImage} name="Executive Office Chair" price="12,999" />
          <EnhancedFeaturedProductCard image={yellowOfficeChair} name="Premium Office Chair" price="14,499" centered />
          <EnhancedFeaturedProductCard image={blueDiningChair} name="Luxury Dining Chair" price="8,999" />
          <EnhancedFeaturedProductCard image={pinkOfficeChair} name="Modern Office Chair" price="9,499" centered />
        </div>
      </section>

      <section className="spaces section-shell" id="dining-chairs">
        <div className="spaces-copy"><h2>Designed for<br />Every Space</h2><p>From modern offices to luxurious dining rooms, our chairs blend comfort with contemporary design to elevate your environment.</p><a className="gold-button" href="#quote">Explore Spaces</a></div>
        <div className="space-grid">
          <SpaceCard image={officeChairImage} title={<>Office<br />Spaces</>} href="/shop?category=Office%20Chairs" />
          <SpaceCard image={diningCollection} title={<>Dining<br />Areas</>} href="/shop?category=Dining%20Chairs" />
          <SpaceCard image={yellowOfficeChair} title={<>Cafés &<br />Restaurants</>} href="/shop?category=Lounge%20Chairs" />
          <SpaceCard image={blueDiningChair} title="Homes" href="/shop?category=Accent%20Chairs" />
        </div>
      </section>

      <section className="craftsmanship" aria-label="Craftsmanship details">
        <div className="craft-image"><Image src={blueDiningChair} alt="Blue velvet dining chair detail" fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
        <div className="craft-copy"><h2>Details Make<br />the Difference</h2><p>Premium fabrics, fine stitching and ergonomic design come together to create chairs that stand out.</p><a className="gold-button" href="#quote">Get a Quote</a></div>
        <div className="craft-points"><ul><DetailPoint icon={<CrownIcon />}>Premium<br />Quality Materials</DetailPoint><DetailPoint icon={<ToolsIcon />}>Expert<br />Craftsmanship</DetailPoint><DetailPoint icon={<LayersIcon />}>Stylish &<br />Modern Designs</DetailPoint><DetailPoint icon={<LeafIcon />}>Comfort for<br />Long Hours</DetailPoint></ul><div className="comfort-detail"><Image src={banner} alt="Fine chair stitching detail" fill sizes="(max-width: 760px) 80vw, 25vw" /><span>COMFORT<br />IN EVERY DETAIL</span></div></div>
      </section>

      <section className="upgrade-offer" id="quote"><Image src={officeCollection} alt="Luxury dining space" fill sizes="100vw" /><div className="upgrade-shade" /><div className="upgrade-copy"><p className="eyebrow">{content.campaign.eyebrow}</p><h2>{content.campaign.title}</h2><p>{content.campaign.description}</p><a className="gold-button" href={`mailto:${content.campaign.email}`}>{content.campaign.buttonText}</a></div><span className="offer-badge">PREMIUM<br />CHAIRS FOR<br />PREMIUM<br />SPACES</span></section>

      <section className="testimonials section-shell" aria-labelledby="testimonial-title"><p className="eyebrow">TESTIMONIALS</p><h2 id="testimonial-title">What Our Customers Say</h2><div className="testimonial-grid"><Testimonial initials="RM" name="Rahul Mehta" role="Business Owner" quote="Excellent quality and very comfortable. Perfect for my office setup!" /><Testimonial initials="PS" name="Priya Sharma" role="Homeowner" quote="Stylish and sturdy chairs. My dining area looks amazing now!" /><Testimonial initials="AV" name="Amit Verma" role="Restaurant Owner" quote="Great design, premium finish and superb customer service." /></div><div className="testimonial-dots" aria-hidden="true"><span className="active" /><span /><span /></div></section>

    </>
  );
}
