import { notFound } from "next/navigation";
import officeChair from "../../../public/Products/office chair.jpeg";
import pinkOfficeChair from "../../../public/Products/WhatsApp Image 2026-09-12 at 1.09.05 PMasd.jpeg";
import yellowOfficeChair from "../../../public/Products/WhatsApp Image 2026-09-12 at 1.09.06 PMdfd.jpeg";
import blueDiningChair from "../../../public/Products/WhatsApp Image 2026-09-12 at 1.09.07 PMdfd.jpeg";
import AddToCartButton from "../../components/AddToCartButton";
import BuyNowButton from "../../components/BuyNowButton";
import ProductImageZoom from "../../components/ProductImageZoom";
import { SiteNavigation } from "../../components/SecondaryPage";
import { getProducts } from "../../lib/products";

const products = [
  { slug: "executive-office-chair", name: "Executive Office Chair", price: 12999, image: officeChair, category: "Office Chairs", material: "Premium upholstered leather", dimensions: "68 × 66 × 116 cm", warranty: "2-year structural warranty", description: "A refined executive chair with supportive cushioning, a smooth swivel base, and a silhouette designed for long, focused workdays." },
  { slug: "premium-office-chair", name: "Premium Office Chair", price: 14499, image: yellowOfficeChair, category: "Office Chairs", material: "Soft-touch performance upholstery", dimensions: "67 × 65 × 112 cm", warranty: "2-year structural warranty", description: "A statement office chair that pairs plush comfort with an ergonomic high-back design and durable everyday performance." },
  { slug: "luxury-dining-chair", name: "Luxury Dining Chair", price: 8999, image: blueDiningChair, category: "Dining Chairs", material: "Textured woven fabric", dimensions: "61 × 64 × 88 cm", warranty: "1-year upholstery warranty", description: "A sculptural dining chair with a welcoming seat, tailored upholstery, and a versatile silhouette for memorable meals." },
  { slug: "modern-office-chair", name: "Modern Office Chair", price: 9499, image: pinkOfficeChair, category: "Office Chairs", material: "Performance velvet upholstery", dimensions: "66 × 64 × 110 cm", warranty: "2-year structural warranty", description: "A modern workspace essential that brings expressive color, adjustable comfort, and dependable support to your desk." },
];

function formatPrice(price) {
  return `₹${price.toLocaleString("en-IN")}`;
}

function getImageSource(image) {
  return typeof image === "string" ? image : image.src;
}

function getProductHighlights(category) {
  const bestFor = category === "Office Chairs" ? "Focused work and study" : category === "Dining Chairs" ? "Dining and entertaining" : "Everyday seating spaces";

  return [
    { label: "Comfort", value: category === "Office Chairs" ? "Supportive everyday seating" : "Comfort-first cushioning" },
    { label: "Best for", value: bestFor },
    { label: "Assembly", value: "Simple setup guidance included" },
  ];
}

function getProductImages(product) {
  const images = [product.image, ...(Array.isArray(product.galleryImages) ? product.galleryImages : [])].filter(Boolean);

  return images.filter((image, index) => images.findIndex((candidate) => getImageSource(candidate) === getImageSource(image)) === index);
}

function getRelatedProducts(product, catalogProducts) {
  return [...products, ...catalogProducts]
    .filter((candidate) => candidate.name !== product.name)
    .sort((first, second) => Number(second.category === product.category) - Number(first.category === product.category))
    .slice(0, 3);
}

function RelatedProductCard({ product }) {
  const image = getImageSource(product.image);
  const slug = product.detailSlug || product.slug || product.id;

  return <a className="related-product-card" href={`/products/${slug}`}><div className="related-product-image"><img src={image} alt={product.name} /></div><div className="related-product-copy"><span>{product.category}</span><h3>{product.name}</h3><strong>{formatPrice(product.price)}</strong></div></a>;
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const catalogProducts = await getProducts();
  const catalogProduct = catalogProducts.find((item) => item.detailSlug === slug || item.id === slug);
  const staticProduct = products.find((item) => item.slug === slug);
  const product = staticProduct || (catalogProduct ? {
    ...catalogProduct,
    slug: catalogProduct.id,
    material: catalogProduct.material || "Premium chair upholstery",
    dimensions: catalogProduct.dimensions || "Dimensions available on request",
    warranty: catalogProduct.warranty || "1-year manufacturer warranty",
    description: catalogProduct.description || `A carefully selected ${catalogProduct.category.toLowerCase()} designed for everyday comfort, lasting support, and a polished interior.`,
  } : undefined);

  if (!product) notFound();

  const imageUrl = getImageSource(product.image);
  const cartProduct = { id: product.slug, image: imageUrl, name: product.name, price: product.price, category: product.category };
  const highlights = getProductHighlights(product.category);
  const productImages = getProductImages(product);
  const relatedProducts = getRelatedProducts(product, catalogProducts);

  return <main className="product-detail-page"><SiteNavigation active="Shop" /><section className="product-detail-shell"><ProductImageZoom images={productImages} alt={product.name} /><article className="product-detail-copy"><p className="eyebrow product-detail-category">{product.category}</p><h1>{product.name}</h1><strong>{formatPrice(product.price)}</strong><p>{product.description}</p><div className="product-detail-actions"><AddToCartButton product={cartProduct} /><BuyNowButton product={cartProduct} /></div><section className="product-highlights" aria-label="Product highlights">{highlights.map((highlight) => <div key={highlight.label}><span>{highlight.label}</span><strong>{highlight.value}</strong></div>)}</section><section className="product-specifications"><h2>Chair details</h2><dl><div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>Dimensions</dt><dd>{product.dimensions}</dd></div><div><dt>Warranty</dt><dd>{product.warranty}</dd></div></dl><p className="product-service-note">Delivery guidance, secure checkout, and care support are available with your order.</p></section></article></section>{relatedProducts.length > 0 && <section className="related-products" aria-labelledby="related-products-title"><div className="related-products-heading"><p className="eyebrow">MORE TO EXPLORE</p><h2 id="related-products-title">You might also like</h2></div><div className="related-products-grid">{relatedProducts.map((relatedProduct) => <RelatedProductCard key={relatedProduct.detailSlug || relatedProduct.slug || relatedProduct.id} product={relatedProduct} />)}</div></section>}</main>;
}
