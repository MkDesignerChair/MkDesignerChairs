import contactHero from "../../Public/Products/office chair.jpeg";
import SecondaryPage from "../components/SecondaryPage";
import ContactForm from "../components/ContactForm";
import { getSiteContent } from "../../actions/site-content";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { settings } = await getSiteContent();

  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Renuka+Society,+Gali+No.+2,+O.T.+Section,+Ulhasnagar+03,+Ulhasnagar,+Maharashtra+421002";

  return <SecondaryPage active="Contact" eyebrow="WE WOULD LOVE TO HELP" title="Let’s Find Your Perfect Chair" description="Tell us about your space and our team will help you choose seating that fits beautifully." image={contactHero} quoteHref="https://wa.me/917620503029?text=Hi%2C%20I%20would%20like%20to%20know%20about%20chairs."><main className="route-content contact-page"><section className="contact-layout"><article className="contact-location"><span className="contact-card-icon" aria-hidden="true">⌖</span><p className="eyebrow">VISIT OUR SHOWROOM</p><h2>Find us in Ulhasnagar.</h2><address className="contact-address">Renuka Society, Gali No. 2, O.T. Section<br />Ulhasnagar 03, Ulhasnagar<br />PO: Ulhasnagar-2 · Dist: Thane<br />Maharashtra – 421002</address><div className="contact-details"><a href={`mailto:${settings.contactEmail}`}><small>Email us</small><strong>{settings.contactEmail}</strong></a><a href={`tel:${settings.phone.replace(/\s/g, "")}`}><small>Call us</small><strong>{settings.phone}</strong></a></div><a className="contact-directions" href={directionsUrl} rel="noreferrer" target="_blank">Open in Google Maps</a></article><ContactForm /><section className="contact-map" aria-label="Store location map"><div className="contact-map-heading"><div><p className="eyebrow">OUR LOCATION</p><h2>Come say hello.</h2></div><a href={directionsUrl} rel="noreferrer" target="_blank">Directions ↗</a></div><iframe title="MK Designer Chairs location in Ulhasnagar" src="https://www.google.com/maps?q=Renuka+Society,+Gali+No.+2,+O.T.+Section,+Ulhasnagar+03,+Ulhasnagar,+Maharashtra+421002&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></section></section></main></SecondaryPage>;
}
