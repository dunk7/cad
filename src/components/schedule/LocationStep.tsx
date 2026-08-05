"use client";

import { useOrder } from "@/lib/ordering/OrderContext";
import type { LocationDetails } from "@/lib/ordering/types";
import FloorAccessFields from "@/components/schedule/FloorAccessFields";
import PhoneField from "@/components/schedule/PhoneField";
import RewardButton from "@/components/schedule/RewardButton";
import { useEffect } from "react";

const field =
  "w-full border border-black/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-black";
const label = "mb-1 block text-sm font-medium";

export default function LocationStep() {
  const { draft, setDraft, setStep } = useOrder();
  const data = draft.delivery;

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

  function canContinue(): boolean {
    if (!data.name || !data.phone || !data.address1 || !data.city || !data.zip) {
      alert("Please complete name, phone, address, city, and ZIP.");
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
        Tell us where to go and who to contact on site.
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
      </div>

      <div className="mt-10 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="border border-black/20 px-6 py-3 text-sm hover:border-black"
        >
          Back
        </button>
        <RewardButton shouldReward={canContinue} onReward={() => setStep(3)}>
          Next
        </RewardButton>
      </div>
    </div>
  );
}
