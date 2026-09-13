"use client";

import Image from "next/image";
import { useRef } from "react";

export default function ProductImageZoom({ image, alt }) {
  const frameRef = useRef(null);

  function updateFocus(event) {
    const frame = frameRef.current;
    if (!frame) return;

    const bounds = frame.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100));

    frame.style.setProperty("--product-image-focus", `${x}% ${y}%`);
    frame.classList.add("is-zooming");
  }

  function resetFocus() {
    const frame = frameRef.current;
    if (!frame) return;

    frame.style.setProperty("--product-image-focus", "50% 50%");
    frame.classList.remove("is-zooming");
  }

  return <div className="product-detail-image" ref={frameRef} onPointerMove={updateFocus} onPointerLeave={resetFocus} onPointerUp={resetFocus} onPointerCancel={resetFocus}><Image src={image} alt={alt} fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div>;
}
