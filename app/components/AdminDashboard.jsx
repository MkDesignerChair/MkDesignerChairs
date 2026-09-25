"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductEditor from "./ProductEditor";
import CategoryEditor from "./CategoryEditor";
import HomepageContentEditor from "./HomepageContentEditor";
import ReviewsManager from "./ReviewsManager";
import OrdersManager from "./OrdersManager";
import CustomersManager from "./CustomersManager";
import EnquiriesManager from "./EnquiriesManager";
import StoreSettingsManager from "./StoreSettingsManager";
import AboutPageEditor from "./AboutPageEditor";
import OverviewDashboard from "./OverviewDashboard";
import logo from "../../public/logo.png";

const navigation = [
  ["overview", "Overview", "dashboard"],
  ["categories", "Chair Categories", "categories"],
  ["products", "Products", "chair"],
  ["orders", "Orders", "orders"],
  ["customers", "Customers", "customers"],
  ["reviews", "Reviews", "reviews"],
  ["inquiries", "Enquiries", "inquiries"],
  ["hero", "Hero Section", "hero"],
  ["content", "Homepage Content", "content"],
  ["about", "About Page", "about"],
  ["settings", "Store Settings", "settings"],
];
const validSections = new Set(navigation.map(([id]) => id));

function AdminNavIcon({ name }) {
  const shared = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.8" };
  const icons = {
    dashboard: <><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></>,
    categories: <><path d="M4 5.5h6.2v6.2H4zM13.8 5.5H20v6.2h-6.2zM4 15.3h6.2v3.2H4zM13.8 15.3H20v3.2h-6.2z" /><path d="M6 12.6v1M9.2 12.6v1M15.8 12.6v1M19 12.6v1" /></>,
    chair: <><path d="M7 11V5.5c0-1.1.9-2 2-2h5c1.1 0 2 .9 2 2V11" /><path d="M5 11h14v5.5H5zM8 16.5v4M16 16.5v4M3.5 20.5h17" /><path d="M10 7h4" /></>,
    orders: <><path d="M6 3.5h12v17H6z" /><path d="M9 8h6M9 11.5h6M9 15h3" /><path d="m14.8 18.2 1.2 1.2 2.5-2.8" /></>,
    customers: <><circle cx="9" cy="8" r="3" /><circle cx="16.8" cy="9.5" r="2.2" /><path d="M3.8 19.5c.4-3.3 2.3-5 5.2-5s4.8 1.7 5.2 5M15.4 15.1c2.6.1 4.2 1.5 4.6 4.4" /></>,
    reviews: <><path d="m12 3.3 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z" /></>,
    inquiries: <><path d="M4 5.5h16v11H9l-4.5 3v-3H4z" /><path d="M7.5 9.5h9M7.5 12.5h5.5" /></>,
    hero: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="8.2" cy="9" r="1.5" /><path d="m5.5 17 4.3-4 3.1 2.7 2.2-2 3.3 3.3" /></>,
    content: <><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M3.5 8.5h17M8.5 8.5V20M12 11.5h5M12 14.5h5M12 17.5h3" /></>,
    about: <><circle cx="12" cy="12" r="8.5" /><path d="M12 10.5v5M12 7.5h.01" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.2 14.7 21 16l-2 3.4-2-1a7.9 7.9 0 0 1-2 .9l-.3 2.2h-4l-.3-2.2a7.9 7.9 0 0 1-2-.9l-2 1L4.1 16l1.8-1.3a7.7 7.7 0 0 1 0-2.4L4.1 11l2-3.4 2 1a7.9 7.9 0 0 1 2-.9l.3-2.2h4l.3 2.2a7.9 7.9 0 0 1 2 .9l2-1 2 3.4-1.8 1.3a7.7 7.7 0 0 1 0 2.4Z" /></>,
  };

  return <svg aria-hidden="true" className="admin-nav-icon" viewBox="0 0 24 24" {...shared}>{icons[name]}</svg>;
}

function formatPrice(price) {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function AdminDashboard({ adminEmail, categories, customers, inquiries, orders, products, reviews, siteContent }) {
  const [catalog, setCatalog] = useState(products);
  const [categoryList, setCategoryList] = useState(categories);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  const [imageAction, setImageAction] = useState("");
  const [search, setSearch] = useState("");
  const [content, setContent] = useState(siteContent);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("section");
  const activeSection = requestedSection && validSections.has(requestedSection) ? requestedSection : "overview";
  const visibleProducts = useMemo(() => catalog.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())), [catalog, search]);
  const activeProducts = catalog.filter((product) => product.isActive !== false);

  useEffect(() => {
    document.querySelectorAll(".admin-product-row input, .admin-product-row select").forEach((control) => {
      control.disabled = true;
    });
  }, [catalog, activeSection]);

  function setActiveSection(section) {
    if (!validSections.has(section) || section === activeSection) return;
    setEditingProductId(null);
    setEditingCategoryId(null);
    router.push(`/admin?section=${encodeURIComponent(section)}`);
  }

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

  function saveCategory(updatedCategory) {
    setCategoryList((current) => current.map((category) => category.id === updatedCategory.id ? updatedCategory : category));
    setCatalog((current) => current.map((product) => product.categoryId === updatedCategory.id ? { ...product, category: updatedCategory.name, categorySlug: updatedCategory.slug } : product));
  }

  function removeCategory(id, fallbackCategory) {
    setCategoryList((current) => current.filter((category) => category.id !== id));
    setCatalog((current) => current.map((product) => product.categoryId === id ? { ...product, category: fallbackCategory.name, categoryId: fallbackCategory.id, categorySlug: fallbackCategory.slug } : product));
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

  async function saveHeroContent(event) {
    event.preventDefault();
    setIsHeroSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "hero", values: content.hero }) });
    const result = await response.json();
    setIsHeroSaving(false);

    if (!response.ok) {
      setMessage(result.error || "Unable to save hero content.");
      return;
    }

    setContent((current) => ({ ...current, hero: result.content }));
    setMessage("Hero content saved. Refresh the storefront to view the latest changes.");
  }

  function updateHeroField(field, value) {
    setContent((current) => ({ ...current, hero: { ...current.hero, [field]: value } }));
  }

  async function deleteManagedHeroImage(image) {
    if (typeof image !== "string" || !image.startsWith("/uploads/")) return;
    const response = await fetch("/api/admin/hero-media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image }) });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Unable to delete the previous image.");
    }
  }

  async function saveHeroImage(field, image) {
    const response = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "hero", values: { [field]: image } }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to save the image.");
    setContent((current) => ({ ...current, hero: result.content }));
  }

  async function uploadHeroImage(field, file) {
    if (!file) return;
    const previousImage = content.hero[field];
    setImageAction(field);
    setMessage("");
    const formData = new FormData();
    formData.set("file", file);

    try {
      const uploadResponse = await fetch("/api/admin/hero-media", { method: "POST", body: formData });
      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadResult.error || "Unable to upload the image.");
      await saveHeroImage(field, uploadResult.image);
      await deleteManagedHeroImage(previousImage);
      setMessage("Image updated and published to the storefront.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update the image.");
    } finally {
      setImageAction("");
    }
  }

  async function removeHeroImage(field) {
    const previousImage = content.hero[field];
    setImageAction(field);
    setMessage("");

    try {
      await saveHeroImage(field, "");
      await deleteManagedHeroImage(previousImage);
      setMessage("Uploaded image removed. The storefront is using its original image again.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to remove the image.");
    } finally {
      setImageAction("");
    }
  }

  function renderOverview() {
    return <OverviewDashboard customers={customers} inquiries={inquiries} onNavigate={setActiveSection} orders={orders} products={catalog} reviews={reviews} />;
    return <><div className="admin-page-heading"><div><p className="admin-kicker">MK DESIGNER CHAIRS</p><h1>Overview</h1><p>Manage the seating catalog and monitor your storefront.</p></div><Link className="admin-site-link" href="/" target="_blank">↗ View store</Link></div><div className="admin-stats"><article><span>₹</span><strong>{formatPrice(activeProducts.reduce((total, product) => total + product.price, 0))}</strong><small>Catalog value</small></article><article><span>◇</span><strong>{activeProducts.length}</strong><small>Active chair designs</small></article><article><span>▦</span><strong>{categoryList.length}</strong><small>Chair categories</small></article><article><span>□</span><strong>0</strong><small>Confirmed orders</small></article></div><section className="admin-panel"><div className="admin-panel-heading"><div><span>◷</span><h2>Catalog snapshot</h2></div><button type="button" onClick={() => setActiveSection("products")}>Manage products</button></div><div className="admin-table"><div className="admin-table-head"><span>PRODUCT</span><span>CATEGORY</span><span>PRICE</span><span>STATUS</span></div>{catalog.slice(0, 6).map((product) => <div className="admin-product-row" key={product.id}><span className="admin-product-name"><img src={product.image} alt="" /><b>{product.name}</b></span><span>{product.category}</span><strong>{formatPrice(product.price)}</strong><span className={product.isActive !== false ? "admin-status" : "admin-status admin-status-off"}>{product.isActive !== false ? "Active" : "Hidden"}</span></div>)}</div></section></>;
  }

  function renderCategories() {
    const editingCategory = categoryList.find((category) => category.id === editingCategoryId);
    if (editingCategory) return <CategoryEditor category={editingCategory} productCount={catalog.filter((product) => product.categoryId === editingCategory.id).length} onClose={() => setEditingCategoryId(null)} onDeleted={removeCategory} onSaved={saveCategory} />;
    return <><div className="admin-page-heading"><div><p className="admin-kicker">CATALOG STRUCTURE</p><h1>Chair Categories</h1><p>Manage category names, links, imagery, and homepage placement from one source.</p></div></div><section className="admin-panel"><div className="admin-table"><div className="admin-table-head"><span>CATEGORY</span><span>SLUG</span><span>PRODUCTS</span><span>ACTIONS</span></div>{categoryList.map((category) => <div className="admin-product-row" key={category.id}><strong>{category.name}</strong><code>{category.slug}</code><span>{catalog.filter((product) => product.categoryId === category.id).length} chairs{category.featured && <small className="admin-featured-category">Featured</small>}</span><button className="admin-inline-link admin-category-edit" type="button" onClick={() => setEditingCategoryId(category.id)}>Edit</button></div>)}</div></section><p className="admin-note">Editing a category updates product choices, filters, storefront links, and featured spaces. Deleting a category safely moves its products to the remaining fallback category.</p></>;
  }

  function renderReviews() {
    return <ReviewsManager initialReviews={reviews} />;
  }

  function renderOrders() {
    return <OrdersManager initialOrders={orders} />;
  }

  function renderCustomers() {
    return <CustomersManager initialCustomers={customers} />;
  }

  function renderInquiries() {
    return <EnquiriesManager initialInquiries={inquiries} />;
  }

  function renderStoreSettings() {
    return <StoreSettingsManager initialSettings={content.settings} onSaved={(settings) => setContent((current) => ({ ...current, settings }))} />;
  }

  function renderAboutEditor() {
    return <AboutPageEditor about={content.about} onSaved={(about) => setContent((current) => ({ ...current, about }))} onSectionChange={(about) => setContent((current) => ({ ...current, about }))} />;
  }

  function renderHeroEditor() {
    const images = [
      { field: "heroImage", label: "Main hero image", hint: "Used across the homepage hero on desktop and mobile.", fallback: "/banner.jpeg", ratio: "16:9", dimensions: "1920 × 1080 px" },
      { field: "officeCollectionImage", label: "Office Chairs image", hint: "Used in the Office Chairs collection card.", fallback: "/Products/office%20chair.jpeg", ratio: "4:3", dimensions: "1200 × 900 px" },
      { field: "diningCollectionImage", label: "Dining Chairs image", hint: "Used in the Dining Chairs collection card.", fallback: "/Dinning%20Chair.jpeg", ratio: "4:3", dimensions: "1200 × 900 px" },
    ];

    return <><div className="admin-page-heading"><div><p className="admin-kicker">STOREFRONT CONTENT</p><h1>Hero Section</h1><p>Update the homepage introduction, collection messages, and imagery without changing its design.</p></div><Link className="admin-site-link" href="/" target="_blank">↗ Preview page</Link></div>{message && <p className="admin-message" role="status">{message}</p>}<form className="admin-hero-form" onSubmit={saveHeroContent}><section className="admin-editor-card"><div><h2>Hero copy</h2><p className="admin-editor-hint">Text updates are published to the storefront when you save.</p></div><label>Eyebrow<input value={content.hero.eyebrow} onChange={(event) => updateHeroField("eyebrow", event.target.value)} /></label><div className="admin-editor-two"><label>Headline line one<input value={content.hero.title} onChange={(event) => updateHeroField("title", event.target.value)} /></label><label>Headline line two<input value={content.hero.accent} onChange={(event) => updateHeroField("accent", event.target.value)} /></label></div><label>Description<textarea rows="4" value={content.hero.description} onChange={(event) => updateHeroField("description", event.target.value)} /></label><div className="admin-editor-two"><label>Office Chairs message<input value={content.hero.officeCollectionDescription} onChange={(event) => updateHeroField("officeCollectionDescription", event.target.value)} /></label><label>Dining Chairs message<input value={content.hero.diningCollectionDescription} onChange={(event) => updateHeroField("diningCollectionDescription", event.target.value)} /></label></div><button className="admin-save-product" disabled={isHeroSaving} type="submit">{isHeroSaving ? "Saving…" : "Save hero content"}</button></section></form><section className="admin-hero-images" aria-label="Hero image management">{images.map(({ field, label, hint, fallback, ratio, dimensions }) => { const image = content.hero[field] || fallback; const isUploading = imageAction === field; const isUploadedImage = content.hero[field]?.startsWith("/uploads/"); return <article className="admin-hero-image-card" key={field}><img src={image} alt={`${label} preview`} /><div className="admin-hero-image-copy"><div><h2>{label}</h2><p>{hint}</p></div><div className="admin-hero-image-actions"><label className="admin-file-input">{isUploading ? "Uploading…" : isUploadedImage ? "Replace image" : "Upload image"}<input accept="image/jpeg,image/png,image/webp" disabled={isUploading} type="file" onChange={(event) => { uploadHeroImage(field, event.target.files?.[0]); event.target.value = ""; }} /></label>{isUploadedImage && <button className="admin-delete-image" disabled={isUploading} type="button" onClick={() => removeHeroImage(field)}>Delete image</button>}</div><p className="admin-hero-image-spec"><strong>Recommended:</strong> {ratio} · {dimensions}<br />JPG, PNG, or WEBP · maximum 5 MB</p></div></article>; })}</section><p className="admin-note">Deleting an uploaded image safely restores the original storefront image.</p></>;
  }

  function renderProducts() {
    const editingProduct = catalog.find((product) => product.id === editingProductId);
    if (editingProduct) return <ProductEditor categories={categoryList} product={editingProduct} onClose={() => setEditingProductId(null)} onSaved={(savedProduct) => { const category = categoryList.find((item) => item.id === savedProduct.categoryId); setCatalog((current) => current.map((product) => product.id === savedProduct.id ? { ...savedProduct, category: category?.name || savedProduct.category, categorySlug: category?.slug || savedProduct.categorySlug } : product)); }} />;

    return <><div className="admin-page-heading"><div><p className="admin-kicker">CHAIR CATALOG</p><h1>Products</h1><p>Edit product name, price, category, storefront visibility, and chair specifications.</p></div><label className="admin-search">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search chairs" /></label></div>{message && <p className="admin-message" role="status">{message}</p>}<section className="admin-panel"><div className="admin-table admin-product-table"><div className="admin-table-head"><span>PRODUCT</span><span>CATEGORY</span><span>PRICE</span><span>STATUS</span></div>{visibleProducts.map((product) => <div className="admin-product-row" key={product.id}><span className="admin-product-name"><img src={product.image} alt="" /><input aria-label={`Name for ${product.name}`} value={product.name} onChange={(event) => setCatalog((current) => current.map((item) => item.id === product.id ? { ...item, name: event.target.value } : item))} onBlur={(event) => saveProduct(product.id, { name: event.target.value })} /></span><select aria-label={`Category for ${product.name}`} value={product.categoryId} onChange={(event) => saveProduct(product.id, { categoryId: event.target.value })}>{categoryList.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><label className="admin-price"><span>₹</span><input aria-label={`Price for ${product.name}`} min="1" type="number" value={product.price} onChange={(event) => setCatalog((current) => current.map((item) => item.id === product.id ? { ...item, price: Number(event.target.value) } : item))} onBlur={(event) => saveProduct(product.id, { price: Number(event.target.value) })} /></label><span className="admin-product-actions"><button className={product.isActive !== false ? "admin-status admin-status-button" : "admin-status admin-status-off admin-status-button"} disabled={isSaving} type="button" onClick={() => saveProduct(product.id, { isActive: product.isActive === false })}>{product.isActive !== false ? "Active" : "Hidden"}</button><button type="button" onClick={() => editChairDetails(product)}>Details</button><label className="admin-image-upload">Image<input accept="image/jpeg,image/png,image/webp" disabled={isSaving} type="file" onChange={(event) => replaceProductImage(product, event.target.files?.[0])} /></label></span></div>)}</div></section><p className="admin-note">Details include upholstery, finishes, dimensions, weight capacity, warranty, stock, FAQs, and SEO metadata. Upload a JPG, PNG, or WEBP image (up to 5 MB) directly from each product row.</p></>;
  }

  function renderHomepageContent() {
    return <HomepageContentEditor content={content} onContentSaved={(section, savedContent) => setContent((current) => ({ ...current, [section]: savedContent }))} onSectionChange={(section, nextSection) => setContent((current) => ({ ...current, [section]: nextSection }))} />;
  }

  function renderPlaceholder(title, description) {
    return <><div className="admin-page-heading"><div><p className="admin-kicker">STORE OPERATIONS</p><h1>{title}</h1><p>{description}</p></div></div><section className="admin-empty"><span>⌁</span><h2>No records yet</h2><p>This storefront currently stores carts in each shopper’s browser, so no {title.toLowerCase()} have been recorded centrally. Connect checkout, customer, and review storage before processing live records here.</p></section></>;
  }

  function renderContent(section) {
    const content = {
      content: { title: "Homepage Content", description: "Review the key chair-store sections used on the homepage.", cards: [["Collections", "Office & Dining Chair Collections", "Collection cards link to the dedicated filtered catalog pages."], ["Campaign", "Comfort Meets Class", "Promotion asset: Public/upgrade your space.jpeg"], ["Trust badges", "Quality, Ergonomic Design, Built To Last", "Benefits appear beneath the hero on the storefront."]] },
      about: { title: "About Page", description: "Review brand messaging and craftsmanship content.", cards: [["Brand promise", "Comfort Meets Class", "About page copy is defined in app/about/page.jsx."], ["Craftsmanship", "Premium materials and thoughtful ergonomics", "Use this section to keep brand values consistent."], ["Contact", "Customer support information", "Contact details are defined in app/contact/page.jsx."]] },
      settings: { title: "Store Settings", description: "Review the operational settings for MK Designer Chairs.", cards: [["Store identity", "MK Designer Chairs", "Brand name, colors, and navigation are maintained in the application layout."], ["Admin access", "Environment-protected login", "Admin credentials and session secret are configured in .env."], ["Shipping & checkout", "Not connected", "The current storefront uses a local browser cart; connect a payment and shipping provider before accepting live orders."]] },
    }[section];

    const editableSection = section === "content" ? "campaign" : section;
    const canEdit = ["hero", "campaign", "about", "settings"].includes(editableSection);
    return <><div className="admin-page-heading"><div><p className="admin-kicker">STOREFRONT CONTENT</p><h1>{content.title}</h1><p>{content.description}</p></div><span className="admin-content-actions">{canEdit && <button className="admin-site-link" type="button" onClick={() => editLiveContent(editableSection)}>Edit live content</button>}<Link className="admin-site-link" href={section === "about" ? "/about" : "/"} target="_blank">↗ Preview page</Link></span></div><div className="admin-content-grid">{content.cards.map(([label, heading, description]) => <article key={label}><span>{label}</span><h2>{heading}</h2><p>{description}</p></article>)}</div><p className="admin-note">Live edits are stored locally and used by public pages on their next request.</p></>;
  }

  const body = activeSection === "overview" ? renderOverview() : activeSection === "categories" ? renderCategories() : activeSection === "products" ? renderProducts() : activeSection === "orders" ? renderOrders() : activeSection === "customers" ? renderCustomers() : activeSection === "reviews" ? renderReviews() : activeSection === "inquiries" ? renderInquiries() : activeSection === "hero" ? renderHeroEditor() : activeSection === "content" ? renderHomepageContent() : activeSection === "settings" ? renderStoreSettings() : activeSection === "about" ? renderAboutEditor() : renderPlaceholder("Unavailable", "This admin section is not available.");

  return <main className="admin-app"><aside className="admin-sidebar"><Link className="admin-brand" href="/"><Image src={logo} alt="MK Designer Chairs" priority /><b>MK Designer Chairs<small>Admin Panel</small></b></Link><nav aria-label="Admin navigation">{navigation.map(([id, label, icon]) => <button className={activeSection === id ? "active" : ""} key={id} type="button" onClick={() => setActiveSection(id)}><AdminNavIcon name={icon} />{label}</button>)}</nav><Link className="admin-sidebar-site" href="/" target="_blank">↗ Visit storefront</Link></aside><section className="admin-workspace"><header className="admin-topbar"><p>Admin Dashboard</p><div><span>{adminEmail}</span><button type="button" onClick={logout}>⇥ Logout</button></div></header><div className="admin-content">{body}</div></section></main>;
}
