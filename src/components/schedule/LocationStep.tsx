"use client";

import { useOrder } from "@/lib/ordering/OrderContext";
import type { LocationDetails } from "@/lib/ordering/types";

const field =
  "w-full border border-black/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-black";
const label = "mb-1 block text-sm font-medium";

type Props = {
  kind: "pickup" | "delivery";
};

export default function LocationStep({ kind }: Props) {
  const { draft, setDraft, setStep } = useOrder();
  const data = (kind === "pickup" ? draft.pickup : draft.delivery) as Partial<LocationDetails>;
  const title = kind === "pickup" ? "Pickup details" : "Delivery details";
  const back = kind === "pickup" ? 1 : 2;
  const next = kind === "pickup" ? 3 : 4;

  function setLoc(patch: Partial<LocationDetails>) {
    setDraft((d) => ({
      ...d,
      [kind]: { ...d[kind], ...patch },
      customer:
        kind === "pickup"
          ? {
              ...d.customer,
              name: patch.name ?? d.customer.name ?? d.pickup.name,
              email: patch.email ?? d.customer.email,
              phone: patch.phone ?? d.customer.phone ?? d.pickup.phone,
            }
          : d.customer,
    }));
  }

  function continueNext() {
    if (!data.name || !data.phone || !data.address1 || !data.city || !data.zip) {
      alert("Please complete name, phone, address, city, and ZIP.");
      return;
    }
    if (kind === "pickup" && !draft.customer.email) {
      // ask email on pickup
      const email = window.prompt("Email for confirmation and receipt:");
      if (!email) return;
      setDraft((d) => ({ ...d, customer: { ...d.customer, email } }));
    }
    setStep(next);
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Phone</label>
            <input
              type="tel"
              inputMode="tel"
              className={field}
              value={data.phone || ""}
              onChange={(e) => setLoc({ phone: e.target.value })}
            />
          </div>
          {kind === "pickup" && (
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
                  }))
                }
              />
            </div>
          )}
        </div>
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
          <label className={label}>Address line 2</label>
          <input
            className={field}
            value={data.address2 || ""}
            onChange={(e) => setLoc({ address2: e.target.value })}
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
              onChange={(e) => setLoc({ state: e.target.value })}
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
            <label className={label}>Stair flights</label>
            <input
              type="number"
              inputMode="numeric"
              className={field}
              value={data.stairsFlights ?? ""}
              onChange={(e) =>
                setLoc({
                  stairsFlights: e.target.value === "" ? undefined : Number(e.target.value),
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
            rows={3}
            value={
              data.parkingInstructions ||
              data.accessInstructions ||
              ""
            }
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
          onClick={() => setStep(back)}
          className="border border-black/20 px-6 py-3 text-sm hover:border-black"
        >
          Back
        </button>
        <button
          type="button"
          onClick={continueNext}
          className="border border-black bg-black px-8 py-3 text-sm font-medium text-white hover:bg-white hover:text-black"
        >
          Next
        </button>
      </div>
    </div>
  );
}
