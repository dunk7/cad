"use client";

import { WIZARD_STEPS } from "@/lib/ordering/catalog";

/** Wizard: 0 Items, 1 Pickup, 2 Delivery, 3 Review/Payment */
function progressIndex(step: number) {
  if (step <= 0) return 0;
  if (step === 1) return 1;
  if (step === 2) return 2;
  return 3;
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
          /** Energy travels on the line into the current step (from previous → current). */
          const segmentActive = i === current - 1;

          return (
            <li
              key={label}
              className={`flex items-start ${i < total - 1 ? "flex-1" : ""}`}
            >
              <div className="relative flex shrink-0 flex-col items-center">
                {active && (
                  <span
                    className="animate-progress-ring pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-400/70"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition duration-300 sm:h-10 sm:w-10 sm:text-sm ${
                    done
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : active
                        ? "animate-progress-orb border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-emerald-700"
                        : "border-black/15 bg-white text-muted"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <CheckIcon /> : i + 1}
                  {active && (
                    <span
                      className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400/20 blur-[6px]"
                      aria-hidden="true"
                    />
                  )}
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
                  className={`relative mt-4 h-0.5 min-w-[0.5rem] flex-1 self-start overflow-hidden rounded-full transition-colors duration-500 sm:mt-5 ${
                    segmentActive
                      ? "bg-emerald-600/30"
                      : segmentDone
                        ? "bg-emerald-600"
                        : "bg-black/10"
                  }`}
                  aria-hidden="true"
                >
                  {segmentActive && (
                    <>
                      <span className="animate-progress-energy absolute inset-y-0 left-0 w-[38%] rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-emerald-300/80" />
                      <span className="animate-progress-spark absolute top-1/2 h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_3px_rgba(52,211,153,0.85)]" />
                    </>
                  )}
                </span>
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
