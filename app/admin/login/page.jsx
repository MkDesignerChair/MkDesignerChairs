"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function login(event) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const result = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(result.error || "Unable to sign in.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return <main className="admin-login-page"><section className="admin-login-card"><Link className="admin-login-brand" href="/"><span>MK</span><b>MK Designer Chairs<small>Store Administration</small></b></Link><p className="admin-kicker">RESTRICTED ACCESS</p><h1>Admin sign in</h1><p>Use the administrator credentials configured for this chair store.</p><form onSubmit={login}><label>Email address<input autoComplete="username" onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" required type="email" value={email} /></label><label>Password<input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label><button disabled={isSubmitting} type="submit">{isSubmitting ? "Signing in…" : "Sign in to dashboard"}</button></form>{message && <p className="admin-login-message" role="status">{message}</p>}<Link className="admin-back-link" href="/">← Back to store</Link></section></main>;
}
