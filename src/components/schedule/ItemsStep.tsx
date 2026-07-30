"use client";

import { CATEGORIES } from "@/lib/ordering/catalog";
import { useOrder } from "@/lib/ordering/OrderContext";
import type { CategoryId, OrderItem } from "@/lib/ordering/types";
import { useMemo, useState } from "react";
import ItemForm from "./ItemForm";

function itemLabel(item: OrderItem) {
  if (item.category === "paintings") {
    if (item.pieceType === "Other wall art" && item.pieceDescription) {
      return item.pieceDescription;
    }
    return item.pieceType;
  }
  if (item.category === "sculptures") return item.description;
  if (item.category === "furniture" || item.category === "decor") return item.itemName;
  return item.description;
}

export default function ItemsStep() {
  const { draft, setStep, addItem, updateItem, removeItem, setDraft } = useOrder();
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(
    draft.categories[0] || null
  );
  const [editing, setEditing] = useState<OrderItem | null>(null);
  const [adding, setAdding] = useState(() => {
    const first = draft.categories[0];
    if (!first) return false;
    return !draft.items.some((i) => i.category === first);
  });

  const categoryItems = useMemo(
    () => draft.items.filter((i) => i.category === activeCategory),
    [draft.items, activeCategory]
  );

  function selectCategory(id: CategoryId) {
    setActiveCategory(id);
    setEditing(null);
    const hasItems = draft.items.some((i) => i.category === id);
    setAdding(!hasItems);
  }

  if (!draft.categories.length) {
    return (
      <div className="text-center">
        <p className="text-muted">Select at least one category first.</p>
        <button type="button" className="mt-4 underline" onClick={() => setStep(0)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Enter each item
      </h1>
      <p className="mt-2 text-center text-muted">
        Add items one at a time. You can edit or remove anything before continuing.
      </p>

      {draft.categories.length === 1 ? (
        <p className="mt-6 text-center text-sm text-muted">
          Adding items for{" "}
          <span className="font-medium text-foreground">
            {CATEGORIES.find((c) => c.id === draft.categories[0])?.name}
          </span>
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 border-b border-black/10 pb-3">
          {draft.categories.map((id) => {
            const cat = CATEGORIES.find((c) => c.id === id)!;
            const count = draft.items.filter((i) => i.category === id).length;
            const active = activeCategory === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectCategory(id)}
                className={`border-0 bg-transparent px-0 pb-2 text-sm ${
                  active
                    ? "border-b-2 border-black font-medium text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {cat.name}
                {count ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      )}

      {activeCategory && !adding && !editing && categoryItems.length > 0 && (
        <div className="mt-8 space-y-4">
          {categoryItems.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 border border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {CATEGORIES.find((c) => c.id === item.category)?.name} {idx + 1} of{" "}
                  {categoryItems.length}
                </p>
                <p className="text-sm text-muted">
                  {itemLabel(item)} · {item.width || "—"}×{item.height || "—"}{" "}
                  {item.measureUnit}
                  {item.weight != null ? ` · ~${item.weight} lbs` : ""}
                  {"install" in item && item.install ? " · Installation" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="border border-black/20 px-3 py-1.5 text-sm hover:border-black"
                  onClick={() => setEditing(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="border border-black/20 px-3 py-1.5 text-sm text-red-700 hover:border-red-700"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full border border-dashed border-black/30 py-4 text-sm font-medium hover:border-black"
          >
            Add Another Item
          </button>
        </div>
      )}

      {activeCategory && (adding || editing) && (
        <div className="mt-8">
          <ItemForm
            category={activeCategory}
            initial={editing || undefined}
            onCancel={() => {
              setEditing(null);
              setAdding(categoryItems.length === 0);
            }}
            onSave={(item) => {
              setDraft((d) => ({
                ...d,
                measureUnitDefault: item.measureUnit,
                weightUnitDefault: "lb",
              }));
              if (editing) updateItem(item.id, item);
              else addItem(item);
              setAdding(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <div className="mt-10 flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep(0)}
          className="border border-black/20 px-6 py-3 text-sm hover:border-black"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!draft.items.length}
          onClick={() => setStep(2)}
          className="border border-black bg-black px-8 py-3 text-sm font-medium text-white hover:bg-white hover:text-black disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
