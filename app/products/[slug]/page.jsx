import { notFound } from "next/navigation";
import AddToCartButton from "../../components/AddToCartButton";
import BuyNowButton from "../../components/BuyNowButton";
import ProductImageZoom from "../../components/ProductImageZoom";
import WishlistButton from "../../components/WishlistButton";
import { SiteNavigation } from "../../components/SecondaryPage";
import { getProductBySlug, getProducts } from "../../lib/products";

function formatPrice(price) {
  return `₹${price.toLocaleString("en-IN")}`;
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
  return images.filter((image, index) => images.indexOf(image) === index);
}

function RelatedProductCard({ product }) {
  return <a className="related-product-card" href={`/products/${product.detailSlug || product.id}`}><div className="related-product-image"><img src={product.image} alt={product.name} /></div><div className="related-product-copy"><span>{product.category}</span><h3>{product.name}</h3><strong>{formatPrice(product.price)}</strong></div></a>;
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProductBySlug(slug), getProducts()]);
  if (!product) notFound();

  const cartProduct = { id: product.id, image: product.image, name: product.name, price: product.price, category: product.category };
  const outOfStock = product.stock !== undefined && (!Number.isInteger(Number(product.stock)) || Number(product.stock) < 1);
  const highlights = getProductHighlights(product.category);
  const productImages = getProductImages(product);
  const relatedProducts = products.filter((candidate) => candidate.id !== product.id).sort((first, second) => Number(second.category === product.category) - Number(first.category === product.category)).slice(0, 3);

  return <main className="product-detail-page"><SiteNavigation active="Shop" /><section className="product-detail-shell"><ProductImageZoom images={productImages} alt={product.name} /><article className="product-detail-copy"><p className="eyebrow product-detail-category">{product.category}</p><h1>{product.name}</h1><strong>{formatPrice(product.price)}</strong><p>{product.description || product.shortDescription || `A carefully selected ${product.category.toLowerCase()} designed for everyday comfort, lasting support, and a polished interior.`}</p>{outOfStock && <p className="checkout-error">Currently out of stock</p>}<div className="product-detail-actions"><AddToCartButton disabled={outOfStock} product={cartProduct} /><BuyNowButton disabled={outOfStock} product={cartProduct} /><WishlistButton className="product-wishlist-button" product={cartProduct} /></div><section className="product-highlights" aria-label="Product highlights">{highlights.map((highlight) => <div key={highlight.label}><span>{highlight.label}</span><strong>{highlight.value}</strong></div>)}</section><section className="product-specifications"><h2>Chair details</h2><dl><div><dt>Material</dt><dd>{product.material || "Premium chair upholstery"}</dd></div><div><dt>Dimensions</dt><dd>{product.dimensions || "Dimensions available on request"}</dd></div><div><dt>Warranty</dt><dd>{product.warranty || "1-year manufacturer warranty"}</dd></div></dl><p className="product-service-note">Delivery guidance, secure checkout, and care support are available with your order.</p></section></article></section>{relatedProducts.length > 0 && <section className="related-products" aria-labelledby="related-products-title"><div className="related-products-heading"><p className="eyebrow">MORE TO EXPLORE</p><h2 id="related-products-title">You might also like</h2></div><div className="related-products-grid">{relatedProducts.map((relatedProduct) => <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />)}</div></section>}</main>;
}
