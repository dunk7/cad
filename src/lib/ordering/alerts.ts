import type { PricingConfig } from "./defaults";
import type { DraftOrder, OrderItem } from "./types";

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

export function evaluateAlerts(
  draft: DraftOrder,
  cfg: PricingConfig,
  opts?: { dedicatedTrip?: boolean }
): string[] {
  const alerts = new Set<string>();

  if (opts?.dedicatedTrip) alerts.add("Dedicated-trip request");
  const declaredTotal = draft.items.reduce(
    (sum, item) => sum + Math.max(0, Number(item.declaredValueDollars) || 0),
    0
  );
  if (declaredTotal >= cfg.alerts.highDeclaredValueDollars) {
    alerts.add("Very high declared value");
  }

  for (const item of draft.items) {
    const h = toInches(item.height, item.measureUnit);
    const w = toInches(item.width, item.measureUnit);
    const d = toInches(item.depth, item.measureUnit);
    const largest = Math.max(h, w, d);
    const weight =
      item.weightUnit === "unsure" ? null : toLb(item.weight, item.weightUnit);

    if (largest >= cfg.alerts.exceptionalDimInches) {
      alerts.add("Exceptional dimensions");
    }
    if (weight != null && weight >= cfg.alerts.exceptionalWeightLb) {
      alerts.add("Exceptional weight");
    }
    if (item.weightUnit === "unsure" && largest >= 48) {
      alerts.add("Unknown weight on a large item");
    }
    if (item.existingDamage === "yes") alerts.add("Existing damage");

    if (item.category === "paintings") {
      const p = item;
      if (p.frameCharacteristics?.some((c) =>
        ["Fragile", "Delicate", "Ornate"].includes(c)
      )) {
        alerts.add("Fragility");
      }
      if (p.install && p.wallMaterial === "Not sure") {
        alerts.add("Unknown wall material");
      }
      if (
        p.install &&
        (p.installLocation === "Above standard gallery level" ||
          p.installLocation === "In a stairwell" ||
          p.aboveStairs === "Yes")
      ) {
        alerts.add("Difficult installation");
      }
      if (p.obstacleBeneath) alerts.add("Complex access");
    }

    if (item.category === "sculptures") {
      if (
        item.components &&
        item.components !== "No" &&
        item.components !== "Not sure"
      ) {
        alerts.add("Multi-piece sculpture");
      }
      if (
        item.handling?.some((h) =>
          ["Fragile or delicate", "Top-heavy", "Cannot be tilted"].includes(h)
        )
      ) {
        alerts.add("Fragility");
      }
    }

    if (item.category === "other") {
      alerts.add("Unusual furniture or décor item");
    }

    if (item.category === "furniture" && item.itemName === "Other furniture") {
      alerts.add("Unusual furniture or décor item");
    }
  }

  return Array.from(alerts);
}

export function photosRequired(item: OrderItem, cfg: PricingConfig) {
  if (!cfg.photos.requireOnExceptional) return false;
  const h = toInches(item.height, item.measureUnit);
  const w = toInches(item.width, item.measureUnit);
  const largest = Math.max(h, w, toInches(item.depth, item.measureUnit));
  if (largest >= cfg.alerts.exceptionalDimInches) return true;
  if (item.existingDamage === "yes") return true;
  if (item.category === "sculptures" && item.weightUnit === "unsure") return true;
  return false;
}
