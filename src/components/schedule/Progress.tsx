"use client";

import { WIZARD_STEPS } from "@/lib/ordering/catalog";

export default function Progress({ step }: { step: number }) {
  return (
    <nav aria-label="Order progress" className="mx-auto max-w-3xl">
      <ol className="flex items-center justify-between gap-1">
        {WIZARD_STEPS.map((label, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <span
                  className={`mx-auto flex h-2 w-2 rounded-full transition ${
                    active
                      ? "bg-black scale-125"
                      : done
                        ? "bg-black/50"
                        : "bg-black/15"
                  }`}
                />
              </div>
              <span
                className={`hidden truncate text-[10px] uppercase tracking-[0.16em] sm:block ${
                  active
                    ? "font-semibold text-foreground"
                    : done
                      ? "text-foreground/55"
                      : "text-muted"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 text-center text-xs text-muted sm:hidden">
        {WIZARD_STEPS[step]}
      </div>
    </nav>
  );
}
