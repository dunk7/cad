"use client";

import { defaultRouteSlots, type RouteSlot } from "@/lib/ordering/defaults";
import { useOrder } from "@/lib/ordering/OrderContext";
import type { LocationDetails } from "@/lib/ordering/types";
import FloorAccessFields from "@/components/schedule/FloorAccessFields";
import PhoneField from "@/components/schedule/PhoneField";
import { useEffect, useState } from "react";

const label = "mb-1 block text-sm font-medium";

function getFieldClass(error: boolean, value?: string) {
  const base =
    "w-full border bg-white px-3 py-2.5 text-sm outline-none transition-all duration-200";
  if (error) {
    return `${base} border-red-500 animate-input-error`;
  }
  return `${base} border-black/20 focus:border-emerald-500 focus:animate-input-focus`;
}

const PICKUP_SLOTS: RouteSlot[] = defaultRouteSlots;

function formatPickupDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function PickupStep() {
  const { draft, setDraft, setStep } = useOrder();
  const data = draft.pickup;
  const [substep, setSubstep] = useState(0);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [successAnimation, setSuccessAnimation] = useState(false);

  useEffect(() => {
    if (!data.state?.trim()) {
      setDraft((d) => ({
        ...d,
        pickup: { ...d.pickup, state: "CA" },
      }));
    }
  }, [data.state, setDraft]);

  function setLoc(patch: Partial<LocationDetails>) {
    setDraft((d) => ({
      ...d,
      pickup: { ...d.pickup, ...patch },
      customer: {
        ...d.customer,
        name: patch.name ?? d.customer.name ?? d.pickup.name,
        email: patch.email ?? d.customer.email,
        phone: patch.phone ?? d.customer.phone ?? d.pickup.phone,
      },
    }));
  }

  function continueNext() {
    const newErrors = new Set<string>();

    if (substep === 0) {
      if (!data.name?.trim()) newErrors.add("name");
      if (!data.phone?.trim()) newErrors.add("phone");
      if (!draft.customer.email?.trim()) newErrors.add("email");

      if (newErrors.size > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors(new Set());
      triggerSuccess(() => setSubstep(1));
      return;
    }
    if (substep === 1) {
      if (!data.address1?.trim()) newErrors.add("address1");
      if (!data.city?.trim()) newErrors.add("city");
      if (!data.zip?.trim()) newErrors.add("zip");

      if (newErrors.size > 0) {
        setErrors(newErrors);
        return;
      }
      if (!data.state?.trim()) {
        setLoc({ state: "CA" });
      }
      setErrors(new Set());
      triggerSuccess(() => setSubstep(2));
      return;
    }
    if (substep === 2) {
      setErrors(new Set());
      triggerSuccess(() => setSubstep(3));
      return;
    }
    if (!draft.schedule?.pickupDate) {
      newErrors.add("schedule");
      setErrors(newErrors);
      return;
    }
    setErrors(new Set());
    triggerSuccess(() => setStep(2));
  }

  function triggerSuccess(callback: () => void) {
    setSuccessAnimation(true);
    setTimeout(() => {
      setSuccessAnimation(false);
      callback();
    }, 400);
  }

  function goBack() {
    if (substep === 0) {
      setStep(0);
      return;
    }
    setSubstep((s) => s - 1);
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Pickup details
      </h1>
      <p className="mt-2 text-center text-muted">
        {substep === 0 && "Who should we contact for this pickup?"}
        {substep === 1 && "Where should we pick up?"}
        {substep === 2 && "Tell us about building access."}
        {substep === 3 && "Choose a pickup time that works for you."}
      </p>

      <div className="mx-auto mt-8 max-w-xl space-y-4">
        {substep === 0 && (
          <>
            <div>
              <label className={label}>
                Contact name
                {errors.has("name") && (
                  <span className="ml-2 text-xs font-semibold text-red-600">Required</span>
                )}
              </label>
              <input
                className={getFieldClass(errors.has("name"), data.name)}
                value={data.name || ""}
                onChange={(e) => {
                  setLoc({ name: e.target.value });
                  if (errors.has("name") && e.target.value.trim()) {
                    setErrors((prev) => {
                      const next = new Set(prev);
                      next.delete("name");
                      return next;
                    });
                  }
                }}
                autoComplete="name"
              />
            </div>
            <PhoneField
              id="pickup-phone"
              value={data.phone || ""}
              phoneType={data.phoneType}
              onChange={setLoc}
              error={errors.has("phone")}
              onErrorClear={() =>
                setErrors((prev) => {
                  const next = new Set(prev);
                  next.delete("phone");
                  return next;
                })
              }
            />
            <div>
              <label className={label}>
                Email
                {errors.has("email") && (
                  <span className="ml-2 text-xs font-semibold text-red-600">Required</span>
                )}
              </label>
              <input
                type="email"
                className={getFieldClass(errors.has("email"), draft.customer.email)}
                value={draft.customer.email || ""}
                onChange={(e) => {
                  setDraft((d) => ({
                    ...d,
                    customer: { ...d.customer, email: e.target.value },
                    pickup: { ...d.pickup, email: e.target.value },
                  }));
                  if (errors.has("email") && e.target.value.trim()) {
                    setErrors((prev) => {
                      const next = new Set(prev);
                      next.delete("email");
                      return next;
                    });
                  }
                }}
                autoComplete="email"
              />
            </div>
          </>
        )}

        {substep === 1 && (
          <>
            <div>
              <label className={label}>
                Street address
                {errors.has("address1") && (
                  <span className="ml-2 text-xs font-semibold text-red-600">Required</span>
                )}
              </label>
              <input
                className={getFieldClass(errors.has("address1"), data.address1)}
                value={data.address1 || ""}
                onChange={(e) => {
                  setLoc({ address1: e.target.value });
                  if (errors.has("address1") && e.target.value.trim()) {
                    setErrors((prev) => {
                      const next = new Set(prev);
                      next.delete("address1");
                      return next;
                    });
                  }
                }}
                autoComplete="street-address"
              />
            </div>
            <div>
              <label className={label}>
                City
                {errors.has("city") && (
                  <span className="ml-2 text-xs font-semibold text-red-600">Required</span>
                )}
              </label>
              <input
                className={getFieldClass(errors.has("city"), data.city)}
                value={data.city || ""}
                onChange={(e) => {
                  setLoc({ city: e.target.value });
                  if (errors.has("city") && e.target.value.trim()) {
                    setErrors((prev) => {
                      const next = new Set(prev);
                      next.delete("city");
                      return next;
                    });
                  }
                }}
                autoComplete="address-level2"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>State</label>
                <input
                  className={getFieldClass(false, data.state)}
                  value={data.state || "CA"}
                  onChange={(e) => setLoc({ state: e.target.value || "CA" })}
                  placeholder="CA"
                  autoComplete="address-level1"
                />
              </div>
              <div>
                <label className={label}>
                  ZIP
                  {errors.has("zip") && (
                    <span className="ml-2 text-xs font-semibold text-red-600">Required</span>
                  )}
                </label>
                <input
                  className={getFieldClass(errors.has("zip"), data.zip)}
                  inputMode="numeric"
                  value={data.zip || ""}
                  onChange={(e) => {
                    setLoc({ zip: e.target.value });
                    if (errors.has("zip") && e.target.value.trim()) {
                      setErrors((prev) => {
                        const next = new Set(prev);
                        next.delete("zip");
                        return next;
                      });
                    }
                  }}
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </>
        )}

        {substep === 2 && (
          <>
            <FloorAccessFields kind="pickup" data={data} onChange={setLoc} />
            <div>
              <label className={label}>
                Parking and access instructions{" "}
                <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                className={getFieldClass(false)}
                rows={4}
                value={data.parkingInstructions || data.accessInstructions || ""}
                onChange={(e) =>
                  setLoc({
                    parkingInstructions: e.target.value,
                    accessInstructions: "",
                  })
                }
                placeholder="Parking, gate codes, building entry, where the item is, etc."
              />
            </div>
          </>
        )}

        {substep === 3 && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Available times for {data.zip || "your area"} (sample schedule for now).
              {errors.has("schedule") && (
                <span className="ml-2 font-semibold text-red-600">
                  Please select a pickup time
                </span>
              )}
            </p>
            {PICKUP_SLOTS.map((slot) => {
              const selected =
                draft.schedule?.pickupDate === slot.pickupDate &&
                draft.schedule?.deliveryDate === slot.deliveryDate;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    setDraft((d) => ({
                      ...d,
                      schedule: {
                        pickupDate: slot.pickupDate,
                        deliveryDate: slot.deliveryDate,
                        label: slot.label,
                      },
                    }));
                    if (errors.has("schedule")) {
                      setErrors((prev) => {
                        const next = new Set(prev);
                        next.delete("schedule");
                        return next;
                      });
                    }
                  }}
                  className={`w-full border px-4 py-4 text-left transition ${
                    selected
                      ? "border-emerald-500 ring-2 ring-emerald-500"
                      : errors.has("schedule")
                        ? "border-red-500 animate-input-error"
                        : "border-black/15 hover:border-emerald-400 hover:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium">{formatPickupDate(slot.pickupDate)}</p>
                    {selected && (
                      <span className="text-xs uppercase tracking-wide text-emerald-600">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">{slot.label}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          className="border border-black/20 px-6 py-3 text-sm hover:border-black"
        >
          Back
        </button>
        <button
          type="button"
          onClick={continueNext}
          disabled={substep === 3 && !draft.schedule}
          className={`relative border px-8 py-3 text-sm font-medium transition-all disabled:opacity-40 ${
            successAnimation
              ? "animate-next-success border-emerald-500 bg-emerald-500 text-white"
              : "border-black bg-black text-white hover:bg-white hover:text-black"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
