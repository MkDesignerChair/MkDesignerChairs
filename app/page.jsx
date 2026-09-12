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

const navItems = [
  { label: "Home", href: "/" },
  { label: "Office Chairs", href: "/office-chairs" },
  { label: "Dining Chairs", href: "/dining-chairs" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

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

function ProductCard({ image, name, price, centered }) {
  return <article className="product-card"><div className={`product-image${centered ? " product-image--centered" : ""}`}><Image src={image} alt={name} fill sizes="(max-width: 600px) 80vw, (max-width: 1000px) 45vw, 25vw" /><button className="heart-button" aria-label={`Add ${name} to wishlist`}>♡</button></div><div className="product-details"><h3>{name}</h3><strong>₹ {price}</strong><button className="add-cart" aria-label={`Add ${name} to cart`}><CartIcon /></button></div></article>;
}

function SpaceCard({ image, title }) {
  return <a className="space-card" href="#quote"><span className="space-card-image"><Image src={image} alt="" fill sizes="(max-width: 700px) 42vw, 18vw" /></span><span className="space-card-label">{title}</span></a>;
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

function SocialIcon({ name }) {
  const icons = {
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>,
    facebook: <path d="M14 21v-8h2.8l.4-3H14V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.4-.1-1.2-.2-2.2-.2-2.2 0-3.8 1.3-3.8 3.9V10H8v3h3v8z" fill="currentColor" stroke="none" />,
    youtube: <path d="M21.5 7.1a2.8 2.8 0 0 0-2-2C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.5.5a2.8 2.8 0 0 0-2 2A28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a2.8 2.8 0 0 0 2-2A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.5-4.9ZM10 15.5v-7l6 3.5z" fill="currentColor" stroke="none" />,
    linkedin: <><rect x="4" y="9" width="3.3" height="11" fill="currentColor" stroke="none" /><circle cx="5.65" cy="5.6" r="1.8" fill="currentColor" stroke="none" /><path d="M10 20V9h3.2v1.5c.6-1 1.7-1.9 3.7-1.9 3.1 0 3.7 2 3.7 4.7V20h-3.4v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V20z" fill="currentColor" stroke="none" /></>,
    pinterest: <path d="M12.4 3.3a8.7 8.7 0 0 0-3.2 16.8c-.1-1.4 0-3 .4-4.3l1-4s-.3-.7-.3-1.7c0-1.6.9-2.8 2.1-2.8 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4.1-.3 1.2.6 2.2 1.8 2.2 2.2 0 3.8-2.8 3.8-6.1 0-2.5-1.7-4.4-4.8-4.4-3.5 0-5.7 2.6-5.7 5.4 0 1 .3 1.8.9 2.4.2.2.2.3.1.6l-.3 1.2c-.1.4-.4.5-.7.3-1.8-.7-2.7-2.7-2.7-4.9 0-3.6 3-7.8 9.1-7.8 4.9 0 8.1 3.5 8.1 7.2 0 4.9-2.7 8.5-6.7 8.5-1.3 0-2.6-.7-3-1.5l-.8 3c-.3 1.2-1 2.7-1.5 3.6.9.3 1.9.5 3 .5a8.7 8.7 0 0 0 0-17.4Z" fill="currentColor" stroke="none" />,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[name]}</svg>;
}

export default function Home() {
  return (
    <>
      <main className="hero">
      <Image className="hero-image" src={banner} alt="Brown designer office chair in a luxury interior" fill priority sizes="100vw" />
      <Image className="hero-image-phone" src={bannerPhone} alt="Brown designer office chair in a luxury interior" fill priority sizes="(max-width: 620px) 100vw, 1px" />
      <div className="hero-shade" />
      <nav className="navbar" aria-label="Main navigation">
          <a className="brand" href="/" aria-label="Designer Chairs home">
          <span className="brand-mark">MK</span>
          <span>DESIGNER CHAIRS</span>
        </a>
        <div className="nav-links">
            {navItems.map((item, index) => <a className={index === 0 ? "active" : ""} href={item.href} key={item.href}>{item.label}</a>)}
        </div>
        <details className="mobile-navigation">
          <summary aria-label="Open navigation menu"><span /><span /><span /></summary>
          <div className="mobile-navigation-panel">
            {navItems.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
          </div>
        </details>
        <div className="nav-actions">
          <button className="icon-button" aria-label="Search"><SearchIcon /></button>
          <button className="icon-button" aria-label="Account"><UserIcon /></button>
          <button className="icon-button cart" aria-label="Cart"><CartIcon /><span>0</span></button>
          <a className="quote-button" href="#quote">Get Quote</a>
        </div>
      </nav>

      <section className="hero-content" id="home">
        <p className="eyebrow">PREMIUM CHAIRS FOR A BETTER TOMORROW</p>
        <h1>SIT IN STYLE <span>LIVE BETTER</span></h1>
        <p className="intro">Elegant. Ergonomic. Exceptional.<br />MK Designer Chairs bring comfort and<br className="desktop-break" /> class to every space.</p>
          <a className="explore-button" href="#collections">Explore Collection</a>
      </section>

      <div className="features" aria-label="Product benefits">
        <Feature icon={<DiamondIcon />} title="Premium" subtitle="Quality" />
        <Feature icon={<ChairIcon />} title="Ergonomic" subtitle="Design" />
        <Feature icon={<ShieldIcon />} title="Built" subtitle="To Last" />
      </div>
      </main>

      <section className="collections section-shell" id="collections" aria-label="Chair collections">
        <CollectionCard image={officeChairImage} title={<>Office <br className="phone-title-break" />Chairs</>} description={<>Work Smarter<br />Sit Better</>} href="#office-chairs" />
        <CollectionCard image={diningCollection} title={<>Dining <br className="phone-title-break" />Chairs</>} description={<>Where Comfort<br />Meets Togetherness</>} href="#dining-chairs" zoomedOut />
      </section>

      <section className="benefits" aria-label="Why choose us">
        <Benefit icon={<ChairIcon />} title="Modern Design" description="For Every Space" />
        <Benefit icon={<CraftIcon />} title="Superior" description="Craftsmanship" />
        <Benefit icon={<LeafIcon />} title="Premium" description="Materials" />
        <Benefit icon={<DeliveryIcon />} title="Safe & Fast" description="Delivery" />
        <Benefit icon={<SupportIcon />} title="Dedicated" description="Customer Support" />
      </section>

      <section className="products section-shell" id="office-chairs">
        <div className="section-heading"><div><p className="eyebrow">FEATURED PRODUCTS</p><h2>Our Best Sellers</h2></div><a href="#all-products">View All Products <b>→</b></a></div>
        <div className="product-grid">
          <ProductCard image={officeChairImage} name="Executive Office Chair" price="12,999" />
          <ProductCard image={yellowOfficeChair} name="Premium Office Chair" price="14,499" centered />
          <ProductCard image={blueDiningChair} name="Luxury Dining Chair" price="8,999" />
          <ProductCard image={pinkOfficeChair} name="Modern Office Chair" price="9,499" centered />
        </div>
      </section>

      <section className="spaces section-shell" id="dining-chairs">
        <div className="spaces-copy"><h2>DESIGNED FOR<br />EVERY SPACE</h2><p>From modern offices to luxurious dining rooms, our chairs blend comfort with contemporary design to elevate your environment.</p><a className="gold-button" href="#quote">Explore Spaces</a></div>
        <div className="space-grid">
          <SpaceCard image={officeChairImage} title={<>Office<br />Spaces</>} />
          <SpaceCard image={diningCollection} title={<>Dining<br />Areas</>} />
          <SpaceCard image={yellowOfficeChair} title={<>Cafés &<br />Restaurants</>} />
          <SpaceCard image={blueDiningChair} title="Homes" />
        </div>
      </section>

      <section className="craftsmanship" aria-label="Craftsmanship details">
        <div className="craft-image"><Image src={blueDiningChair} alt="Blue velvet dining chair detail" fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
        <div className="craft-copy"><h2>DETAILS<br />MAKE THE<br />DIFFERENCE</h2><p>Premium fabrics, fine stitching and ergonomic design come together to create chairs that stand out.</p><a className="gold-button" href="#quote">Get a Quote</a></div>
        <div className="craft-points"><ul><DetailPoint icon={<CrownIcon />}>Premium<br />Quality Materials</DetailPoint><DetailPoint icon={<ToolsIcon />}>Expert<br />Craftsmanship</DetailPoint><DetailPoint icon={<LayersIcon />}>Stylish &<br />Modern Designs</DetailPoint><DetailPoint icon={<LeafIcon />}>Comfort for<br />Long Hours</DetailPoint></ul><div className="comfort-detail"><Image src={banner} alt="Fine chair stitching detail" fill sizes="(max-width: 760px) 80vw, 25vw" /><span>COMFORT<br />IN EVERY DETAIL</span></div></div>
      </section>

      <section className="upgrade-offer" id="quote"><Image src={officeCollection} alt="Luxury dining space" fill sizes="100vw" /><div className="upgrade-shade" /><div className="upgrade-copy"><p className="eyebrow">SPECIAL OFFER</p><h2>Upgrade Your Space</h2><p>Get premium chairs for your office, dining area or commercial space at the best prices.</p><a className="gold-button" href="mailto:sales@example.com">Get a Quote</a></div><span className="offer-badge">PREMIUM<br />CHAIRS FOR<br />PREMIUM<br />SPACES</span></section>

      <section className="testimonials section-shell" aria-labelledby="testimonial-title"><p className="eyebrow">TESTIMONIALS</p><h2 id="testimonial-title">What Our Customers Say</h2><div className="testimonial-grid"><Testimonial initials="RM" name="Rahul Mehta" role="Business Owner" quote="Excellent quality and very comfortable. Perfect for my office setup!" /><Testimonial initials="PS" name="Priya Sharma" role="Homeowner" quote="Stylish and sturdy chairs. My dining area looks amazing now!" /><Testimonial initials="AV" name="Amit Verma" role="Restaurant Owner" quote="Great design, premium finish and superb customer service." /></div><div className="testimonial-dots" aria-hidden="true"><span className="active" /><span /><span /></div></section>

      <footer className="site-footer"><div className="footer-content"><div className="footer-brand"><Image src={logo} alt="MK Designer Chairs" width={96} height={93} /><p>Comfort Meets Class</p></div><p className="footer-intro">MK Designer Chairs brings you premium chairs designed for modern living and working spaces. Quality, style and comfort — always.</p><nav className="footer-links" aria-label="Footer navigation"><h3>Quick Links</h3><a href="#home">Home</a><a href="#office-chairs">Office Chairs</a><a href="#dining-chairs">Dining Chairs</a><a href="#collections">Collections</a><a href="#about">About Us</a><a href="#contact">Contact</a></nav><address className="footer-contact" id="contact"><h3>Contact Us</h3><a href="tel:+910000000000">☎ &nbsp;+91 00000 00000</a><a href="mailto:info@designerchairs.example">✉ &nbsp;info@designerchairs.example</a><span>● &nbsp;Delhi, India</span></address><div className="footer-social"><h3>Follow Us</h3><div><a href="#facebook" aria-label="Facebook"><SocialIcon name="facebook" /></a><a href="#youtube" aria-label="YouTube"><SocialIcon name="youtube" /></a><a href="#linkedin" aria-label="LinkedIn"><SocialIcon name="linkedin" /></a></div></div></div><div className="footer-bottom"><span>© 2024 MK Designer Chairs. All Rights Reserved.</span><span><a href="#privacy">Privacy Policy</a><b>|</b><a href="#terms">Terms & Conditions</a></span></div></footer>
    </>
  );
}
