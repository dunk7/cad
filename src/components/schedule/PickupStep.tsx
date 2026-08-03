"use client";

import { defaultRouteSlots, type RouteSlot } from "@/lib/ordering/defaults";
import { useOrder } from "@/lib/ordering/OrderContext";
import type { LocationDetails } from "@/lib/ordering/types";
import PhoneField from "@/components/schedule/PhoneField";
import { useEffect, useState } from "react";

const field =
  "w-full border border-black/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-black";
const label = "mb-1 block text-sm font-medium";

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
    if (substep === 0) {
      if (!data.name?.trim() || !data.phone?.trim() || !draft.customer.email?.trim()) {
        alert("Please enter contact name, phone, and email.");
        return;
      }
      setSubstep(1);
      return;
    }
    if (substep === 1) {
      if (!data.address1?.trim() || !data.city?.trim() || !data.zip?.trim()) {
        alert("Please enter street address, city, and ZIP.");
        return;
      }
      if (!data.state?.trim()) {
        setLoc({ state: "CA" });
      }
      setSubstep(2);
      return;
    }
    if (substep === 2) {
      setSubstep(3);
      return;
    }
    if (!draft.schedule?.pickupDate) {
      alert("Please select a pickup time.");
      return;
    }
    setStep(2);
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
              <label className={label}>Contact name</label>
              <input
                className={field}
                value={data.name || ""}
                onChange={(e) => setLoc({ name: e.target.value })}
                autoComplete="name"
              />
            </div>
            <PhoneField
              id="pickup-phone"
              value={data.phone || ""}
              phoneType={data.phoneType}
              onChange={setLoc}
            />
            <div>
              <label className={label}>Email</label>
              <input
                type="email"
                className={field}
                value={draft.customer.email || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    customer: { ...d.customer, email: e.target.value },
                    pickup: { ...d.pickup, email: e.target.value },
                  }))
                }
                autoComplete="email"
              />
            </div>
          </>
        )}

        {substep === 1 && (
          <>
            <div>
              <label className={label}>Street address</label>
              <input
                className={field}
                value={data.address1 || ""}
                onChange={(e) => setLoc({ address1: e.target.value })}
                autoComplete="street-address"
              />
            </div>
            <div>
              <label className={label}>City</label>
              <input
                className={field}
                value={data.city || ""}
                onChange={(e) => setLoc({ city: e.target.value })}
                autoComplete="address-level2"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>State</label>
                <input
                  className={field}
                  value={data.state || "CA"}
                  onChange={(e) => setLoc({ state: e.target.value || "CA" })}
                  placeholder="CA"
                  autoComplete="address-level1"
                />
              </div>
              <div>
                <label className={label}>ZIP</label>
                <input
                  className={field}
                  inputMode="numeric"
                  value={data.zip || ""}
                  onChange={(e) => setLoc({ zip: e.target.value })}
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </>
        )}

        {substep === 2 && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={label}>Floor</label>
                <input
                  className={field}
                  value={data.floor || ""}
                  onChange={(e) => setLoc({ floor: e.target.value })}
                />
              </div>
              <div>
                <label className={label}>Flights of stairs</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className={field}
                  value={data.stairsFlights ?? ""}
                  onChange={(e) =>
                    setLoc({
                      stairsFlights:
                        e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className={label}>Elevator</label>
                <select
                  className={field}
                  value={data.elevator || "unsure"}
                  onChange={(e) =>
                    setLoc({ elevator: e.target.value as LocationDetails["elevator"] })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unsure">Not sure</option>
                </select>
              </div>
            </div>
            <div>
              <label className={label}>
                Parking and access instructions{" "}
                <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                className={field}
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
            </p>
            {PICKUP_SLOTS.map((slot) => {
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
                    <p className="font-medium">{formatPickupDate(slot.pickupDate)}</p>
                    {selected && (
                      <span className="text-xs uppercase tracking-wide">Selected</span>
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
          className="border border-black bg-black px-8 py-3 text-sm font-medium text-white hover:bg-white hover:text-black disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
