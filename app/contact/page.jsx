import SecondaryPage from "../components/SecondaryPage";
import contactHero from "../../Public/Products/office chair.jpeg";

export default function ContactPage() {
  return <SecondaryPage active="Contact" eyebrow="WE WOULD LOVE TO HELP" title="Let’s Find Your Perfect Chair" description="Tell us about your space and our team will help you choose seating that fits beautifully." image={contactHero}><section className="route-content contact-layout"><div><p className="eyebrow">CONTACT US</p><h2>Start a conversation.</h2><p>For homes, offices, restaurants and commercial spaces, we are here to help create a more comfortable place to sit.</p><a className="contact-email" href="mailto:info@designerchairs.example">info@designerchairs.example</a></div><form className="contact-form"><label>Name<input name="name" type="text" placeholder="Your name" /></label><label>Email<input name="email" type="email" placeholder="you@example.com" /></label><label>Tell us about your space<textarea name="message" rows="4" placeholder="Office, dining room or commercial project" /></label><button type="submit">Send Enquiry</button></form></section></SecondaryPage>;
}
