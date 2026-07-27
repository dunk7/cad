"use client";

import { reviewsSummary, testimonials } from "@/content/home";
import { useEffect, useState } from "react";

export default function Reviews() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const current = testimonials[index];

  return (
    <section className="bg-band px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {reviewsSummary.heading}
        </h2>

        <div className="mt-8 flex flex-col gap-4 rounded-lg bg-band-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="font-medium">{reviewsSummary.businessName}</p>
            <div className="mt-1 flex items-center gap-2 text-star" aria-label="5 star rating">
              {"★★★★★".split("").map((s, i) => (
                <span key={i}>{s}</span>
              ))}
              <span className="text-sm text-white/80">
                {reviewsSummary.rating}
              </span>
            </div>
            <a
              href={reviewsSummary.googleUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm text-white/80 underline hover:text-white"
            >
              {reviewsSummary.reviewCount} reviews on Google
            </a>
          </div>
          <a
            href={reviewsSummary.writeReviewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Write a Review
          </a>
        </div>

        <div className="mt-8 min-h-[140px] text-center">
          <p className="text-lg leading-relaxed text-white/95 sm:text-xl">
            <span className="text-star">★★★★★</span> “{current.quote}”
          </p>
          <p className="mt-4 text-sm text-white/65">
            — {[current.author, current.detail, current.date]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show review ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full ${
                  i === index ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
