"use client";

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

export default function LocationStep() {
  const { draft, setDraft, setStep } = useOrder();
  const data = draft.delivery;
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [successAnimation, setSuccessAnimation] = useState(false);

  useEffect(() => {
    if (!data.state?.trim()) {
      setDraft((d) => ({
        ...d,
        delivery: { ...d.delivery, state: "CA" },
      }));
    }
  }, [data.state, setDraft]);

  function setLoc(patch: Partial<LocationDetails>) {
    setDraft((d) => ({
      ...d,
      delivery: { ...d.delivery, ...patch },
    }));
  }

  function continueNext() {
    const newErrors = new Set<string>();
    if (!data.name?.trim()) newErrors.add("name");
    if (!data.phone?.trim()) newErrors.add("phone");
    if (!data.address1?.trim()) newErrors.add("address1");
    if (!data.city?.trim()) newErrors.add("city");
    if (!data.zip?.trim()) newErrors.add("zip");

    if (newErrors.size > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors(new Set());
    setSuccessAnimation(true);
    setTimeout(() => {
      setSuccessAnimation(false);
      setStep(3);
    }, 400);
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Delivery details
      </h1>
      <p className="mt-2 text-center text-muted">
        Tell us where to go and who to contact on site.
      </p>

      <div className="mx-auto mt-8 max-w-xl space-y-4">
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
          />
        </div>
        <PhoneField
          id="delivery-phone"
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
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
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
            />
          </div>
          <div>
            <label className={label}>State</label>
            <input
              className={getFieldClass(false, data.state)}
              value={data.state || "CA"}
              onChange={(e) => setLoc({ state: e.target.value || "CA" })}
              placeholder="CA"
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
            />
          </div>
        </div>
        <FloorAccessFields kind="delivery" data={data} onChange={setLoc} />
        <div>
          <label className={label}>
            Parking and access instructions{" "}
            <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            className={getFieldClass(false)}
            rows={3}
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
      </div>

      <div className="mt-10 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="border border-black/20 px-6 py-3 text-sm hover:border-black"
        >
          Back
        </button>
        <button
          type="button"
          onClick={continueNext}
          className={`relative border px-8 py-3 text-sm font-medium transition-all ${
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
