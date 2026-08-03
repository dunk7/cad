"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CategoryId,
  DraftOrder,
  OrderItem,
  PriceResult,
} from "@/lib/ordering/types";
import { randomUUID } from "@/lib/ordering/id";
import { totalDeclaredValueDollars } from "@/lib/ordering/pricing";
import {
  DEFAULT_FLOOR_ACCESS,
  floorAccessLabel,
  isFloorAccess,
} from "@/lib/ordering/floorAccess";

const STORAGE_KEY = "cad_order_draft_v2";
const ALLOWED_CATEGORIES = new Set(["paintings", "sculptures", "furniture", "decor"]);

const emptyDraft = (): DraftOrder => ({
  categories: [],
  items: [],
  pickup: { state: "CA", phoneType: "cell", floorAccess: DEFAULT_FLOOR_ACCESS },
  delivery: { state: "CA", phoneType: "cell", floorAccess: DEFAULT_FLOOR_ACCESS },
  customer: {},
  declaredValueDollars: 0,
  declaredValueProtection: true,
  measureUnitDefault: "in",
  weightUnitDefault: "lb",
  termsAccepted: false,
});

function withDeclaredSum(d: DraftOrder): DraftOrder {
  return {
    ...d,
    declaredValueDollars: totalDeclaredValueDollars(d.items),
  };
}

function withDefaultState(
  loc: Partial<DraftOrder["pickup"]> | undefined,
  kind: "pickup" | "delivery"
): Partial<DraftOrder["pickup"]> {
  const floorAccess = isFloorAccess(loc?.floorAccess)
    ? loc.floorAccess
    : DEFAULT_FLOOR_ACCESS;
  return {
    ...loc,
    state: loc?.state?.trim() || "CA",
    phoneType: loc?.phoneType === "landline" ? "landline" : "cell",
    floorAccess,
    floor:
      loc?.floor?.trim() ||
      floorAccessLabel(
        floorAccess,
        kind,
        floorAccess === "level_3_plus" ? loc?.floorLevel : undefined
      ),
  };
}

function sanitizeDraft(parsed: Partial<DraftOrder>): DraftOrder {
  return withDeclaredSum({
    ...emptyDraft(),
    ...parsed,
    pickup: withDefaultState(parsed.pickup, "pickup"),
    delivery: withDefaultState(parsed.delivery, "delivery"),
    categories: (parsed.categories || []).filter((c) => ALLOWED_CATEGORIES.has(c)),
    items: (parsed.items || []).filter((i) => ALLOWED_CATEGORIES.has(i.category)),
    declaredValueProtection:
      typeof parsed.declaredValueProtection === "boolean"
        ? parsed.declaredValueProtection
        : true,
  });
}

type Ctx = {
  draft: DraftOrder;
  step: number;
  setStep: (n: number) => void;
  price: PriceResult | null;
  refreshPrice: () => Promise<void>;
  toggleCategory: (id: CategoryId) => void;
  setDraft: (updater: (d: DraftOrder) => DraftOrder) => void;
  addItem: (item: OrderItem) => void;
  updateItem: (id: string, item: OrderItem) => void;
  removeItem: (id: string) => void;
  reset: () => void;
  newItemId: () => string;
};

const OrderContext = createContext<Ctx | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<DraftOrder>(emptyDraft);
  const [step, setStep] = useState(0);
  const [price, setPrice] = useState<PriceResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setDraftState(sanitizeDraft(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const setDraft = useCallback((updater: (d: DraftOrder) => DraftOrder) => {
    setDraftState((d) => withDeclaredSum(updater(d)));
  }, []);

  const refreshPrice = useCallback(async () => {
    const res = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft }),
    });
    const data = await res.json();
    setPrice(data.pricing);
  }, [draft]);

  useEffect(() => {
    if (!hydrated) return;
    void refreshPrice();
  }, [draft.items, draft.declaredValueProtection, hydrated, refreshPrice]);

  const value = useMemo<Ctx>(
    () => ({
      draft,
      step,
      setStep,
      price,
      refreshPrice,
      toggleCategory: (id) => {
        if (!ALLOWED_CATEGORIES.has(id)) return;
        setDraft((d) => ({
          ...d,
          categories: d.categories.includes(id)
            ? d.categories.filter((c) => c !== id)
            : [...d.categories.filter((c) => ALLOWED_CATEGORIES.has(c)), id],
        }));
      },
      setDraft,
      addItem: (item) =>
        setDraft((d) => ({ ...d, items: [...d.items, item] })),
      updateItem: (id, item) =>
        setDraft((d) => ({
          ...d,
          items: d.items.map((i) => (i.id === id ? item : i)),
        })),
      removeItem: (id) =>
        setDraft((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) })),
      reset: () => {
        setDraftState(emptyDraft());
        sessionStorage.removeItem(STORAGE_KEY);
        setStep(0);
      },
      newItemId: () => randomUUID(),
    }),
    [draft, step, price, refreshPrice, setDraft]
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted">
        Loading…
      </div>
    );
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
