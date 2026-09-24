"use client";

import { useState } from "react";

export default function ContactForm() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(formData) {
    setIsSubmitting(true);
    setMessage("");
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    const result = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(result.error || "Unable to send your enquiry.");
      return;
    }

    setMessage("Thank you — your enquiry has been received.");
  }

  return <form action={submit} className="contact-form"><div className="contact-form-heading"><p className="eyebrow">SEND AN ENQUIRY</p><h2>Tell us about your space.</h2><p>Share what you are looking for and we will help you find the right seating.</p></div><div className="contact-form-names"><label>First name<input name="first-name" required type="text" placeholder="Your first name" /></label><label>Last name<input name="last-name" required type="text" placeholder="Your last name" /></label></div><label>Email address<input name="email" required type="email" placeholder="you@example.com" /></label><label>How can we help?<textarea name="message" required rows="5" placeholder="Tell us about your space, quantity, or chair preference." /></label><button disabled={isSubmitting} type="submit">{isSubmitting ? "Sending…" : "Send enquiry"}</button>{message && <p className="contact-form-message" role="status">{message}</p>}</form>;
}
