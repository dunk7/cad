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

function formatServiceDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function LocationStep() {
  const { draft, setDraft, setStep } = useOrder();
  const data = draft.delivery;
  const pickupDate = draft.schedule?.pickupDate;
  const [days, setDays] = useState<ServiceDay[]>([]);
  const [regionLabel, setRegionLabel] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [loadingDays, setLoadingDays] = useState(false);

  useEffect(() => {
    if (!data.state?.trim()) {
      setDraft((d) => ({
        ...d,
        delivery: { ...d.delivery, state: "CA" },
      }));
    }
  }, [data.state, setDraft]);

  useEffect(() => {
    const zip = normalizeZip(data.zip);
    if (zip.length < 5 || !pickupDate) {
      setDays([]);
      setRegionLabel("");
      if (zip.length >= 5 && !pickupDate) {
        setScheduleError("Select a pickup date first.");
      } else {
        setScheduleError("");
      }
      return;
    }

    let cancelled = false;
    setLoadingDays(true);
    setScheduleError("");
    void fetch(
      `/api/schedule?zip=${encodeURIComponent(zip)}&after=${encodeURIComponent(pickupDate)}&min=3`
    )
      .then((r) => r.json())
      .then((payload) => {
        if (cancelled) return;
        const nextDays: ServiceDay[] = payload.days || [];
        setDays(nextDays);
        setRegionLabel(payload.regionLabel || "");

        const selected = draft.schedule?.deliveryDate;
        const stillValid = selected && nextDays.some((d) => d.date === selected);
        if (!stillValid) {
          setDraft((d) => ({
            ...d,
            schedule: d.schedule
              ? {
                  ...d.schedule,
                  deliveryDate: nextDays[0]?.date || d.schedule.pickupDate,
                }
              : d.schedule,
            delivery: {
              ...d.delivery,
              region: nextDays[0]?.regionId || d.delivery.region,
            },
          }));
        }

        if (!nextDays.length) {
          setScheduleError(
            "No delivery route days found for this ZIP after your pickup date. Contact us for a custom schedule."
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setDays([]);
        setScheduleError("Could not load delivery dates. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoadingDays(false);
      });

    return () => {
      cancelled = true;
    };
    // Intentionally depend on zip + pickupDate; draft.schedule read for validity only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.zip, pickupDate, setDraft]);

  function setLoc(patch: Partial<LocationDetails>) {
    setDraft((d) => ({
      ...d,
      delivery: { ...d.delivery, ...patch },
    }));
  }

  function selectDeliveryDay(day: ServiceDay) {
    setDraft((d) => ({
      ...d,
      schedule: d.schedule
        ? {
            ...d.schedule,
            deliveryDate: day.date,
            label: d.schedule.label,
          }
        : {
            pickupDate: day.date,
            deliveryDate: day.date,
            label: day.label,
          },
      delivery: { ...d.delivery, region: day.regionId },
    }));
  }

  function canContinue(): boolean {
    if (!data.name || !data.phone || !data.address1 || !data.city || !data.zip) {
      alert("Please complete name, phone, address, city, and ZIP.");
      return false;
    }
    if (normalizeZip(data.zip).length < 5) {
      alert("Please enter a valid 5-digit ZIP code.");
      return false;
    }
    if (!draft.schedule?.deliveryDate) {
      alert("Please select a delivery date.");
      return false;
    }
    return true;
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Delivery details
      </h1>
      <p className="mt-2 text-center text-muted">
        Tell us where to go, then pick a delivery date on that ZIP’s route day.
      </p>

      <div className="mx-auto mt-8 max-w-xl space-y-4">
        <div>
          <label className={label}>Contact name</label>
          <input
            className={field}
            value={data.name || ""}
            onChange={(e) => setLoc({ name: e.target.value })}
          />
        </div>
        <PhoneField
          id="delivery-phone"
          value={data.phone || ""}
          phoneType={data.phoneType}
          onChange={setLoc}
        />
        <div>
          <label className={label}>Street address</label>
          <input
            className={field}
            value={data.address1 || ""}
            onChange={(e) => setLoc({ address1: e.target.value })}
            autoComplete="street-address"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className={label}>City</label>
            <input
              className={field}
              value={data.city || ""}
              onChange={(e) => setLoc({ city: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>State</label>
            <input
              className={field}
              value={data.state || "CA"}
              onChange={(e) => setLoc({ state: e.target.value || "CA" })}
              placeholder="CA"
            />
          </div>
          <div>
            <label className={label}>ZIP</label>
            <input
              className={field}
              inputMode="numeric"
              value={data.zip || ""}
              onChange={(e) => setLoc({ zip: e.target.value })}
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
            className={field}
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

        <div className="space-y-3 border-t border-black/10 pt-6">
          <h2 className="text-sm font-medium">Delivery date</h2>
          <p className="text-sm text-muted">
            {regionLabel
              ? `Route days for ${data.zip} · ${regionLabel} (on or after pickup ${pickupDate || "—"}).`
              : "Enter a ZIP to see delivery dates for that area."}
          </p>
          {loadingDays && (
            <p className="text-sm text-muted">Loading route dates…</p>
          )}
          {scheduleError && !loadingDays && (
            <p className="text-sm text-red-700">{scheduleError}</p>
          )}
          {!loadingDays &&
            days.map((day) => {
              const selected = draft.schedule?.deliveryDate === day.date;
              return (
                <button
                  key={`${day.date}-${day.regionId}`}
                  type="button"
                  onClick={() => selectDeliveryDay(day)}
                  className={`w-full border px-4 py-4 text-left transition ${
                    selected
                      ? "border-black ring-2 ring-black"
                      : "border-black/15 hover:border-black/40"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium">{formatServiceDate(day.date)}</p>
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
      </div>

      <div className="mt-10 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="border border-black/20 px-6 py-3 text-sm hover:border-black"
        >
          Back
        </button>
        <RewardButton
          shouldReward={canContinue}
          onReward={() => setStep(3)}
          disabled={!draft.schedule?.deliveryDate}
        >
          Next
        </RewardButton>
      </div>
    </div>
  );
}
