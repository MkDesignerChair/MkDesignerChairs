import aboutHero from "../../Public/banner.jpeg";
import SecondaryPage from "../components/SecondaryPage";
import { getSiteContent } from "../../actions/site-content";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const { about } = await getSiteContent();

  return <SecondaryPage active="About" eyebrow={about.eyebrow} title={about.title} description={about.description} image={aboutHero}><section className="route-content story-grid"><div><p className="eyebrow">OUR PROMISE</p><h2>{about.promiseTitle}</h2><p>{about.promiseDescription}</p></div><div className="story-values"><span>01<small>Premium materials</small></span><span>02<small>Thoughtful ergonomics</small></span><span>03<small>Modern craftsmanship</small></span></div></section></SecondaryPage>;
}
