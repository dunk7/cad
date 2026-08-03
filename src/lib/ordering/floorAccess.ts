import type { FloorAccess } from "@/lib/ordering/types";

export const DEFAULT_FLOOR_ACCESS: FloorAccess = "first_no_steps";

export const FLOOR_LEVELS = Array.from({ length: 28 }, (_, i) => i + 3); // 3–30

export function floorAccessOptions(kind: "pickup" | "delivery"): {
  value: FloorAccess;
  label: string;
}[] {
  const place = kind === "pickup" ? "pickup" : "delivery";
  return [
    {
      value: "first_no_steps",
      label: `First floor / ground level ${place} (no steps)`,
    },
    {
      value: "first_few_steps",
      label: `First floor / ground level ${place} (1–5 steps)`,
    },
    {
      value: "second",
      label: `Second floor ${place}`,
    },
    {
      value: "level_3_plus",
      label: `Level 3+ ${place}`,
    },
  ];
}

export function floorAccessLabel(
  access: FloorAccess | undefined,
  kind: "pickup" | "delivery",
  floorLevel?: number
) {
  const opts = floorAccessOptions(kind);
  const opt = opts.find((o) => o.value === (access || DEFAULT_FLOOR_ACCESS));
  const base = opt?.label || opts[0].label;
  if (access === "level_3_plus" && floorLevel != null) {
    return `${base} · Floor ${floorLevel}`;
  }
  return base;
}

export function needsStairsFlights(access: FloorAccess | undefined) {
  const a = access || DEFAULT_FLOOR_ACCESS;
  return a !== "first_no_steps" && a !== "first_few_steps";
}

export function needsFloorLevel(access: FloorAccess | undefined) {
  return (access || DEFAULT_FLOOR_ACCESS) === "level_3_plus";
}

export function isFloorAccess(value: unknown): value is FloorAccess {
  return (
    value === "first_no_steps" ||
    value === "first_few_steps" ||
    value === "second" ||
    value === "level_3_plus"
  );
}
