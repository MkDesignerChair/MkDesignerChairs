"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./StoreProvider";

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4" /><path d="m16 16 4.2 4.2" /></svg>;
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2" /><path d="M5.1 20.1c.6-3.4 2.9-5.4 6.9-5.4s6.3 2 6.9 5.4" /></svg>;
}

function CartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2 11.2h10.7l2-8H6" /><circle cx="9" cy="19.3" r="1.2" /><circle cx="17.5" cy="19.3" r="1.2" /></svg>;
}

function WishlistIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
}

export function SearchForm({ className = "site-search", onEscape }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  function submitSearch(event) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/shop?search=${encodeURIComponent(value)}` : "/shop");
  }

  function handleKeyDown(event) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    inputRef.current?.blur();
    if (onEscape) onEscape();
    else inputRef.current?.closest("details")?.removeAttribute("open");
  }

  return <form className={className} role="search" onSubmit={submitSearch}>
    <SearchIcon />
    <input aria-label="Search products" autoComplete="off" onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} placeholder="Search chairs" ref={inputRef} type="search" value={query} />
    {query && <button aria-label="Clear search" className="site-search-clear" onClick={() => { setQuery(""); inputRef.current?.focus(); }} type="button">×</button>}
  </form>;
}

export default function HeaderActions() {
  const router = useRouter();
  const { totalItems, wishlistTotal } = useCart();
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (!response.ok) return;

      const result = await response.json();
      if (active) setUser(result.user || null);
    }

    loadSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  async function logout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) throw new Error("Unable to sign out.");

    setUser(null);
    router.refresh();
  }

  return <div className="nav-actions header-actions">
    <button aria-expanded={searchOpen} className="icon-button search-trigger" type="button" aria-label={searchOpen ? "Close product search" : "Search products"} onClick={() => setSearchOpen((open) => !open)}><SearchIcon /></button>
    {searchOpen && <form className="header-search" role="search" onSubmit={(event) => { event.preventDefault(); const value = searchInputRef.current?.value.trim(); router.push(value ? `/shop?search=${encodeURIComponent(value)}` : "/shop"); setSearchOpen(false); }} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); setSearchOpen(false); } }}><SearchIcon /><input aria-label="Search products" autoComplete="off" placeholder="Search chairs" ref={searchInputRef} type="search" /><button aria-label="Submit search" type="submit">Search</button></form>}
    <button className="icon-button wishlist-nav" type="button" aria-label={`View wishlist with ${wishlistTotal} item${wishlistTotal === 1 ? "" : "s"}`} onClick={() => router.push("/wishlist")}><WishlistIcon />{wishlistTotal > 0 && <span>{wishlistTotal}</span>}</button>
    {user ? <details className="customer-menu"><summary aria-label="Open customer account menu"><UserIcon /><span>Account</span></summary><div className="customer-menu-panel"><small>Signed in as</small><strong>{user.name}</strong><span title={user.email}>{user.email}</span><Link className="customer-orders-link" href="/orders">My orders</Link><button className="customer-logout" type="button" onClick={logout}>Logout</button></div></details> : <Link className="icon-button" href="/login" aria-label="Login or sign up"><UserIcon /></Link>}
    <button className="icon-button cart" type="button" aria-label="View cart" onClick={() => router.push("/cart")}><CartIcon /><span>{totalItems}</span></button>
  </div>;
}
