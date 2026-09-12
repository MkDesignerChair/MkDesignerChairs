import Image from "next/image";
import SecondaryPage from "../components/SecondaryPage";
import collectionHero from "../../Public/upgrade your space.jpeg";
import officeChair from "../../Public/Products/office chair.jpeg";
import diningChair from "../../Public/Dinning Chair.jpeg";

export default function CollectionsPage() {
  return <SecondaryPage active="Collections" eyebrow="SEATING FOR EVERY SPACE" title="Our Collections" description="Explore premium chair collections shaped around your office, dining room and lifestyle." image={collectionHero}><section className="route-content"><div className="route-heading"><p className="eyebrow">CHOOSE YOUR STYLE</p><h2>Thoughtfully designed for every room.</h2></div><div className="route-card-grid"><article><Image src={officeChair} alt="Office chair collection" fill sizes="(max-width: 700px) 100vw, 33vw" /><span><strong>Office Collection</strong><small>Purposeful comfort for work</small></span></article><article><Image src={diningChair} alt="Dining chair collection" fill sizes="(max-width: 700px) 100vw, 33vw" /><span><strong>Dining Collection</strong><small>Warmth around every table</small></span></article><article><Image src={collectionHero} alt="Premium chair collection" fill sizes="(max-width: 700px) 100vw, 33vw" /><span><strong>Signature Collection</strong><small>Distinctive style for your home</small></span></article></div></section></SecondaryPage>;
}
