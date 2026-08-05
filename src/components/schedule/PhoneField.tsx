"use client";

import type { LocationDetails } from "@/lib/ordering/types";

const labelClass = "text-sm font-medium";

function getFieldClass(error: boolean) {
  const base =
    "w-full border bg-white px-3 py-2.5 text-sm outline-none transition-all duration-200";
  if (error) {
    return `${base} border-red-500 animate-input-error`;
  }
  return `${base} border-black/20 focus:border-emerald-500 focus:animate-input-focus`;
}

export type PhoneType = NonNullable<LocationDetails["phoneType"]>;

const OPTIONS: { id: PhoneType; label: string; prefer?: boolean }[] = [
  { id: "cell", label: "Cell phone", prefer: true },
  { id: "landline", label: "Landline" },
];

export default function PhoneField({
  id = "location-phone",
  value,
  phoneType,
  onChange,
  autoComplete = "tel",
  error = false,
  onErrorClear,
}: {
  id?: string;
  value: string;
  phoneType: PhoneType | "" | undefined;
  onChange: (patch: { phone?: string; phoneType?: PhoneType }) => void;
  autoComplete?: string;
  error?: boolean;
  onErrorClear?: () => void;
}) {
  const selected: PhoneType =
    phoneType === "landline" || phoneType === "cell" ? phoneType : "cell";
  const hintId = `${id}-type-hint`;

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <label className={labelClass} htmlFor={id}>
          Phone
          {error && <span className="ml-2 text-xs font-semibold text-red-600">Required</span>}
        </label>
        <div
          className="inline-flex overflow-hidden border border-black/20 bg-white"
          role="radiogroup"
          aria-label="Phone type"
        >
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange({ phoneType: opt.id })}
                className={`px-3 py-1.5 text-xs font-medium transition duration-200 sm:text-sm ${
                  isSelected
                    ? "bg-black text-white"
                    : "bg-white text-foreground hover:bg-black/[0.03]"
                } ${opt.id === "landline" ? "border-l border-black/15" : ""}`}
              >
                {opt.label}
                {opt.prefer ? (
                  <span
                    className={`ml-1 font-normal ${
                      isSelected ? "text-white/70" : "text-muted"
                    }`}
                  >
                    (prefer)
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        className={getFieldClass(error)}
        value={value}
        onChange={(e) => {
          onChange({ phone: e.target.value });
          if (error && e.target.value.trim() && onErrorClear) {
            onErrorClear();
          }
        }}
        autoComplete={autoComplete}
        aria-describedby={hintId}
      />
      <p id={hintId} className="mt-1.5 text-xs text-muted">
        {selected === "cell"
          ? "We’ll use this number for texts and calls about the appointment."
          : "We’ll call this landline about the appointment."}
      </p>
    </div>
  );
}
