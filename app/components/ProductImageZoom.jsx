"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const IMAGE_ZOOM_SCALE = 1.65;

function getImageSource(image) {
  return typeof image === "string" ? image : image.src;
}

export default function ProductImageZoom({ images, alt }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageContainer = useRef(null);
  const pointerStart = useRef(null);
  const didSwipe = useRef(false);
  const didPan = useRef(false);
  const panStart = useRef(null);
  const panPosition = useRef({ x: 0, y: 0 });
  const currentImage = images[activeIndex];
  const hasMultipleImages = images.length > 1;

  function showImage(index) {
    setActiveIndex((index + images.length) % images.length);
    setIsZoomed(false);
    resetPan();
  }

  function startSwipe(event) {
    pointerStart.current = event.clientX;
    didSwipe.current = false;
    didPan.current = false;

    if (isZoomed && event.pointerType === "touch") {
      panStart.current = { panX: panPosition.current.x, panY: panPosition.current.y, pointerX: event.clientX, pointerY: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function finishSwipe(event) {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;

    if (isZoomed) {
      panStart.current = null;
      return;
    }

    if (Math.abs(distance) < 40 || !hasMultipleImages) return;
    didSwipe.current = true;
    showImage(activeIndex + (distance < 0 ? 1 : -1));
  }

  function resetPan() {
    panPosition.current = { x: 0, y: 0 };
    imageContainer.current?.style.setProperty("--zoom-pan-x", "0px");
    imageContainer.current?.style.setProperty("--zoom-pan-y", "0px");
  }

  function toggleZoom() {
    if (didSwipe.current || didPan.current) {
      didSwipe.current = false;
      didPan.current = false;
      return;
    }

    resetPan();
    setIsZoomed((current) => !current);
  }

  function updateZoomOrigin(event) {
    const bounds = event.currentTarget.getBoundingClientRect();

    if (event.pointerType === "mouse") {
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;

      event.currentTarget.style.setProperty("--zoom-x", `${x}%`);
      event.currentTarget.style.setProperty("--zoom-y", `${y}%`);
      return;
    }

    if (!isZoomed || event.pointerType !== "touch" || !panStart.current) return;
    const maxX = (bounds.width * (IMAGE_ZOOM_SCALE - 1)) / 2;
    const maxY = (bounds.height * (IMAGE_ZOOM_SCALE - 1)) / 2;
    const nextX = Math.max(-maxX, Math.min(maxX, panStart.current.panX + event.clientX - panStart.current.pointerX));
    const nextY = Math.max(-maxY, Math.min(maxY, panStart.current.panY + event.clientY - panStart.current.pointerY));

    if (Math.abs(nextX - panPosition.current.x) > 2 || Math.abs(nextY - panPosition.current.y) > 2) didPan.current = true;
    panPosition.current = { x: nextX, y: nextY };
    event.currentTarget.style.setProperty("--zoom-pan-x", `${nextX}px`);
    event.currentTarget.style.setProperty("--zoom-pan-y", `${nextY}px`);
  }

  function handleImageKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleZoom();
    }

    if (event.key === "Escape") {
      resetPan();
      setIsZoomed(false);
    }
  }

  return <div className="product-gallery"><div aria-label={`${isZoomed ? "Zoomed" : "Zoomable"} product image. Tap or click to ${isZoomed ? "zoom out" : "zoom in"}.`} aria-pressed={isZoomed} className={`product-detail-image${isZoomed ? " is-zoomed" : ""}`} onClick={toggleZoom} onKeyDown={handleImageKeyDown} onPointerDown={startSwipe} onPointerMove={updateZoomOrigin} onPointerUp={finishSwipe} onPointerCancel={() => { pointerStart.current = null; panStart.current = null; }} ref={imageContainer} role="button" tabIndex="0"><Image key={getImageSource(currentImage)} src={currentImage} alt={`${alt} — image ${activeIndex + 1}`} fill priority sizes="(max-width: 760px) calc(100vw - 36px), 50vw" />{hasMultipleImages && <span className="product-gallery-count">{activeIndex + 1} / {images.length}</span>}</div>{hasMultipleImages && <div className="product-gallery-thumbnails" aria-label="Product images">{images.map((image, index) => <button aria-label={`Show image ${index + 1}`} className={index === activeIndex ? "is-active" : ""} key={getImageSource(image)} type="button" onClick={() => showImage(index)}><Image src={image} alt="" fill sizes="72px" /></button>)}</div>}</div>;
}
