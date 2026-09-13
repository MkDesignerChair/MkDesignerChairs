"use client";

import { useMemo, useState } from "react";
import AddToCartButton from "./AddToCartButton";

const categories = ["Office Chairs", "Dining Chairs", "Lounge Chairs", "Accent Chairs", "Ergonomic Chairs"];

function getCategory(product, index) {
  if (product.category) return product.category;
  if (product.name === "Executive Office Chair") return "Office Chairs";
  return categories[(index - 1 + categories.length) % categories.length];
}

function formatPrice(price) {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function ProductCatalog({ products, initialSelectedCategory, eyebrow, title }) {
  const lowestPrice = Math.min(...products.map((product) => product.price));
  const highestPrice = Math.max(...products.map((product) => product.price));
  const [selectedCategories, setSelectedCategories] = useState(() => initialSelectedCategory ? [initialSelectedCategory] : []);
  const [maxPrice, setMaxPrice] = useState(highestPrice);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const categorizedProducts = useMemo(() => products.map((product, index) => ({ ...product, category: getCategory(product, index) })), [products]);
  const filteredProducts = categorizedProducts.filter((product) => (selectedCategories.length === 0 || selectedCategories.includes(product.category)) && product.price <= maxPrice);

  function toggleCategory(category) {
    setSelectedCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  }

  function clearFilters() {
    setSelectedCategories([]);
    setMaxPrice(highestPrice);
  }

  return <section className="shop-content">
    <div className="shop-heading"><div><p className="eyebrow">{eyebrow ?? "THE FULL COLLECTION"}</p><h2>{title ?? "Every Chair, One Place"}</h2></div><span>{filteredProducts.length} of {products.length} designs</span></div>
    <button className="filter-toggle" type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>Filters <span>{selectedCategories.length || "All"}</span></button>
    <div className="shop-catalog-layout">
      <aside className={`product-filters ${filtersOpen ? "is-open" : ""}`} aria-label="Filter products">
        <div className="filter-heading"><h3>Filter Products</h3><button type="button" onClick={clearFilters}>Clear all</button></div>
        <fieldset className="filter-group"><legend>Categories</legend>{categories.map((category) => <label className="filter-checkbox" key={category}><input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} /><span>{category}</span></label>)}</fieldset>
        <fieldset className="filter-group filter-price"><legend><span>Max Price</span><strong>{formatPrice(maxPrice)}</strong></legend><input aria-label="Maximum price" max={highestPrice} min={lowestPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} step="250" type="range" value={maxPrice} /><div><span>{formatPrice(lowestPrice)}</span><span>{formatPrice(highestPrice)}</span></div></fieldset>
      </aside>
      <div className="shop-products-area">
        <p className="products-showing">Showing <strong>{filteredProducts.length}</strong> products</p>
        {filteredProducts.length > 0 ? <div className="shop-grid">{filteredProducts.map((product) => <article className="shop-product-card" key={product.id}><div className="shop-product-image"><img src={product.image} alt={product.name} /><span>{product.category}</span></div><div className="shop-product-details"><div><h3>{product.name}</h3><strong>{formatPrice(product.price)}</strong></div><AddToCartButton product={product} /></div></article>)}</div> : <div className="no-products"><h3>No matching chairs</h3><p>Try raising the maximum price or choosing another category.</p><button type="button" onClick={clearFilters}>Reset filters</button></div>}
      </div>
    </div>
  </section>;
}
