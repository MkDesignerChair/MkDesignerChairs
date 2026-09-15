"use client";

import Image from "next/image";
import { useRef, useState } from "react";

function getImageSource(image) {
  return typeof image === "string" ? image : image.src;
}

export default function ProductImageZoom({ images, alt }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef(null);
  const currentImage = images[activeIndex];
  const hasMultipleImages = images.length > 1;

  function showImage(index) {
    setActiveIndex((index + images.length) % images.length);
  }

  function startSwipe(event) {
    pointerStart.current = event.clientX;
  }

  function finishSwipe(event) {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) < 40 || !hasMultipleImages) return;
    showImage(activeIndex + (distance < 0 ? 1 : -1));
  }

  return <div className="product-gallery"><div className="product-detail-image" onPointerDown={startSwipe} onPointerUp={finishSwipe} onPointerCancel={() => { pointerStart.current = null; }}><Image key={getImageSource(currentImage)} src={currentImage} alt={`${alt} — image ${activeIndex + 1}`} fill priority sizes="(max-width: 760px) calc(100vw - 36px), 50vw" />{hasMultipleImages && <><button aria-label="Show previous product image" className="product-gallery-control product-gallery-previous" type="button" onClick={() => showImage(activeIndex - 1)}>‹</button><button aria-label="Show next product image" className="product-gallery-control product-gallery-next" type="button" onClick={() => showImage(activeIndex + 1)}>›</button><span className="product-gallery-count">{activeIndex + 1} / {images.length}</span></>}</div>{hasMultipleImages && <div className="product-gallery-thumbnails" aria-label="Product images">{images.map((image, index) => <button aria-label={`Show image ${index + 1}`} className={index === activeIndex ? "is-active" : ""} key={getImageSource(image)} type="button" onClick={() => showImage(index)}><Image src={image} alt="" fill sizes="72px" /></button>)}</div>}</div>;
}
