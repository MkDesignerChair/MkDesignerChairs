import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const filePath = join(process.cwd(), "data", "site-content.json");

export const defaultSiteContent = {
  hero: {
    eyebrow: "PREMIUM CHAIRS FOR A BETTER TOMORROW",
    title: "SIT IN STYLE",
    accent: "LIVE BETTER",
    description: "Elegant. Ergonomic. Exceptional. MK Designer Chairs bring comfort and class to every space.",
    buttonText: "Explore Collection",
    heroImage: "/banner.jpeg",
    officeCollectionImage: "/Products/office%20chair.jpeg",
    diningCollectionImage: "/Dinning%20Chair.jpeg",
    officeCollectionDescription: "Work Smarter / Sit Better",
    diningCollectionDescription: "Where Comfort Meets Togetherness",
  },
  campaign: { eyebrow: "SPECIAL OFFER", title: "Upgrade Your Space", description: "Get premium chairs for your office, dining area or commercial space at the best prices.", buttonText: "Get a Quote", email: "sales@example.com" },
  about: { eyebrow: "THE MK DESIGNER CHAIRS STORY", title: "Comfort Meets Class", description: "We combine timeless design, premium materials and thoughtful ergonomics to create chairs you will love to live with.", promiseTitle: "Designed around the way you live.", promiseDescription: "Every MK Designer Chair is selected with a simple goal: offer exceptional comfort without compromising on character, craftsmanship or durability." },
  settings: { storeName: "MK Designer Chairs", contactEmail: "mkdesignerchair@gmail.com", phone: "7620503029", location: "Thane, Maharashtra" },
};

export async function getSiteContent() {
  const overrides = JSON.parse(await readFile(filePath, "utf8"));
  return Object.fromEntries(Object.entries(defaultSiteContent).map(([section, values]) => [section, { ...values, ...(overrides[section] || {}) }]));
}

export async function updateSiteContent(section, values) {
  if (!(section in defaultSiteContent) || !values || typeof values !== "object") throw new Error("Invalid content section.");
  const current = JSON.parse(await readFile(filePath, "utf8"));
  const permitted = Object.keys(defaultSiteContent[section]);
  const nextValues = Object.fromEntries(Object.entries(values).filter(([key, value]) => permitted.includes(key) && typeof value === "string").map(([key, value]) => [key, value.trim()]));
  const next = { ...current, [section]: { ...(current[section] || {}), ...nextValues } };
  await writeFile(`${filePath}.tmp`, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await rename(`${filePath}.tmp`, filePath);
  return { ...defaultSiteContent[section], ...next[section] };
}
