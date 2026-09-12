import Image from "next/image";
import SecondaryPage from "../components/SecondaryPage";
import officeChair from "../../Public/Products/office chair.jpeg";
import premiumChair from "../../Public/Products/WhatsApp Image 2026-09-12 at 1.09.06 PMdfd.jpeg";
import executiveChair from "../../Public/Products/WhatsApp Image 2026-09-12 at 1.09.05 PMasd.jpeg";

export default function OfficeChairsPage() {
  return <SecondaryPage active="Office Chairs" eyebrow="WORK SMARTER, SIT BETTER" title="Office Chairs" description="Ergonomic seating designed to keep every workday comfortable, focused and refined." image={officeChair}><section className="route-content"><div className="route-heading"><p className="eyebrow">WORKSPACE ESSENTIALS</p><h2>Comfort that works as hard as you do.</h2></div><div className="route-card-grid"><article><Image src={officeChair} alt="Executive office chair" fill sizes="(max-width: 700px) 100vw, 33vw" /><span><strong>Executive Series</strong><small>Premium support for focused work</small></span></article><article><Image src={premiumChair} alt="Premium yellow office chair" fill sizes="(max-width: 700px) 100vw, 33vw" /><span><strong>Premium Series</strong><small>Designed for all-day comfort</small></span></article><article><Image src={executiveChair} alt="Modern office chair" fill sizes="(max-width: 700px) 100vw, 33vw" /><span><strong>Modern Series</strong><small>Style for every workspace</small></span></article></div></section></SecondaryPage>;
}
