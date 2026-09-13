"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProductEditor from "./ProductEditor";

const categories = ["Office Chairs", "Dining Chairs", "Lounge Chairs", "Accent Chairs", "Ergonomic Chairs"];
const navigation = [
  ["overview", "Overview", "⌘"],
  ["categories", "Chair Categories", "▦"],
  ["products", "Products", "◇"],
  ["orders", "Orders", "□"],
  ["customers", "Customers", "○"],
  ["reviews", "Reviews", "☆"],
  ["inquiries", "Enquiries", "▱"],
  ["hero", "Hero Section", "▤"],
  ["content", "Homepage Content", "▤"],
  ["about", "About Page", "i"],
  ["media", "Media Library", "▧"],
  ["settings", "Store Settings", "⚙"],
];

function formatPrice(price) {
  return `₹${price.toLocaleString("en-IN")}`;
}

function formatCategorySlug(category) {
  return category.toLowerCase().replaceAll(" ", "-");
}

export default function AdminDashboard({ adminEmail, products, siteContent }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [catalog, setCatalog] = useState(products);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [content, setContent] = useState(siteContent);
  const [editingProductId, setEditingProductId] = useState(null);
  const router = useRouter();
  const visibleProducts = useMemo(() => catalog.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())), [catalog, search]);
  const activeProducts = catalog.filter((product) => product.isActive !== false);

  useEffect(() => {
    document.querySelectorAll(".admin-product-row input, .admin-product-row select").forEach((control) => {
      control.disabled = true;
    });
  }, [catalog, activeSection]);

  async function saveProduct(id, changes) {
    setIsSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/catalog", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, changes }) });
    const result = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result.error || "Unable to save the product.");
      return;
    }

    setCatalog((current) => current.map((product) => product.id === id ? { ...product, ...result.override } : product));
    setMessage("Catalog saved. Changes are now visible in the storefront.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  async function editLiveContent(section) {
    const values = {};
    for (const [key, value] of Object.entries(content[section])) {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
      const nextValue = window.prompt(label, value);
      if (nextValue === null) return;
      values[key] = nextValue;
    }
    const response = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, values }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || "Unable to save content."); return; }
    setContent((current) => ({ ...current, [section]: result.content }));
    setMessage("Live storefront content saved. Refresh the public page to view it.");
  }

  function editChairDetails(product) {
    setEditingProductId(product.id);
  }

  async function replaceProductImage(product, file) {
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    setIsSaving(true);
    const response = await fetch("/api/admin/media", { method: "POST", body: formData });
    const result = await response.json();
    setIsSaving(false);
    if (!response.ok) {
      setMessage(result.error || "Unable to upload the image.");
      return;
    }
    setCatalog((current) => current.map((item) => item.id === product.id ? { ...item, image: result.image } : item));
    await saveProduct(product.id, { image: result.image });
  }

  function renderOverview() {
    return <><div className="admin-page-heading"><div><p className="admin-kicker">MK DESIGNER CHAIRS</p><h1>Overview</h1><p>Manage the seating catalog and monitor your storefront.</p></div><Link className="admin-site-link" href="/" target="_blank">↗ View store</Link></div><div className="admin-stats"><article><span>₹</span><strong>{formatPrice(activeProducts.reduce((total, product) => total + product.price, 0))}</strong><small>Catalog value</small></article><article><span>◇</span><strong>{activeProducts.length}</strong><small>Active chair designs</small></article><article><span>▦</span><strong>{categories.length}</strong><small>Chair categories</small></article><article><span>□</span><strong>0</strong><small>Confirmed orders</small></article></div><section className="admin-panel"><div className="admin-panel-heading"><div><span>◷</span><h2>Catalog snapshot</h2></div><button type="button" onClick={() => setActiveSection("products")}>Manage products</button></div><div className="admin-table"><div className="admin-table-head"><span>PRODUCT</span><span>CATEGORY</span><span>PRICE</span><span>STATUS</span></div>{catalog.slice(0, 6).map((product) => <div className="admin-product-row" key={product.id}><span className="admin-product-name"><img src={product.image} alt="" /><b>{product.name}</b></span><span>{product.category}</span><strong>{formatPrice(product.price)}</strong><span className={product.isActive !== false ? "admin-status" : "admin-status admin-status-off"}>{product.isActive !== false ? "Active" : "Hidden"}</span></div>)}</div></section></>;
  }

  function renderCategories() {
    return <><div className="admin-page-heading"><div><p className="admin-kicker">CATALOG STRUCTURE</p><h1>Chair Categories</h1><p>Categories used by storefront filters and dedicated collection pages.</p></div></div><section className="admin-panel"><div className="admin-table"><div className="admin-table-head"><span>CATEGORY</span><span>SLUG</span><span>PRODUCTS</span><span>STOREFRONT</span></div>{categories.map((category) => <div className="admin-product-row" key={category}><strong>{category}</strong><code>{formatCategorySlug(category)}</code><span>{catalog.filter((product) => product.category === category).length} chairs</span><Link className="admin-inline-link" href={`/shop?category=${encodeURIComponent(category)}`}>View collection</Link></div>)}</div></section><p className="admin-note">Category changes are controlled per product so the shop filter and collection pages always use the same chair taxonomy.</p></>;
  }

  function renderProducts() {
    const editingProduct = catalog.find((product) => product.id === editingProductId);
    if (editingProduct) return <ProductEditor product={editingProduct} onClose={() => setEditingProductId(null)} onSaved={(savedProduct) => setCatalog((current) => current.map((product) => product.id === savedProduct.id ? savedProduct : product))} />;

    return <><div className="admin-page-heading"><div><p className="admin-kicker">CHAIR CATALOG</p><h1>Products</h1><p>Edit product name, price, category, storefront visibility, and chair specifications.</p></div><label className="admin-search">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search chairs" /></label></div>{message && <p className="admin-message" role="status">{message}</p>}<section className="admin-panel"><div className="admin-table admin-product-table"><div className="admin-table-head"><span>PRODUCT</span><span>CATEGORY</span><span>PRICE</span><span>STATUS</span></div>{visibleProducts.map((product) => <div className="admin-product-row" key={product.id}><span className="admin-product-name"><img src={product.image} alt="" /><input aria-label={`Name for ${product.name}`} value={product.name} onChange={(event) => setCatalog((current) => current.map((item) => item.id === product.id ? { ...item, name: event.target.value } : item))} onBlur={(event) => saveProduct(product.id, { name: event.target.value })} /></span><select aria-label={`Category for ${product.name}`} value={product.category} onChange={(event) => saveProduct(product.id, { category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select><label className="admin-price"><span>₹</span><input aria-label={`Price for ${product.name}`} min="1" type="number" value={product.price} onChange={(event) => setCatalog((current) => current.map((item) => item.id === product.id ? { ...item, price: Number(event.target.value) } : item))} onBlur={(event) => saveProduct(product.id, { price: Number(event.target.value) })} /></label><span className="admin-product-actions"><button className={product.isActive !== false ? "admin-status admin-status-button" : "admin-status admin-status-off admin-status-button"} disabled={isSaving} type="button" onClick={() => saveProduct(product.id, { isActive: product.isActive === false })}>{product.isActive !== false ? "Active" : "Hidden"}</button><button type="button" onClick={() => editChairDetails(product)}>Details</button><label className="admin-image-upload">Image<input accept="image/jpeg,image/png,image/webp" disabled={isSaving} type="file" onChange={(event) => replaceProductImage(product, event.target.files?.[0])} /></label></span></div>)}</div></section><p className="admin-note">Details include upholstery, finishes, dimensions, weight capacity, warranty, stock, FAQs, and SEO metadata. Upload a JPG, PNG, or WEBP image (up to 5 MB) directly from each product row.</p></>;
  }

  function renderPlaceholder(title, description) {
    return <><div className="admin-page-heading"><div><p className="admin-kicker">STORE OPERATIONS</p><h1>{title}</h1><p>{description}</p></div></div><section className="admin-empty"><span>⌁</span><h2>No records yet</h2><p>This storefront currently stores carts in each shopper’s browser, so no {title.toLowerCase()} have been recorded centrally. Connect checkout, customer, and review storage before processing live records here.</p></section></>;
  }

  function renderContent(section) {
    const content = {
      hero: { title: "Hero Section", description: "Manage the first impression shoppers see on the home page.", cards: [["Hero copy", "Premium Chairs for a Better Tomorrow", "Main headline and call to action are defined in app/page.jsx."], ["Hero artwork", "Luxury office chair", "Primary image: Public/banner.jpeg"], ["Mobile artwork", "Portrait chair composition", "Mobile image: Public/banner_phone.png"]] },
      content: { title: "Homepage Content", description: "Review the key chair-store sections used on the homepage.", cards: [["Collections", "Office & Dining Chair Collections", "Collection cards link to the dedicated filtered catalog pages."], ["Campaign", "Comfort Meets Class", "Promotion asset: Public/upgrade your space.jpeg"], ["Trust badges", "Quality, Ergonomic Design, Built To Last", "Benefits appear beneath the hero on the storefront."]] },
      about: { title: "About Page", description: "Review brand messaging and craftsmanship content.", cards: [["Brand promise", "Comfort Meets Class", "About page copy is defined in app/about/page.jsx."], ["Craftsmanship", "Premium materials and thoughtful ergonomics", "Use this section to keep brand values consistent."], ["Contact", "Customer support information", "Contact details are defined in app/contact/page.jsx."]] },
      media: { title: "Media Library", description: "Inventory the storefront image assets used across the chair catalog.", cards: [["Product media", `${catalog.length} chair images`, "Product photos are stored in Public/Products."], ["Homepage media", "Hero and collection images", "Assets are stored in Public/ for fast local delivery."], ["Catalog updates", "Add chair photography", "Add an image to Public/Products, then update its product details in Products."]] },
      settings: { title: "Store Settings", description: "Review the operational settings for MK Designer Chairs.", cards: [["Store identity", "MK Designer Chairs", "Brand name, colors, and navigation are maintained in the application layout."], ["Admin access", "Environment-protected login", "Admin credentials and session secret are configured in .env."], ["Shipping & checkout", "Not connected", "The current storefront uses a local browser cart; connect a payment and shipping provider before accepting live orders."]] },
    }[section];

    const editableSection = section === "content" ? "campaign" : section;
    const canEdit = ["hero", "campaign", "about", "settings"].includes(editableSection);
    return <><div className="admin-page-heading"><div><p className="admin-kicker">STOREFRONT CONTENT</p><h1>{content.title}</h1><p>{content.description}</p></div><span className="admin-content-actions">{canEdit && <button className="admin-site-link" type="button" onClick={() => editLiveContent(editableSection)}>Edit live content</button>}<Link className="admin-site-link" href={section === "about" ? "/about" : "/"} target="_blank">↗ Preview page</Link></span></div><div className="admin-content-grid">{content.cards.map(([label, heading, description]) => <article key={label}><span>{label}</span><h2>{heading}</h2><p>{description}</p></article>)}</div><p className="admin-note">Live edits are stored locally and used by public pages on their next request.</p></>;
  }

  const body = activeSection === "overview" ? renderOverview() : activeSection === "categories" ? renderCategories() : activeSection === "products" ? renderProducts() : ["hero", "content", "about", "media", "settings"].includes(activeSection) ? renderContent(activeSection) : renderPlaceholder(activeSection === "orders" ? "Orders" : activeSection === "customers" ? "Customers" : activeSection === "reviews" ? "Reviews" : "Enquiries", activeSection === "orders" ? "Track payments, fulfillment, and delivery status." : activeSection === "customers" ? "Manage customer profiles and account access." : activeSection === "reviews" ? "Moderate shopper feedback for each chair." : "Review messages submitted through the contact page.");

  return <main className="admin-app"><aside className="admin-sidebar"><Link className="admin-brand" href="/"><span>MK</span><b>MK Designer Chairs<small>Admin Panel</small></b></Link><nav aria-label="Admin navigation">{navigation.map(([id, label, icon]) => <button className={activeSection === id ? "active" : ""} key={id} type="button" onClick={() => setActiveSection(id)}><span>{icon}</span>{label}</button>)}</nav><Link className="admin-sidebar-site" href="/" target="_blank">↗ Visit storefront</Link></aside><section className="admin-workspace"><header className="admin-topbar"><p>Admin Dashboard</p><div><span>{adminEmail}</span><button type="button" onClick={logout}>⇥ Logout</button></div></header><div className="admin-content">{body}</div></section></main>;
}
