"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/ordering/catalog";
import { useOrder } from "@/lib/ordering/OrderContext";
import type { CategoryId, OrderItem } from "@/lib/ordering/types";
import { useMemo, useState } from "react";
import ItemForm from "./ItemForm";

const VALID_IDS = new Set<CategoryId>(CATEGORIES.map((c) => c.id));

function itemLabel(item: OrderItem) {
  if (item.category === "paintings") {
    if (item.pieceType === "Other wall art" && item.pieceDescription) {
      return item.pieceDescription;
    }
    if (!item.pieceType || item.pieceType === "Painting or framed artwork") {
      return "Painting";
    }
    if (item.pieceType === "Other wall art") return "Wall art";
    return item.pieceType;
  }
  if (item.category === "sculptures") return item.description;
  if (item.category === "furniture" || item.category === "decor") return item.itemName;
  return item.description;
}

type Mode = "list" | "pickCategory" | "form";

export default function ItemsStep() {
  const { draft, setStep, addItem, updateItem, removeItem, setDraft } = useOrder();
  const [mode, setMode] = useState<Mode>("list");
  const [formCategory, setFormCategory] = useState<CategoryId | null>(null);
  const [editing, setEditing] = useState<OrderItem | null>(null);

  const allItems = useMemo(
    () => draft.items.filter((i) => VALID_IDS.has(i.category as CategoryId)),
    [draft.items]
  );

  function startAdd() {
    setEditing(null);
    setFormCategory(null);
    setMode("pickCategory");
  }

  function pickCategory(id: CategoryId) {
    setFormCategory(id);
    setEditing(null);
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(id) ? d.categories : [...d.categories, id],
    }));
    setMode("form");
  }

  function startEdit(item: OrderItem) {
    setEditing(item);
    setFormCategory(item.category);
    setMode("form");
  }

  function cancelForm() {
    setEditing(null);
    setFormCategory(null);
    setMode("list");
  }

  return (
    <div>
      {mode === "list" && (
        <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Your items
        </h1>
      )}

      {mode === "pickCategory" && (
        <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Add an item
        </h1>
      )}

      {mode === "form" && formCategory && (
        <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {editing ? "Edit item" : "Item details"}
        </h1>
      )}

      {mode === "list" && allItems.length === 0 && (
        <div className="mt-10 flex flex-col items-center border border-dashed border-black/20 px-6 py-12 text-center">
          <p className="text-base font-medium text-foreground">No items yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Add your first piece. You can come back and add more afterward.
          </p>
          <button
            type="button"
            onClick={startAdd}
            className="mt-6 bg-black px-8 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Add an Item
          </button>
        </div>
      )}

      {mode === "list" && allItems.length > 0 && (
        <div className="mt-8 space-y-4">
          {allItems.map((item, idx) => {
            const catName = CATEGORIES.find((c) => c.id === item.category)?.name || item.category;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 border border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    Item {idx + 1} of {allItems.length}
                    <span className="font-normal text-muted"> · {catName}</span>
                  </p>
                  <p className="text-sm text-muted">
                    {itemLabel(item)} · {item.width || "—"}×{item.height || "—"} in
                    {item.weight != null ? ` · ~${item.weight} lbs` : ""}
                    {item.declaredValueDollars
                      ? ` · Declared $${Number(item.declaredValueDollars).toLocaleString()}`
                      : ""}
                    {"install" in item && item.install ? " · Installation" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="border border-black/20 px-3 py-1.5 text-sm hover:border-black"
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="border border-red-600 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={startAdd}
            className="w-full border border-dashed border-black/30 py-4 text-sm font-medium hover:border-black"
          >
            Add Another Item
          </button>
        </div>
      )}

      {mode === "pickCategory" && (
        <div className="mx-auto mt-8 max-w-3xl">
          <p className="text-center text-sm text-muted">
            What type of item are you adding?
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => pickCategory(cat.id)}
                className="group relative aspect-[4/3] overflow-hidden text-left outline-none transition duration-300 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.28)]"
              >
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  className={`object-cover transition duration-500 ease-out group-hover:scale-[1.04] ${
                    cat.id === "paintings" ? "object-center" : ""
                  }`}
                  sizes="(min-width: 640px) 40vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5 transition duration-300 group-hover:from-black/80" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-5">
                  <span className="block text-[12px] font-medium leading-snug tracking-tight text-white sm:text-lg">
                    {cat.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={cancelForm}
              className="border border-black/20 px-6 py-2.5 text-sm hover:border-black"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === "form" && formCategory && (
        <div className="mt-8">
          {formCategory !== "paintings" && (
            <p className="mb-4 text-center text-sm text-muted">
              {CATEGORIES.find((c) => c.id === formCategory)?.name}
            </p>
          )}
          <ItemForm
            key={editing?.id || `new-${formCategory}`}
            category={formCategory}
            initial={editing || undefined}
            onCancel={cancelForm}
            onSave={(item) => {
              setDraft((d) => ({
                ...d,
                measureUnitDefault: "in",
                weightUnitDefault: "lb",
                categories: d.categories.includes(item.category)
                  ? d.categories
                  : [...d.categories, item.category],
              }));
              if (editing) updateItem(item.id, item);
              else addItem(item);
              setEditing(null);
              setFormCategory(null);
              setMode("list");
            }}
          />
        </div>
      )}

      {mode === "list" && (
        <div className="mt-10 flex justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center border border-black/20 px-6 py-3 text-sm hover:border-black"
          >
            Back
          </Link>
          <button
            type="button"
            disabled={!allItems.length}
            onClick={() => setStep(1)}
            className="border border-black bg-black px-8 py-3 text-sm font-medium text-white hover:bg-white hover:text-black disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
