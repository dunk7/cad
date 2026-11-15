"use client";

import { useOrder } from "@/lib/ordering/OrderContext";
import type { LocationDetails } from "@/lib/ordering/types";
import {
  normalizeZip,
  type ServiceDay,
} from "@/lib/ordering/routeCalendar";
import FloorAccessFields from "@/components/schedule/FloorAccessFields";
import PhoneField from "@/components/schedule/PhoneField";
import RewardButton from "@/components/schedule/RewardButton";
import { useEffect, useState } from "react";

const field =
  "w-full border border-black/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-black";
const label = "mb-1 block text-sm font-medium";

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
  const [days, setDays] = useState<ServiceDay[]>([]);
  const [regionLabel, setRegionLabel] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [loadingDays, setLoadingDays] = useState(false);

  useEffect(() => {
    if (!data.state?.trim()) {
      setDraft((d) => ({
        ...d,
        pickup: { ...d.pickup, state: "CA" },
      }));
    }
  }, [data.state, setDraft]);

  useEffect(() => {
    if (substep !== 3) return;
    const zip = normalizeZip(data.zip);
    if (zip.length < 5) {
      setDays([]);
      setRegionLabel("");
      setScheduleError("Enter a 5-digit ZIP to see pickup dates for your area.");
      return;
    }

    let cancelled = false;
    setLoadingDays(true);
    setScheduleError("");
    void fetch(`/api/schedule?zip=${encodeURIComponent(zip)}&min=3`)
      .then((r) => r.json())
      .then((payload) => {
        if (cancelled) return;
        setDays(payload.days || []);
        setRegionLabel(payload.regionLabel || "");
        if (!payload.days?.length) {
          setScheduleError(
            "No route days found for this ZIP in the next few weeks. Try another ZIP or contact us for a custom schedule."
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setDays([]);
        setScheduleError("Could not load available dates. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoadingDays(false);
      });

    return () => {
      cancelled = true;
    };
  }, [substep, data.zip]);

  function setLoc(patch: Partial<LocationDetails>) {
    setDraft((d) => {
      const zipChanged =
        patch.zip !== undefined &&
        normalizeZip(patch.zip) !== normalizeZip(d.pickup.zip);
      return {
        ...d,
        pickup: { ...d.pickup, ...patch },
        schedule: zipChanged ? undefined : d.schedule,
        customer: {
          ...d.customer,
          name: patch.name ?? d.customer.name ?? d.pickup.name,
          email: patch.email ?? d.customer.email,
          phone: patch.phone ?? d.customer.phone ?? d.pickup.phone,
        },
      };
    });
  }

  function canContinue(): boolean {
    if (substep === 0) {
      if (!data.name?.trim() || !data.phone?.trim() || !draft.customer.email?.trim()) {
        alert("Please enter contact name, phone, and email.");
        return false;
      }
      return true;
    }
    if (substep === 1) {
      if (!data.address1?.trim() || !data.city?.trim() || !data.zip?.trim()) {
        alert("Please enter street address, city, and ZIP.");
        return false;
      }
      if (normalizeZip(data.zip).length < 5) {
        alert("Please enter a valid 5-digit ZIP code.");
        return false;
      }
      if (!data.state?.trim()) {
        setLoc({ state: "CA" });
      }
      return true;
    }
    if (substep === 2) {
      return true;
    }
    if (!draft.schedule?.pickupDate) {
      alert("Please select a pickup date.");
      return false;
    }
    return true;
  }

  function advance() {
    if (substep < 3) {
      setSubstep((s) => s + 1);
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

  function selectDay(day: ServiceDay) {
    setDraft((d) => ({
      ...d,
      schedule: {
        pickupDate: day.date,
        // Delivery date is refined after delivery ZIP is entered.
        deliveryDate: d.schedule?.deliveryDate || day.date,
        label: day.label,
      },
      pickup: { ...d.pickup, region: day.regionId },
    }));
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
        {substep === 3 && "Choose a pickup date for your ZIP’s route day."}
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
            <FloorAccessFields kind="pickup" data={data} onChange={setLoc} />
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
              {regionLabel
                ? `Route days for ${data.zip} · ${regionLabel}. Showing the next ~3 weeks (at least 3 options when available).`
                : `Available pickup dates for ${data.zip || "your area"}.`}
            </p>
            {loadingDays && (
              <p className="text-sm text-muted">Loading route dates…</p>
            )}
            {scheduleError && !loadingDays && (
              <p className="text-sm text-red-700">{scheduleError}</p>
            )}
            {!loadingDays &&
              days.map((day) => {
                const selected = draft.schedule?.pickupDate === day.date;
                return (
                  <button
                    key={`${day.date}-${day.regionId}`}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={`w-full border px-4 py-4 text-left transition ${
                      selected
                        ? "border-black ring-2 ring-black"
                        : "border-black/15 hover:border-black/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium">{formatPickupDate(day.date)}</p>
                      {selected && (
                        <span className="text-xs uppercase tracking-wide">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted">{day.label}</p>
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
        <RewardButton
          shouldReward={canContinue}
          onReward={advance}
          disabled={substep === 3 && !draft.schedule?.pickupDate}
        >
          Next
        </RewardButton>
      </div>
    </div>
  );
}
