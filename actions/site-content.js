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
  spaces: {
    title: "Designed for",
    titleSecondLine: "Every Space",
    description: "From modern offices to luxurious dining rooms, our chairs blend comfort with contemporary design to elevate your environment.",
    buttonText: "Explore Spaces",
    cardActionLabel: "View more",
    image: "",
  },
  comfort: {
    label: "COMFORT\nIN EVERY DETAIL",
    image: "",
    pointOne: "Premium\nQuality Materials",
    pointTwo: "Expert\nCraftsmanship",
    pointThree: "Stylish &\nModern Designs",
    pointFour: "Comfort for\nLong Hours",
  },
  details: {
    title: "Details Make",
    titleSecondLine: "the Difference",
    description: "Premium fabrics, fine stitching and ergonomic design come together to create chairs that stand out.",
    buttonText: "Get a Quote",
    image: "",
  },
  campaign: {
    eyebrow: "SPECIAL OFFER",
    title: "Upgrade Your Space",
    description: "Get premium chairs for your office, dining area or commercial space at the best prices.",
    buttonText: "Get a Quote",
    email: "sales@example.com",
    image: "",
  },
  about: {
    eyebrow: "THE MK DESIGNER CHAIRS STORY",
    title: "Comfort Meets Class",
    description: "We combine timeless design, premium materials and thoughtful ergonomics to create chairs you will love to live with.",
    ctaText: "Request a Quote",
    image: "",
    promiseEyebrow: "OUR PROMISE",
    promiseTitle: "Designed around the way you live.",
    promiseDescription: "Every MK Designer Chair is selected with a simple goal: offer exceptional comfort without compromising on character, craftsmanship or durability.",
    promiseOne: "Premium materials",
    promiseTwo: "Thoughtful ergonomics",
    promiseThree: "Modern craftsmanship",
  },
  settings: {
    storeName: "MK Designer Chairs",
    contactEmail: "mkdesignerchair@gmail.com",
    supportEmail: "mkdesignerchair@gmail.com",
    phone: "7620503029",
    location: "Ulhasnagar, Maharashtra",
    businessHours: "Mon–Sat, 10:00 AM–7:00 PM",
    currency: "INR (₹)",
    timezone: "Asia/Kolkata (IST)",
    orderPrefix: "MK",
    legalBusinessName: "MK Designer Chairs",
    gstin: "",
    businessAddress: "Renuka Society, Gali No. 2, O.T. Section, Ulhasnagar, Maharashtra",
    businessPinCode: "421002",
    websiteUrl: "",
    shippingCharge: 99,
    freeShippingThreshold: 1999,
    codEnabled: true,
    deliveryRegions: "India (serviceable pincodes)",
    estimatedDeliveryTime: "3–7 business days",
    razorpayConnection: "Not configured",
    paymentMode: "Test mode",
    paymentWebhookStatus: "Not configured",
    orderWorkflow: "Standard fulfillment",
    cancellationWindowDays: 24,
    returnWindowDays: 7,
    refundConfiguration: "Original payment method",
    invoicePrefix: "MK-INV",
    invoiceStartNumber: 1001,
    guestCheckout: true,
    registrationEnabled: true,
    emailVerification: true,
    orderNotifications: true,
    enquiryNotifications: true,
    reviewNotifications: true,
    deliveryNotifications: true,
    storeOpen: true,
    maintenanceMode: false,
    announcementEnabled: false,
    announcementBar: "",
  },
};

export async function getSiteContent() {
  const overrides = JSON.parse(await readFile(filePath, "utf8"));
  return Object.fromEntries(Object.entries(defaultSiteContent).map(([section, values]) => [section, { ...values, ...(overrides[section] || {}) }]));
}

function validateSettings(values) {
  const defaults = defaultSiteContent.settings;
  const next = {};
  const stringFields = Object.entries(defaults).filter(([, value]) => typeof value === "string").map(([key]) => key);
  const numberFields = Object.entries(defaults).filter(([, value]) => typeof value === "number").map(([key]) => key);
  const booleanFields = Object.entries(defaults).filter(([, value]) => typeof value === "boolean").map(([key]) => key);

  for (const [key, value] of Object.entries(values)) {
    if (stringFields.includes(key)) {
      if (typeof value !== "string") throw new Error(`Invalid ${key}.`);
      const trimmed = value.trim();
      if (trimmed.length > 500) throw new Error(`${key} is too long.`);
      next[key] = trimmed;
    }
    if (numberFields.includes(key)) {
      const number = Number(value);
      if (!Number.isFinite(number) || number < 0 || number > 10000000) throw new Error(`Invalid ${key}.`);
      next[key] = number;
    }
    if (booleanFields.includes(key)) {
      if (typeof value !== "boolean") throw new Error(`Invalid ${key}.`);
      next[key] = value;
    }
  }

  if (next.contactEmail && !/^\S+@\S+\.\S+$/.test(next.contactEmail)) throw new Error("Enter a valid public contact email.");
  if (next.supportEmail && !/^\S+@\S+\.\S+$/.test(next.supportEmail)) throw new Error("Enter a valid support email.");
  if (next.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]Z[A-Z\d]$/.test(next.gstin.toUpperCase())) throw new Error("Enter a valid 15-character GSTIN.");
  if (next.businessPinCode && !/^\d{6}$/.test(next.businessPinCode)) throw new Error("Enter a valid 6-digit PIN code.");
  if (next.websiteUrl && !/^https?:\/\/\S+$/i.test(next.websiteUrl)) throw new Error("Website URL must start with http:// or https://.");
  if (next.orderPrefix && !/^[A-Z0-9-]{1,12}$/.test(next.orderPrefix)) throw new Error("Order prefix can only contain uppercase letters, numbers, and hyphens.");
  if (next.invoicePrefix && !/^[A-Z0-9-]{1,18}$/.test(next.invoicePrefix)) throw new Error("Invoice prefix can only contain uppercase letters, numbers, and hyphens.");
  return next;
}

export async function updateSiteContent(section, values) {
  if (!(section in defaultSiteContent) || !values || typeof values !== "object") throw new Error("Invalid content section.");
  const current = JSON.parse(await readFile(filePath, "utf8"));
  const permitted = Object.keys(defaultSiteContent[section]);
  const nextValues = section === "settings" ? validateSettings(values) : Object.fromEntries(Object.entries(values).filter(([key, value]) => permitted.includes(key) && typeof value === "string").map(([key, value]) => [key, value.trim()]));
  const next = { ...current, [section]: { ...(current[section] || {}), ...nextValues } };
  await writeFile(`${filePath}.tmp`, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await rename(`${filePath}.tmp`, filePath);
  return { ...defaultSiteContent[section], ...next[section] };
}
