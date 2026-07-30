"use client";

import { CATEGORIES } from "@/lib/ordering/catalog";
import { useOrder } from "@/lib/ordering/OrderContext";
import type { CategoryId, OrderItem } from "@/lib/ordering/types";
import { useEffect, useMemo, useState } from "react";
import ItemForm from "./ItemForm";

const VALID_IDS = new Set(CATEGORIES.map((c) => c.id));

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

  const selectedCategories = useMemo(
    () => draft.categories.filter((id) => VALID_IDS.has(id as (typeof CATEGORIES)[number]["id"])),
    [draft.categories]
  );

  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(
    selectedCategories[0] || null
  );
  const [editing, setEditing] = useState<OrderItem | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (
      !activeCategory ||
      !VALID_IDS.has(activeCategory as (typeof CATEGORIES)[number]["id"])
    ) {
      setActiveCategory(selectedCategories[0] || null);
      setAdding(false);
      setEditing(null);
    }
  }, [activeCategory, selectedCategories]);

  const categoryItems = useMemo(
    () => draft.items.filter((i) => i.category === activeCategory),
    [draft.items, activeCategory]
  );

  const allItems = useMemo(
    () => draft.items.filter((i) => VALID_IDS.has(i.category as (typeof CATEGORIES)[number]["id"])),
    [draft.items]
  );

  function selectCategory(id: CategoryId) {
    setActiveCategory(id);
    setEditing(null);
    setAdding(false);
  }

  if (!selectedCategories.length) {
    return (
      <div className="text-center">
        <p className="text-muted">Select at least one category first.</p>
        <button type="button" className="mt-4 underline" onClick={() => setStep(0)}>
          Back
        </button>
      </div>
    );
  }

  const activeMeta = CATEGORIES.find((c) => c.id === activeCategory);
  const showList = activeCategory && activeMeta && !adding && !editing;

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Your items
      </h1>
      <p className="mx-auto mt-2 max-w-md text-center text-muted">
        Add each piece separately. You can include as many items as you need before
        continuing.
      </p>

      {selectedCategories.length === 1 ? (
        <p className="mt-6 text-center text-sm text-muted">
          Category:{" "}
          <span className="font-medium text-foreground">
            {CATEGORIES.find((c) => c.id === selectedCategories[0])?.name}
          </span>
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 border-b border-black/10 pb-3">
          {selectedCategories.map((id) => {
            const cat = CATEGORIES.find((c) => c.id === id);
            if (!cat) return null;
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

      {showList && categoryItems.length === 0 && (
        <div className="mt-10 flex flex-col items-center border border-dashed border-black/20 px-6 py-12 text-center">
          <p className="text-base font-medium text-foreground">No items yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            {activeCategory === "paintings"
              ? "Add your first painting or wall art piece."
              : activeCategory === "sculptures"
                ? "Add your first sculpture."
                : activeCategory === "furniture"
                  ? "Add your first furniture piece."
                  : "Add your first décor piece."}{" "}
            You can come back and add more afterward.
          </p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-6 bg-black px-8 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Add an Item
          </button>
          {allItems.length > 0 && (
            <p className="mt-4 text-xs text-muted">
              {allItems.length} item{allItems.length === 1 ? "" : "s"} already added in other
              categories
            </p>
          )}
        </div>
      )}

      {showList && categoryItems.length > 0 && (
        <div className="mt-8 space-y-4">
          {categoryItems.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 border border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {activeMeta.name} {idx + 1} of {categoryItems.length}
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

      {activeCategory && activeMeta && (adding || editing) && (
        <div className="mt-8">
          <ItemForm
            category={activeCategory}
            initial={editing || undefined}
            onCancel={() => {
              setEditing(null);
              setAdding(false);
            }}
            onSave={(item) => {
              setDraft((d) => ({
                ...d,
                measureUnitDefault: "in",
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
          disabled={!allItems.length || adding || !!editing}
          onClick={() => setStep(2)}
          className="border border-black bg-black px-8 py-3 text-sm font-medium text-white hover:bg-white hover:text-black disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
