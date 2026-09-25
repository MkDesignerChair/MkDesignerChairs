"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function HeaderActions() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [user, setUser] = useState(null);

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

  async function logout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) throw new Error("Unable to sign out.");

    setUser(null);
    router.refresh();
  }

  return <div className="nav-actions header-actions">
    <button className="icon-button" type="button" aria-label="Search products" onClick={() => router.push("/shop")}><SearchIcon /></button>
    {user ? <details className="customer-menu"><summary aria-label="Open customer account menu"><UserIcon /><span>Account</span></summary><div className="customer-menu-panel"><small>Signed in as</small><strong>{user.name}</strong><span title={user.email}>{user.email}</span><button className="customer-logout" type="button" onClick={logout}>Logout</button></div></details> : <Link className="icon-button" href="/login" aria-label="Login or sign up"><UserIcon /></Link>}
    <button className="icon-button cart" type="button" aria-label="View cart" onClick={() => router.push("/cart")}><CartIcon /><span>{totalItems}</span></button>
  </div>;
}
