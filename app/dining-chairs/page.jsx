import Image from "next/image";
import SecondaryPage from "../components/SecondaryPage";
import diningRoom from "../../Public/Dinning Chair.jpeg";
import blueDiningChair from "../../Public/Products/WhatsApp Image 2026-09-12 at 1.09.07 PMdfd.jpeg";
import diningScene from "../../Public/upgrade your space.jpeg";

export default function DiningChairsPage() {
  return <SecondaryPage active="Dining Chairs" eyebrow="GATHER IN COMFORT" title="Dining Chairs" description="Beautifully crafted dining seating that turns everyday meals into memorable moments." image={diningRoom}><section className="route-content"><div className="route-heading"><p className="eyebrow">DINING COLLECTION</p><h2>Made for long conversations and good company.</h2></div><div className="route-card-grid"><article><Image src={blueDiningChair} alt="Blue upholstered dining chair" fill sizes="(max-width: 700px) 100vw, 33vw" /><span><strong>Velvet Dining</strong><small>Luxury texture, lasting comfort</small></span></article><article><Image src={diningRoom} alt="Premium dining chair" fill sizes="(max-width: 700px) 100vw, 33vw" /><span><strong>Signature Dining</strong><small>Elegant seating for your table</small></span></article><article><Image src={diningScene} alt="Dining space" fill sizes="(max-width: 700px) 100vw, 33vw" /><span><strong>Complete Spaces</strong><small>Designed to belong together</small></span></article></div></section></SecondaryPage>;
}
