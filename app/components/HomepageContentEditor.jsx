"use client";

import { useState } from "react";

const sections = [
  {
    id: "comfort",
    title: "Comfort in Every Detail",
    description: "Manage the inset craftsmanship image and the label displayed over it.",
    image: { field: "image", fallback: "/banner.jpeg", label: "Comfort detail image", ratio: 17 / 20, ratioLabel: "17:20", dimensions: "850 × 1000 px" },
    fields: [
      { key: "label", label: "Image label", multiline: true },
      { key: "pointOne", label: "Feature label one", multiline: true },
      { key: "pointTwo", label: "Feature label two", multiline: true },
      { key: "pointThree", label: "Feature label three", multiline: true },
      { key: "pointFour", label: "Feature label four", multiline: true },
    ],
  },
  {
    id: "details",
    title: "Details Make the Difference",
    description: "Manage the craftsmanship feature, its lead image, labels, and call to action.",
    image: { field: "image", fallback: "/Products/WhatsApp%20Image%202026-09-12%20at%201.09.07%20PMdfd.jpeg", label: "Craftsmanship image", ratio: 4 / 3, ratioLabel: "4:3", dimensions: "1600 × 1200 px" },
    fields: [
      { key: "title", label: "Heading — line one" },
      { key: "titleSecondLine", label: "Heading — line two" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  {
    id: "campaign",
    title: "Special Offer",
    description: "Manage the promotional banner, its message, badge, and quote destination.",
    image: { field: "image", fallback: "/upgrade%20your%20space.jpeg", label: "Offer banner image", ratio: 16 / 5, ratioLabel: "16:5", dimensions: "1600 × 500 px" },
    fields: [
      { key: "eyebrow", label: "Eyebrow label" },
      { key: "title", label: "Heading" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
];
const imageKitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, "");

function isImageKitImage(image) {
  return Boolean(imageKitEndpoint && typeof image === "string" && image.startsWith(imageKitEndpoint));
}

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    const source = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(source);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error("The selected file could not be read as an image."));
    };
    image.src = source;
  });
}

function imageWarning({ width, height }, spec) {
  const actualRatio = width / height;
  if (Math.abs(actualRatio - spec.ratio) / spec.ratio <= 0.06) return "";
  return `This image is ${width} × ${height} (${actualRatio.toFixed(2)}:1). The recommended ratio is ${spec.ratioLabel} (${spec.dimensions}); it may be cropped on the homepage.`;
}

export default function HomepageContentEditor({ content, onContentSaved, onSectionChange }) {
  const [busySection, setBusySection] = useState("");
  const [notice, setNotice] = useState("");
  const [warnings, setWarnings] = useState({});

  function updateField(section, field, value) {
    onSectionChange(section, { ...content[section], [field]: value });
  }

  async function readApiResponse(response) {
    const body = await response.text();
    if (!body) return { error: "The server returned an empty response." };
    try {
      return JSON.parse(body);
    } catch {
      return { error: "The server returned an invalid response." };
    }
  }

  async function saveSection(event, section) {
    event.preventDefault();
    setBusySection(section.id);
    setNotice("");

    try {
      const response = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: section.id, values: content[section.id] }) });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.error || "Unable to save this homepage section.");
      onContentSaved(section.id, result.content);
      setNotice(`${section.title} saved and published to the homepage.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save this homepage section.");
    } finally {
      setBusySection("");
    }
  }

  async function saveImage(section, image) {
    const response = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: section.id, values: { [section.image.field]: image } }) });
    const result = await readApiResponse(response);
    if (!response.ok) throw new Error(result.error || "Unable to save the image.");
    onContentSaved(section.id, result.content);
  }

  async function deleteManagedImage(image) {
    if (!isImageKitImage(image)) return;
    const response = await fetch("/api/admin/homepage-media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image }) });
    const result = await readApiResponse(response);
    if (!response.ok) {
      throw new Error(result.error || "Unable to delete the previous image.");
    }
  }

  async function uploadImage(section, file) {
    if (!file) return;
    setBusySection(section.id);
    setNotice("");

    try {
      const dimensions = await getImageDimensions(file);
      setWarnings((current) => ({ ...current, [section.id]: imageWarning(dimensions, section.image) }));

      const formData = new FormData();
      formData.set("file", file);
      const uploadResponse = await fetch("/api/admin/homepage-media", { method: "POST", body: formData });
      const uploadResult = await readApiResponse(uploadResponse);
      if (!uploadResponse.ok) throw new Error(uploadResult.error || "Unable to upload the image.");

      const previousImage = content[section.id][section.image.field];
      await saveImage(section, uploadResult.image);
      await deleteManagedImage(previousImage);
      setNotice(`${section.title} image updated and published to the homepage.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to upload the image.");
    } finally {
      setBusySection("");
    }
  }

  async function removeImage(section) {
    const previousImage = content[section.id][section.image.field];
    setBusySection(section.id);
    setNotice("");

    try {
      await saveImage(section, "");
      await deleteManagedImage(previousImage);
      setWarnings((current) => ({ ...current, [section.id]: "" }));
      setNotice(`Uploaded ${section.title.toLowerCase()} image removed. The original storefront image is active again.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to remove the image.");
    } finally {
      setBusySection("");
    }
  }

  return <><div className="admin-page-heading"><div><p className="admin-kicker">STOREFRONT CONTENT</p><h1>Homepage Content</h1><p>Manage the three visual content sections without changing their storefront layout.</p></div><a className="admin-site-link" href="/" target="_blank" rel="noreferrer">↗ Preview page</a></div>{notice && <p className="admin-message" role="status">{notice}</p>}<section className="admin-homepage-content-grid" aria-label="Homepage content management">{sections.map((section) => { const image = content[section.id][section.image.field] || section.image.fallback; const isUploadedImage = content[section.id][section.image.field]?.startsWith("/uploads/"); const isBusy = busySection === section.id; return <form className={`admin-homepage-content-card admin-homepage-content-card--${section.id}`} key={section.id} onSubmit={(event) => saveSection(event, section)}><header><p className="admin-kicker">HOMEPAGE SECTION</p><h2>{section.title}</h2><p>{section.description}</p></header><div className="admin-homepage-image-preview"><img src={image} alt={`${section.title} preview`} /></div><div className="admin-homepage-image-controls"><label className="admin-file-input">{isBusy ? "Working…" : isUploadedImage ? "Replace image" : "Upload image"}<input accept="image/jpeg,image/png,image/webp" disabled={isBusy} type="file" onChange={(event) => { uploadImage(section, event.target.files?.[0]); event.target.value = ""; }} /></label><p className="admin-image-spec"><strong>Recommended:</strong> {section.image.ratioLabel} · {section.image.dimensions}<br />JPG, PNG, or WEBP · maximum 5 MB</p>{warnings[section.id] && <p className="admin-image-warning" role="alert">{warnings[section.id]}</p>}{isUploadedImage && <button className="admin-delete-image" disabled={isBusy} type="button" onClick={() => removeImage(section)}>Delete uploaded image</button>}</div><div className={`admin-homepage-fields admin-homepage-fields--${section.id}`}>{section.fields.map((field) => <label key={field.key}>{field.label}{field.multiline ? <textarea rows="3" value={content[section.id][field.key]} onChange={(event) => updateField(section.id, field.key, event.target.value)} /> : <input required type={field.type || "text"} value={content[section.id][field.key]} onChange={(event) => updateField(section.id, field.key, event.target.value)} />}</label>)}</div><button className="admin-save-product" disabled={isBusy} type="submit">{isBusy ? "Saving…" : `Save ${section.title}`}</button></form>; })}</section></>;
}
