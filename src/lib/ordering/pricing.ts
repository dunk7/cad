import type { PricingConfig } from "./defaults";
import type {
  DraftOrder,
  FurnitureItem,
  OrderItem,
  PaintingItem,
  PriceLine,
  PriceResult,
  SculptureItem,
} from "./types";

function toInches(value: number | undefined, unit: string) {
  if (value == null || Number.isNaN(value)) return 0;
  if (unit === "ft") return value * 12;
  if (unit === "cm") return value / 2.54;
  return value;
}

function toLb(value: number | undefined, unit: string) {
  if (value == null || Number.isNaN(value)) return 0;
  if (unit === "kg") return value * 2.20462;
  return value;
}

function sizeKey(size?: string): "small" | "medium" | "large" {
  const s = (size || "").toLowerCase();
  if (s.includes("small")) return "small";
  if (s.includes("large")) return "large";
  return "medium";
}

function pct(amount: number, percent: number) {
  return Math.round((amount * percent) / 100);
}

function pricePainting(item: PaintingItem, cfg: PricingConfig): PriceLine[] {
  const lines: PriceLine[] = [];
  const qty = Math.max(1, item.quantity || 1);
  let delivery = cfg.painting.baseDeliveryCents * qty;
  let install = item.install ? cfg.painting.baseInstallCents * qty : 0;

  const h = toInches(item.height, item.measureUnit);
  const w = toInches(item.width, item.measureUnit);
  const largest = Math.max(h, w);
  const other = Math.min(h, w);
  const framed = item.framed === "yes";

  // Stacking sequence (documented):
  // 1) base delivery/install
  // 2) framed 40–72 %
  // 3) oversized fixed fees at >=72
  // 4) framed 72–80 %
  // 5) 80+ %
  // 6) secondary dimension %
  // 7) wrapping / removal

  if (framed && largest >= 40 && largest < 72) {
    delivery += pct(delivery, cfg.painting.framedBetween40And72PercentDelivery);
    if (install)
      install += pct(install, cfg.painting.framedBetween40And72PercentInstall);
  }

  if (largest >= cfg.painting.oversizedMinInches) {
    delivery += cfg.painting.oversizedDeliveryFeeCents * qty;
    if (install) install += cfg.painting.oversizedInstallFeeCents * qty;
  }

  if (framed && largest >= 72 && largest < 80) {
    delivery += pct(delivery, cfg.painting.framed72to80PercentDelivery);
    if (install)
      install += pct(install, cfg.painting.framed72to80PercentInstall);
  }

  if (largest >= 80) {
    delivery += pct(delivery, cfg.painting.eightyPlusPercentDelivery);
    if (install) install += pct(install, cfg.painting.eightyPlusPercentInstall);
  }

  if (
    largest >= cfg.painting.secondaryDimThresholdPrimary &&
    other > cfg.painting.secondaryDimThresholdOther
  ) {
    delivery += pct(delivery, cfg.painting.secondaryDimPercentDelivery);
    if (install)
      install += pct(install, cfg.painting.secondaryDimPercentInstall);
  }

  lines.push({
    code: "painting_delivery",
    label: `Painting delivery (${qty})`,
    amountCents: delivery,
  });
  if (install) {
    lines.push({
      code: "painting_install",
      label: `Painting installation (${qty})`,
      amountCents: install,
    });
  }
  if (item.wrappingRequested) {
    lines.push({
      code: "painting_wrap",
      label: "Wrapping & protection",
      amountCents: cfg.painting.wrappingFeeCents * qty,
    });
  }
  if (item.removeFromWall) {
    lines.push({
      code: "painting_removal",
      label: "Wall removal",
      amountCents: cfg.painting.removalFeeCents * qty,
    });
  }
  return lines;
}

function priceSculpture(item: SculptureItem, cfg: PricingConfig): PriceLine[] {
  const lines: PriceLine[] = [];
  const qty = Math.max(1, item.quantity || 1);
  const weightLb =
    item.weightUnit === "unsure"
      ? 75
      : toLb(item.weight, item.weightUnit) || 50;
  const tier =
    cfg.sculpture.weightTiers.find((t) => weightLb <= t.maxLb) ||
    cfg.sculpture.weightTiers[cfg.sculpture.weightTiers.length - 1];
  let base = tier.priceCents * qty;

  const width = toInches(item.width, item.measureUnit);
  const depth = toInches(item.depth, item.measureUnit);
  const footprint = Math.max(width, depth);
  if (footprint > cfg.sculpture.footprintLargeInches) {
    base += pct(base, cfg.sculpture.footprintLargePercent);
  } else if (footprint > cfg.sculpture.footprintMidInches) {
    base += pct(base, cfg.sculpture.footprintMidPercent);
  }

  lines.push({
    code: "sculpture",
    label: `Sculpture transport (${item.description || "sculpture"})`,
    amountCents: base,
  });
  if (item.wrappingRequested) {
    lines.push({
      code: "sculpture_wrap",
      label: "Sculpture wrapping",
      amountCents: cfg.sculpture.wrappingFeeCents * qty,
    });
  }
  return lines;
}

function priceNamed(
  name: string,
  sizeClass: string | undefined,
  qty: number,
  table: Record<string, { small: number; medium: number; large: number }>,
  wrap: boolean,
  wrapFee: number,
  labelPrefix: string
): PriceLine[] {
  const entry = table[name] || Object.values(table)[0];
  const key = sizeKey(sizeClass);
  const amount = (entry?.[key] || 20000) * Math.max(1, qty);
  const lines: PriceLine[] = [
    {
      code: `${labelPrefix}_base`,
      label: `${name} (${key}, qty ${qty})`,
      amountCents: amount,
    },
  ];
  if (wrap) {
    lines.push({
      code: `${labelPrefix}_wrap`,
      label: "Wrapping & protection",
      amountCents: wrapFee * Math.max(1, qty),
    });
  }
  return lines;
}

export function priceItem(item: OrderItem, cfg: PricingConfig): PriceLine[] {
  switch (item.category) {
    case "paintings":
      return pricePainting(item, cfg);
    case "sculptures":
      return priceSculpture(item, cfg);
    case "furniture":
      return priceNamed(
        (item as FurnitureItem).itemName || "Other furniture",
        (item as FurnitureItem).sizeClass,
        item.quantity,
        cfg.furniture,
        Boolean(item.wrappingRequested),
        cfg.wrappingDefaultCents,
        "furniture"
      );
    case "decor":
      return priceNamed(
        item.itemName || "Other Décor",
        item.sizeClass,
        item.quantity,
        cfg.decor,
        Boolean(item.wrappingRequested),
        cfg.wrappingDefaultCents,
        "decor"
      );
    case "other":
    default: {
      const qty = Math.max(1, item.quantity || 1);
      const lines: PriceLine[] = [
        {
          code: "other",
          label: "General item transport",
          amountCents: cfg.otherBaseCents * qty,
        },
      ];
      if (item.wrappingRequested) {
        lines.push({
          code: "other_wrap",
          label: "Wrapping & protection",
          amountCents: cfg.wrappingDefaultCents * qty,
        });
      }
      return lines;
    }
  }
}

export function calculatePrice(
  draft: Pick<DraftOrder, "items" | "declaredValueDollars">,
  cfg: PricingConfig
): PriceResult {
  const lines: PriceLine[] = [];
  for (const item of draft.items) {
    lines.push(...priceItem(item, cfg));
  }
  const declared = Math.max(0, draft.declaredValueDollars || 0);
  if (declared > 0 && cfg.declaredValuePercent > 0) {
    lines.push({
      code: "declared_value",
      label: `Declared value protection (${cfg.declaredValuePercent}%)`,
      amountCents: Math.round(declared * (cfg.declaredValuePercent / 100) * 100),
    });
  }
  const subtotalCents = lines.reduce((s, l) => s + l.amountCents, 0);
  return { lines, subtotalCents, totalCents: subtotalCents };
}
