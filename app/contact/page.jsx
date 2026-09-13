import contactHero from "../../Public/Products/office chair.jpeg";
import SecondaryPage from "../components/SecondaryPage";
import { getSiteContent } from "../../actions/site-content";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { settings } = await getSiteContent();

  return <SecondaryPage active="Contact" eyebrow="WE WOULD LOVE TO HELP" title="Let’s Find Your Perfect Chair" description="Tell us about your space and our team will help you choose seating that fits beautifully." image={contactHero}><section className="route-content contact-layout"><div><p className="eyebrow">CONTACT {settings.storeName.toUpperCase()}</p><h2>Start a conversation.</h2><p>For homes, offices, restaurants and commercial spaces, we are here to help create a more comfortable place to sit.</p><a className="contact-email" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></div><form className="contact-form"><label>Name<input name="name" type="text" placeholder="Your name" /></label><label>Email<input name="email" type="email" placeholder="you@example.com" /></label><label>Tell us about your space<textarea name="message" rows="4" placeholder="Office, dining room or commercial project" /></label><button type="submit">Send Enquiry</button></form></section></SecondaryPage>;
}
