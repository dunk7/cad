"use client";

import type { RouteSlot } from "@/lib/ordering/defaults";
import { useEffect, useState } from "react";

const input =
  "w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black";

export default function RoutesEditor() {
  const [routes, setRoutes] = useState<RouteSlot[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    void fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => setRoutes(d.routes || []));
  }, []);

  async function save() {
    setStatus("saving");
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routes }),
    });
    setStatus(res.ok ? "saved" : "error");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Route dates</h1>
          <p className="mt-1 text-sm text-muted">
            Placeholder availability until full statewide route logic (Part 3) is added.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status === "saved" && <span className="text-sm text-emerald-700">Saved</span>}
          <button
            type="button"
            onClick={() =>
              setRoutes((r) => [
                ...r,
                {
                  id: `r${Date.now()}`,
                  pickupDate: "",
                  deliveryDate: "",
                  label: "New route window",
                },
              ])
            }
            className="border border-black/20 px-4 py-2 text-sm hover:border-black"
          >
            Add slot
          </button>
          <button
            type="button"
            onClick={() => void save()}
            className="border border-black bg-black px-5 py-2 text-sm text-white hover:bg-white hover:text-black"
          >
            {status === "saving" ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {routes.map((slot, i) => (
          <div
            key={slot.id}
            className="grid gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-sm md:grid-cols-4"
          >
            <input
              className={input}
              value={slot.label}
              onChange={(e) => {
                const next = [...routes];
                next[i] = { ...slot, label: e.target.value };
                setRoutes(next);
              }}
              placeholder="Label"
            />
            <input
              type="date"
              className={input}
              value={slot.pickupDate}
              onChange={(e) => {
                const next = [...routes];
                next[i] = { ...slot, pickupDate: e.target.value };
                setRoutes(next);
              }}
            />
            <input
              type="date"
              className={input}
              value={slot.deliveryDate}
              onChange={(e) => {
                const next = [...routes];
                next[i] = { ...slot, deliveryDate: e.target.value };
                setRoutes(next);
              }}
            />
            <button
              type="button"
              className="border border-black/15 text-sm text-red-700 hover:border-red-700"
              onClick={() => setRoutes(routes.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
