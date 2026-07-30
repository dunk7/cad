"use client";

import { formatCents } from "@/lib/money";
import { useOrder } from "@/lib/ordering/OrderContext";
import type { RouteSlot } from "@/lib/ordering/defaults";
import { useEffect, useState } from "react";

export default function ScheduleStep() {
  const { draft, setDraft, setStep, price } = useOrder();
  const [routes, setRoutes] = useState<RouteSlot[]>([]);
  const [declaredPct, setDeclaredPct] = useState(1.5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/pricing")
      .then((r) => r.json())
      .then((d) => {
        setRoutes(d.routes || []);
        setDeclaredPct(d.declaredValuePercent || 1.5);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Choose Your Schedule
      </h1>
      <p className="mt-2 text-center text-muted">
        Select dates from California Art Delivery’s recurring route schedule.
      </p>

      <div className="mx-auto mt-8 max-w-xl">
        <label className="mb-1 block text-sm font-medium">
          Declared value of all items (USD)
        </label>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="1"
          className="w-full border border-black/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
          value={draft.declaredValueDollars || ""}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              declaredValueDollars: Number(e.target.value) || 0,
            }))
          }
        />
        <p className="mt-1 text-xs text-muted">
          Declared value protection is calculated at {declaredPct}% of the amount you enter.
        </p>
      </div>

      {price && (
        <p className="mt-6 text-center text-lg font-medium">
          Estimated total: {formatCents(price.totalCents)}
        </p>
      )}

      <div className="mx-auto mt-8 max-w-2xl space-y-3">
        {loading && <p className="text-center text-muted">Loading dates…</p>}
        {!loading &&
          routes.map((slot) => {
            const selected =
              draft.schedule?.pickupDate === slot.pickupDate &&
              draft.schedule?.deliveryDate === slot.deliveryDate;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    schedule: {
                      pickupDate: slot.pickupDate,
                      deliveryDate: slot.deliveryDate,
                      label: slot.label,
                    },
                  }))
                }
                className={`w-full border px-4 py-4 text-left transition ${
                  selected
                    ? "border-black ring-2 ring-black"
                    : "border-black/15 hover:border-black/40"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{slot.label}</p>
                  {selected && <span className="text-xs uppercase tracking-wide">Selected</span>}
                </div>
                <p className="mt-1 text-sm text-muted">
                  Pickup {slot.pickupDate} → Delivery {slot.deliveryDate}
                </p>
              </button>
            );
          })}
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">
        None of these dates work?{" "}
        <a href="/contact" className="underline">
          Contact us about a dedicated trip
        </a>
        .
      </p>

      <div className="mt-10 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="border border-black/20 px-6 py-3 text-sm hover:border-black"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!draft.schedule}
          onClick={() => setStep(5)}
          className="border border-black bg-black px-8 py-3 text-sm font-medium text-white hover:bg-white hover:text-black disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
