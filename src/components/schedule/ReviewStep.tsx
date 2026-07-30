"use client";

import { formatCents } from "@/lib/money";
import { useOrder } from "@/lib/ordering/OrderContext";
import { useState } from "react";

export default function ReviewStep() {
  const { draft, setDraft, setStep, price } = useOrder();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setError("");
    if (!draft.termsAccepted) {
      setError("Please accept the terms to continue.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Review Your Order
      </h1>

      <div className="mx-auto mt-8 max-w-2xl space-y-6">
        <section className="border border-black/10 p-4">
          <h2 className="font-medium">Items ({draft.items.length})</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {draft.items.map((item) => (
              <li key={item.id}>
                {item.category} · qty {item.quantity}
                {item.width != null && item.height != null
                  ? ` · ${item.width}×${item.height} ${item.measureUnit}`
                  : ""}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="border border-black/10 p-4 text-sm">
            <h2 className="font-medium">Pickup</h2>
            <p className="mt-2 text-muted">
              {draft.pickup.name}
              <br />
              {draft.pickup.address1}
              <br />
              {draft.pickup.city}, {draft.pickup.state} {draft.pickup.zip}
            </p>
          </div>
          <div className="border border-black/10 p-4 text-sm">
            <h2 className="font-medium">Delivery</h2>
            <p className="mt-2 text-muted">
              {draft.delivery.name}
              <br />
              {draft.delivery.address1}
              <br />
              {draft.delivery.city}, {draft.delivery.state} {draft.delivery.zip}
            </p>
          </div>
        </section>

        <section className="border border-black/10 p-4 text-sm">
          <h2 className="font-medium">Schedule</h2>
          <p className="mt-2 text-muted">
            {draft.schedule?.label}
            <br />
            Pickup {draft.schedule?.pickupDate} → Delivery {draft.schedule?.deliveryDate}
          </p>
        </section>

        <section className="border border-black/10 p-4">
          <h2 className="font-medium">Price</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {price?.lines.map((l, i) => (
              <li key={l.code + i} className="flex justify-between gap-4">
                <span>{l.label}</span>
                <span>{formatCents(l.amountCents)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCents(price?.totalCents || 0)}</span>
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Pricing is based on the information provided. California Art Delivery may request
            additional information or revise pricing if the actual item, access conditions,
            installation requirements, or scope materially differ from the submitted details.
          </p>
        </section>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={draft.termsAccepted}
            onChange={(e) =>
              setDraft((d) => ({ ...d, termsAccepted: e.target.checked }))
            }
          />
          <span>
            I agree to the{" "}
            <a href="/terms" className="underline" target="_blank">
              Terms of Service
            </a>{" "}
            and understand payment is required to confirm this order.
          </span>
        </label>

        <div className="rounded-lg border border-black/10 bg-[#f7f7f7] p-4">
          <p className="font-medium">Pay by bank (ACH)</p>
          <p className="mt-1 text-sm text-muted">
            Bank transfer is our preferred payment method. Card is available as a secondary
            option at checkout.
          </p>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>

      <div className="mt-10 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(4)}
          className="border border-black/20 px-6 py-3 text-sm hover:border-black"
        >
          Back
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void pay()}
          className="border border-black bg-black px-8 py-3 text-sm font-medium text-white hover:bg-white hover:text-black disabled:opacity-50"
        >
          {busy ? "Redirecting…" : "Pay & Confirm"}
        </button>
      </div>
    </div>
  );
}
