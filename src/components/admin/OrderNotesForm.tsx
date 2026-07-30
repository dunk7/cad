"use client";

import { useState } from "react";

export default function OrderNotesForm({
  id,
  initial,
}: {
  id: string;
  initial: string;
}) {
  const [notes, setNotes] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setStatus("saving");
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, internalNotes: notes }),
    });
    setStatus(res.ok ? "saved" : "error");
  }

  return (
    <div>
      <textarea
        className="w-full border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
        rows={4}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          className="border border-black bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black"
        >
          {status === "saving" ? "Saving…" : "Save notes"}
        </button>
        {status === "saved" && <span className="text-xs text-emerald-700">Saved</span>}
        {status === "error" && <span className="text-xs text-red-700">Error</span>}
      </div>
    </div>
  );
}
