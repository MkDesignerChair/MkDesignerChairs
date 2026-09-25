"use client";

import { useRef, useState } from "react";

export default function ContactForm() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  async function submit(formData) {
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your enquiry.");
      formRef.current?.reset();
      setMessageType("success");
      setMessage("Thank you — your enquiry has been received.");
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Unable to send your enquiry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <form action={submit} className="contact-form" ref={formRef}><div className="contact-form-heading"><p className="eyebrow">SEND AN ENQUIRY</p><h2>Tell us about your space.</h2><p>Share what you are looking for and we will help you find the right seating.</p></div><div className="contact-form-names"><label>First name<input maxLength="80" name="first-name" required type="text" placeholder="Your first name" /></label><label>Last name<input maxLength="80" name="last-name" required type="text" placeholder="Your last name" /></label></div><div className="contact-form-names"><label>Email address<input maxLength="254" name="email" required type="email" placeholder="you@example.com" /></label><label>Phone number <small>Optional</small><input maxLength="30" name="phone" type="tel" placeholder="+91 00000 00000" /></label></div><label>How can we help?<textarea maxLength="3000" name="message" required rows="5" placeholder="Tell us about your space, quantity, or chair preference." /></label><button disabled={isSubmitting} type="submit">{isSubmitting ? "Sending…" : "Send enquiry"}</button>{message && <p className={`contact-form-message contact-form-message--${messageType}`} role="status">{message}</p>}</form>;
}
