"use client";

import { useState } from "react";

const imageSpec = { ratio: 16 / 7, ratioLabel: "16:7", dimensions: "1920 × 840 px" };
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

function getRatioWarning({ width, height }) {
  const actualRatio = width / height;
  if (Math.abs(actualRatio - imageSpec.ratio) / imageSpec.ratio <= 0.06) return "";
  return `This image is ${width} × ${height} (${actualRatio.toFixed(2)}:1). The recommended ratio is ${imageSpec.ratioLabel} (${imageSpec.dimensions}); it may be cropped in the About-page banner.`;
}

export default function AboutPageEditor({ about, onSaved, onSectionChange }) {
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const image = about.image || "/banner.jpeg";
  const isUploadedImage = isImageKitImage(about.image);

  function updateField(field, value) {
    onSectionChange({ ...about, [field]: value });
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

  async function saveAbout(values) {
    const response = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "about", values }) });
    const result = await readApiResponse(response);
    if (!response.ok) throw new Error(result.error || "Unable to save the About page.");
    onSaved(result.content);
    return result.content;
  }

  async function deleteManagedImage(value) {
    if (!isImageKitImage(value)) return;
    const response = await fetch("/api/admin/homepage-media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: value }) });
    const result = await readApiResponse(response);
    if (!response.ok) {
      throw new Error(result.error || "Unable to delete the previous image.");
    }
  }

  async function uploadImage(file) {
    if (!file) return;
    setIsBusy(true);
    setMessage("");

    try {
      setWarning(getRatioWarning(await getImageDimensions(file)));
      const formData = new FormData();
      formData.set("file", file);
      const uploadResponse = await fetch("/api/admin/homepage-media", { method: "POST", body: formData });
      const uploadResult = await readApiResponse(uploadResponse);
      if (!uploadResponse.ok) throw new Error(uploadResult.error || "Unable to upload the image.");
      const previousImage = about.image;
      await saveAbout({ ...about, image: uploadResult.image });
      await deleteManagedImage(previousImage);
      setMessage("About-page banner image updated and published.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload the image.");
    } finally {
      setIsBusy(false);
    }
  }

  async function removeImage() {
    setIsBusy(true);
    setMessage("");

    try {
      const previousImage = about.image;
      await saveAbout({ ...about, image: "" });
      await deleteManagedImage(previousImage);
      setWarning("");
      setMessage("Uploaded About-page banner removed. The original banner is active again.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to remove the image.");
    } finally {
      setIsBusy(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setIsBusy(true);
    setMessage("");

    try {
      await saveAbout(about);
      setMessage("About page changes saved and published.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save the About page.");
    } finally {
      setIsBusy(false);
    }
  }

  return <><div className="admin-page-heading"><div><p className="admin-kicker">STOREFRONT CONTENT</p><h1>About Page</h1><p>Edit the About-page banner and every visible message without changing the page design.</p></div><a className="admin-site-link" href="/about" rel="noreferrer" target="_blank">Preview page</a></div>{message && <p className="admin-message" role="status">{message}</p>}<form className="admin-about-form" onSubmit={submit}><section className="admin-about-card admin-about-card--image"><header><p className="admin-kicker">HERO BANNER</p><h2>About-page image</h2><p>Use a wide image with a calm focal area so the text remains readable over the banner.</p></header><img alt="About page banner preview" src={image} /><div className="admin-about-image-controls"><label className="admin-file-input">{isBusy ? "Working…" : isUploadedImage ? "Replace banner image" : "Upload banner image"}<input accept="image/jpeg,image/png,image/webp" disabled={isBusy} onChange={(event) => { uploadImage(event.target.files?.[0]); event.target.value = ""; }} type="file" /></label><p className="admin-image-spec"><strong>Recommended:</strong> {imageSpec.ratioLabel} · {imageSpec.dimensions}<br />JPG, PNG, or WEBP · maximum 5 MB</p>{warning && <p className="admin-image-warning" role="alert">{warning}</p>}{isUploadedImage && <button className="admin-delete-image" disabled={isBusy} onClick={removeImage} type="button">Delete uploaded image</button>}</div></section><section className="admin-about-card"><header><p className="admin-kicker">HERO COPY</p><h2>Introduction</h2><p>Controls the eyebrow, heading, description, and call to action on the About-page banner.</p></header><div className="admin-about-fields"><label>Eyebrow<input disabled={isBusy} onChange={(event) => updateField("eyebrow", event.target.value)} value={about.eyebrow} /></label><label>Main heading<input disabled={isBusy} onChange={(event) => updateField("title", event.target.value)} value={about.title} /></label><label>Description<textarea disabled={isBusy} onChange={(event) => updateField("description", event.target.value)} rows="5" value={about.description} /></label><label>CTA text<input disabled={isBusy} onChange={(event) => updateField("ctaText", event.target.value)} value={about.ctaText} /></label></div></section><section className="admin-about-card admin-about-card--promise"><header><p className="admin-kicker">OUR PROMISE</p><h2>Promise & features</h2><p>Manage the supporting message and the three numbered values displayed below it.</p></header><div className="admin-about-fields"><label>Section eyebrow<input disabled={isBusy} onChange={(event) => updateField("promiseEyebrow", event.target.value)} value={about.promiseEyebrow} /></label><label>Promise heading<input disabled={isBusy} onChange={(event) => updateField("promiseTitle", event.target.value)} value={about.promiseTitle} /></label><label>Promise description<textarea disabled={isBusy} onChange={(event) => updateField("promiseDescription", event.target.value)} rows="5" value={about.promiseDescription} /></label><div className="admin-about-features"><label>01 feature<input disabled={isBusy} onChange={(event) => updateField("promiseOne", event.target.value)} value={about.promiseOne} /></label><label>02 feature<input disabled={isBusy} onChange={(event) => updateField("promiseTwo", event.target.value)} value={about.promiseTwo} /></label><label>03 feature<input disabled={isBusy} onChange={(event) => updateField("promiseThree", event.target.value)} value={about.promiseThree} /></label></div></div></section><div className="admin-about-save"><p>Text changes are published when you save. Image changes publish immediately after upload.</p><button className="admin-save-product" disabled={isBusy} type="submit">{isBusy ? "Saving…" : "Save changes"}</button></div></form></>;
}
