"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("login");
  const [stage, setStage] = useState("email");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestCode(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const response = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name: mode === "signup" ? name : "" }) });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(data.error);
      return;
    }

    setStage("code");
    setMessage(`We sent a 6-digit code to ${email}.`);
  }

  async function verifyCode(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    const response = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, email }) });
    const data = await response.json();
    setIsSubmitting(false);
    if (!response.ok) {
      setMessage(data.error);
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next");
    const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    window.location.assign(destination);
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setStage("email");
  }

  return <main className="auth-page"><section className="auth-card"><Link className="brand auth-brand" href="/"><span className="brand-mark">MK</span><span>DESIGNER CHAIRS</span></Link><div className="auth-mode"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Login</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>Sign Up</button></div><p className="eyebrow">{stage === "email" ? "WELCOME" : "VERIFY YOUR EMAIL"}</p><h1>{stage === "email" ? mode === "login" ? "Welcome Back" : "Create Your Account" : "Enter Your Code"}</h1><p>{stage === "email" ? mode === "signup" ? "Enter your name and email address to create your account with a secure one-time code." : "Use your email address and we will send a secure, one-time verification code." : "Enter the six-digit code sent to your email address."}</p>{stage === "email" ? <form onSubmit={requestCode}>{mode === "signup" && <label>Full name<input autoComplete="name" maxLength="100" onChange={(event) => setName(event.target.value)} placeholder="Your name" required type="text" value={name} /></label>}<label>Email address<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /></label><button className="gold-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send OTP"}</button></form> : <form onSubmit={verifyCode}><label>Verification code<input inputMode="numeric" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="123456" required /></label><button className="gold-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Verifying…" : "Verify & Continue"}</button><button className="auth-link-button" type="button" onClick={() => setStage("email")}>Use a different email</button></form>}{message && <p className="auth-message" role="status">{message}</p>}</section></main>;
}
