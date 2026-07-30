"use client";

import type { PricingConfig } from "@/lib/ordering/defaults";
import { defaultPricingConfig } from "@/lib/ordering/defaults";
import { useEffect, useState } from "react";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const input =
  "w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black";

export default function PricingEditor() {
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    void fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => setPricing(d.pricing || defaultPricingConfig));
  }, []);

  function patchPainting(key: keyof PricingConfig["painting"], value: number) {
    setPricing((p) =>
      p ? { ...p, painting: { ...p.painting, [key]: value } } : p
    );
  }

  function patchSculpture(key: keyof PricingConfig["sculpture"], value: number) {
    setPricing((p) =>
      p ? { ...p, sculpture: { ...p.sculpture, [key]: value } } : p
    );
  }

  async function save() {
    if (!pricing) return;
    setStatus("saving");
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricing }),
    });
    setStatus(res.ok ? "saved" : "error");
  }

  if (!pricing) {
    return <p className="text-muted">Loading pricing…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pricing</h1>
          <p className="mt-1 text-sm text-muted">
            Editable thresholds and fees. Customers never see these rule names.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status === "saved" && (
            <span className="text-sm text-emerald-700">Saved</span>
          )}
          {status === "error" && <span className="text-sm text-red-700">Save failed</span>}
          <button
            type="button"
            onClick={() => setPricing(defaultPricingConfig)}
            className="border border-black/20 px-4 py-2 text-sm hover:border-black"
          >
            Reset defaults
          </button>
          <button
            type="button"
            onClick={() => void save()}
            className="border border-black bg-black px-5 py-2 text-sm text-white hover:bg-white hover:text-black"
          >
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Declared value</h2>
        <div className="mt-4 max-w-xs">
          <Field label="Protection rate (%)" hint="Applied to customer-entered declared value">
            <input
              type="number"
              step="0.1"
              className={input}
              value={pricing.declaredValuePercent}
              onChange={(e) =>
                setPricing({ ...pricing, declaredValuePercent: Number(e.target.value) })
              }
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Paintings & wall art</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["baseDeliveryCents", "Base delivery (¢)"],
              ["baseInstallCents", "Base installation (¢)"],
              ["wrappingFeeCents", "Wrapping fee (¢)"],
              ["removalFeeCents", "Removal fee (¢)"],
              ["oversizedDeliveryFeeCents", "Oversized delivery fee (¢)"],
              ["oversizedInstallFeeCents", "Oversized install fee (¢)"],
              ["framedBetween40And72PercentDelivery", "Framed 40–72% delivery"],
              ["framedBetween40And72PercentInstall", "Framed 40–72% install"],
              ["framed72to80PercentDelivery", "Framed 72–80% delivery"],
              ["framed72to80PercentInstall", "Framed 72–80% install"],
              ["eightyPlusPercentDelivery", "80\"+ % delivery"],
              ["eightyPlusPercentInstall", "80\"+ % install"],
              ["secondaryDimPercentDelivery", "Secondary dim % delivery"],
              ["secondaryDimPercentInstall", "Secondary dim % install"],
              ["oversizedMinInches", "Oversized min (inches)"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                type="number"
                className={input}
                value={pricing.painting[key]}
                onChange={(e) => patchPainting(key, Number(e.target.value))}
              />
            </Field>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Sculptures</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Footprint mid threshold (in)">
            <input
              type="number"
              className={input}
              value={pricing.sculpture.footprintMidInches}
              onChange={(e) =>
                patchSculpture("footprintMidInches", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Footprint mid %">
            <input
              type="number"
              className={input}
              value={pricing.sculpture.footprintMidPercent}
              onChange={(e) =>
                patchSculpture("footprintMidPercent", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Footprint large threshold (in)">
            <input
              type="number"
              className={input}
              value={pricing.sculpture.footprintLargeInches}
              onChange={(e) =>
                patchSculpture("footprintLargeInches", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Footprint large %">
            <input
              type="number"
              className={input}
              value={pricing.sculpture.footprintLargePercent}
              onChange={(e) =>
                patchSculpture("footprintLargePercent", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Wrapping fee (¢)">
            <input
              type="number"
              className={input}
              value={pricing.sculpture.wrappingFeeCents}
              onChange={(e) =>
                patchSculpture("wrappingFeeCents", Number(e.target.value))
              }
            />
          </Field>
        </div>
        <div className="mt-6">
          <p className="text-sm font-medium">Weight tiers (max lb → price ¢)</p>
          <div className="mt-3 space-y-2">
            {pricing.sculpture.weightTiers.map((tier, i) => (
              <div key={i} className="grid max-w-md grid-cols-2 gap-2">
                <input
                  type="number"
                  className={input}
                  value={tier.maxLb}
                  onChange={(e) => {
                    const weightTiers = [...pricing.sculpture.weightTiers];
                    weightTiers[i] = {
                      ...tier,
                      maxLb: Number(e.target.value),
                    };
                    setPricing({
                      ...pricing,
                      sculpture: { ...pricing.sculpture, weightTiers },
                    });
                  }}
                />
                <input
                  type="number"
                  className={input}
                  value={tier.priceCents}
                  onChange={(e) => {
                    const weightTiers = [...pricing.sculpture.weightTiers];
                    weightTiers[i] = {
                      ...tier,
                      priceCents: Number(e.target.value),
                    };
                    setPricing({
                      ...pricing,
                      sculpture: { ...pricing.sculpture, weightTiers },
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Alerts & photos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Exceptional dim (in)">
            <input
              type="number"
              className={input}
              value={pricing.alerts.exceptionalDimInches}
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  alerts: {
                    ...pricing.alerts,
                    exceptionalDimInches: Number(e.target.value),
                  },
                })
              }
            />
          </Field>
          <Field label="Exceptional weight (lb)">
            <input
              type="number"
              className={input}
              value={pricing.alerts.exceptionalWeightLb}
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  alerts: {
                    ...pricing.alerts,
                    exceptionalWeightLb: Number(e.target.value),
                  },
                })
              }
            />
          </Field>
          <Field label="High declared value ($)">
            <input
              type="number"
              className={input}
              value={pricing.alerts.highDeclaredValueDollars}
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  alerts: {
                    ...pricing.alerts,
                    highDeclaredValueDollars: Number(e.target.value),
                  },
                })
              }
            />
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pricing.photos.requireOnExceptional}
            onChange={(e) =>
              setPricing({
                ...pricing,
                photos: { requireOnExceptional: e.target.checked },
              })
            }
          />
          Require photos for exceptional / damage cases (enforced in rules helper)
        </label>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Furniture & décor base sheets</h2>
        <p className="mt-1 text-sm text-muted">
          Placeholder sheet prices (small / medium / large) in cents. Replace with production
          sheets when available.
        </p>
        <div className="mt-4 max-h-[420px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white text-xs uppercase text-muted">
              <tr>
                <th className="py-2 pr-2">Item</th>
                <th className="py-2 pr-2">Small</th>
                <th className="py-2 pr-2">Medium</th>
                <th className="py-2">Large</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(pricing.furniture).map(([name, vals]) => (
                <tr key={name} className="border-t border-black/5">
                  <td className="py-2 pr-2">{name}</td>
                  {(["small", "medium", "large"] as const).map((k) => (
                    <td key={k} className="py-2 pr-2">
                      <input
                        type="number"
                        className={input}
                        value={vals[k]}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            furniture: {
                              ...pricing.furniture,
                              [name]: { ...vals, [k]: Number(e.target.value) },
                            },
                          })
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
