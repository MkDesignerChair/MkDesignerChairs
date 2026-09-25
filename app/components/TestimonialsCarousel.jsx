"use client";

import { useEffect, useMemo, useState } from "react";

const REVIEW_INTERVAL_MS = 3000;

function initialsFor(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "C";
}

function TestimonialCard({ review }) {
  const rating = Math.min(5, Math.max(1, Number(review.rating) || 5));

  return <article className="testimonial-card"><span className="quote-mark">“</span><p>{review.reviewText}</p><span className="stars" aria-label={`${rating} out of 5 stars`}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span><div className="customer"><span className="avatar">{initialsFor(review.customerName)}</span><span><strong>{review.customerName}</strong><small>{review.customerRole}</small></span></div></article>;
}

export default function TestimonialsCarousel({ reviews }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayReviews = useMemo(() => {
    if (!reviews?.length) return [];
    return Array.from({ length: Math.max(3, reviews.length) }, (_, index) => reviews[index % reviews.length]);
  }, [reviews]);
  const carouselReviews = [...displayReviews, ...displayReviews];
  const animationStyle = {
    "--testimonial-duration": `${displayReviews.length * (REVIEW_INTERVAL_MS / 1000)}s`,
    "--testimonial-desktop-end": `calc(-${(displayReviews.length * 100) / 3}% - ${displayReviews.length * 8}px)`,
    "--testimonial-mobile-end": `-${displayReviews.length * 100}%`,
  };

  useEffect(() => {
    if (displayReviews.length === 0) return undefined;
    setActiveIndex(0);
    const interval = window.setInterval(() => setActiveIndex((current) => (current + 1) % displayReviews.length), REVIEW_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [displayReviews.length]);

  if (displayReviews.length === 0) return null;

  return <section className="testimonials section-shell" aria-labelledby="testimonial-title"><p className="eyebrow">TESTIMONIALS</p><h2 id="testimonial-title">What Our Customers Say</h2><div className="testimonial-carousel-viewport"><div className="testimonial-grid testimonial-grid--rotating" style={animationStyle}>{carouselReviews.map((review, index) => <TestimonialCard key={`${review.id}-${index}`} review={review} />)}</div></div><div className="testimonial-dots" aria-label="Current testimonial">{displayReviews.map((review, index) => <span className={activeIndex === index ? "active" : ""} key={`${review.id}-${index}`} />)}</div></section>;
}
