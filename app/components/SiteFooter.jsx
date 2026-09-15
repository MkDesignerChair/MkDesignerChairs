"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "../../Public/logo.png";

function SocialIcon({ name }) {
  const icons = {
    facebook: <path d="M14 21v-8h2.8l.4-3H14V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.4-.1-1.2-.2-2.2-.2-2.2 0-3.8 1.3-3.8 3.9V10H8v3h3v8z" fill="currentColor" stroke="none" />,
    youtube: <path d="M21.5 7.1a2.8 2.8 0 0 0-2-2C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.5.5a2.8 2.8 0 0 0-2 2A28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a2.8 2.8 0 0 0 2-2A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.5-4.9ZM10 15.5v-7l6 3.5z" fill="currentColor" stroke="none" />,
    linkedin: <><rect x="4" y="9" width="3.3" height="11" fill="currentColor" stroke="none" /><circle cx="5.65" cy="5.6" r="1.8" fill="currentColor" stroke="none" /><path d="M10 20V9h3.2v1.5c.6-1 1.7-1.9 3.7-1.9 3.1 0 3.7 2 3.7 4.7V20h-3.4v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V20z" fill="currentColor" stroke="none" /></>,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[name]}</svg>;
}

export default function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return <footer className="site-footer"><div className="footer-content"><div className="footer-brand"><Image src={logo} alt="MK Designer Chairs" width={96} height={93} /><p>Comfort Meets Class</p></div><p className="footer-intro">MK Designer Chairs brings you premium chairs designed for modern living and working spaces. Quality, style and comfort — always.</p><nav className="footer-links" aria-label="Footer navigation"><h3>Quick Links</h3><a href="/">Home</a><a href="/office-chairs">Office Chairs</a><a href="/dining-chairs">Dining Chairs</a><a href="/collections">Collections</a><a href="/about">About Us</a><a href="/contact">Contact</a></nav><address className="footer-contact"><h3>Contact Us</h3><a href="tel:+910000000000">☎ &nbsp;+91 00000 00000</a><a href="mailto:info@designerchairs.example">✉ &nbsp;info@designerchairs.example</a><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Image src="/placeholder.png" alt="Location" width={14} height={14} /><span style={{ color: '#d2ccc0' }}>Delhi, India</span></div></address><div className="footer-social"><h3>Follow Us</h3><div><a href="#facebook" aria-label="Facebook"><SocialIcon name="facebook" /></a><a href="#youtube" aria-label="YouTube"><SocialIcon name="youtube" /></a><a href="#linkedin" aria-label="LinkedIn"><SocialIcon name="linkedin" /></a></div></div></div><div className="footer-bottom"><span>© 2024 MK Designer Chairs. All Rights Reserved.</span><span><a href="#privacy">Privacy Policy</a><b>|</b><a href="#terms">Terms &amp; Conditions</a></span></div></footer>;
}
