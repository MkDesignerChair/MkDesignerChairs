import SecondaryPage from "../components/SecondaryPage";
import aboutHero from "../../Public/banner.jpeg";

export default function AboutPage() {
  return <SecondaryPage active="About" eyebrow="THE MK DESIGNER CHAIRS STORY" title="Comfort Meets Class" description="We combine timeless design, premium materials and thoughtful ergonomics to create chairs you will love to live with." image={aboutHero}><section className="route-content story-grid"><div><p className="eyebrow">OUR PROMISE</p><h2>Designed around the way you live.</h2><p>Every MK Designer Chair is selected with a simple goal: offer exceptional comfort without compromising on character, craftsmanship or durability.</p></div><div className="story-values"><span>01<small>Premium materials</small></span><span>02<small>Thoughtful ergonomics</small></span><span>03<small>Modern craftsmanship</small></span></div></section></SecondaryPage>;
}
