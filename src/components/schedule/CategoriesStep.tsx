"use client";

import Image from "next/image";
import { CATEGORIES } from "@/lib/ordering/catalog";
import { useOrder } from "@/lib/ordering/OrderContext";

export default function CategoriesStep() {
  const { draft, toggleCategory, setStep } = useOrder();
  const selectedCount = draft.categories.length;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
          Schedule Now
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          What are we transporting?
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-[15px]">
          Select all that apply. We’ll ask for details next.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const selected = draft.categories.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleCategory(cat.id)}
              className={`group relative aspect-[4/3] overflow-hidden text-left outline-none transition duration-300 ${
                selected
                  ? "shadow-[0_0_0_2px_#111]"
                  : "shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.28)]"
              }`}
            >
              <Image
                src={cat.image}
                alt=""
                fill
                priority
                className={`object-cover transition duration-500 ease-out group-hover:scale-[1.04] ${
                  selected ? "scale-[1.02]" : ""
                }`}
                sizes="(min-width: 640px) 40vw, 100vw"
              />

              <div
                className={`absolute inset-0 transition duration-300 ${
                  selected
                    ? "bg-gradient-to-t from-black/85 via-black/35 to-black/15"
                    : "bg-gradient-to-t from-black/75 via-black/25 to-black/5 group-hover:from-black/80"
                }`}
              />

              <div
                className={`absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full transition duration-200 ${
                  selected
                    ? "bg-white text-black"
                    : "border border-white/50 bg-white/10 text-transparent backdrop-blur-[2px] group-hover:border-white/80"
                }`}
                aria-hidden
              >
                <svg
                  viewBox="0 0 16 16"
                  className={`h-3.5 w-3.5 ${selected ? "opacity-100" : "opacity-0"}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M3.5 8.5 6.5 11.5 12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <span className="block text-[15px] font-medium tracking-tight text-white sm:text-lg">
                  {cat.name}
                </span>
                <span
                  className={`mt-1 block text-[11px] uppercase tracking-[0.18em] transition duration-200 ${
                    selected ? "text-white/80" : "text-transparent"
                  }`}
                >
                  Selected
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col-reverse items-stretch gap-4 border-t border-black/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-center text-sm sm:text-left ${
            selectedCount ? "text-foreground" : "text-muted"
          }`}
        >
          {selectedCount === 0
            ? "Select one or more categories"
            : `${selectedCount} selected`}
        </p>
        <button
          type="button"
          disabled={!selectedCount}
          onClick={() => setStep(1)}
          className="inline-flex items-center justify-center bg-black px-10 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
