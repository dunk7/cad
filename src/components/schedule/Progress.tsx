"use client";

import { WIZARD_STEPS } from "@/lib/ordering/catalog";

/** Map wizard step index → progress indicator index (Review shares Payment). */
function progressIndex(step: number) {
  // 0–4: Categories → Schedule; 5+ (Review/checkout): Payment
  if (step <= 4) return step;
  return 5;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Progress({ step }: { step: number }) {
  const current = progressIndex(step);
  const total = WIZARD_STEPS.length;

  return (
    <nav aria-label="Order progress" className="mx-auto max-w-3xl">
      <ol className="flex w-full items-start pb-8">
        {WIZARD_STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          const segmentDone = i < current;

          return (
            <li
              key={label}
              className={`flex items-start ${i < total - 1 ? "flex-1" : ""}`}
            >
              <div className="relative flex shrink-0 flex-col items-center">
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition duration-300 sm:h-10 sm:w-10 sm:text-sm ${
                    done
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : active
                        ? "border-emerald-600 bg-white text-emerald-700 ring-4 ring-emerald-600/15"
                        : "border-black/15 bg-white text-muted"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <CheckIcon /> : i + 1}
                </span>
                <span
                  className={`pointer-events-none absolute top-[calc(100%+0.5rem)] left-1/2 w-max max-w-[4.75rem] -translate-x-1/2 text-center text-[10px] leading-tight sm:max-w-none sm:text-[11px] sm:uppercase sm:tracking-[0.1em] ${
                    active
                      ? "font-semibold text-foreground"
                      : done
                        ? "font-medium text-emerald-800/75"
                        : "text-muted"
                  }`}
                >
                  {label}
                </span>
              </div>

              {i < total - 1 && (
                <span
                  className={`mt-4 h-0.5 min-w-[0.5rem] flex-1 self-start rounded-full transition-colors duration-500 sm:mt-5 ${
                    segmentDone ? "bg-emerald-600" : "bg-black/10"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-2 text-center text-xs text-muted sm:hidden">
        Step {current + 1} of {total}: {WIZARD_STEPS[current]}
      </p>
    </nav>
  );
}
