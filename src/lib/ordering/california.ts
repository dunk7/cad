import {
  isOutOfRouteRegion,
  regionForZip,
} from "@/lib/ordering/routeCalendar";

/** Normalize and detect California for pickup/delivery eligibility. */
export function isCaliforniaState(state: string | undefined | null): boolean {
  const normalized = (state || "").trim().toLowerCase().replace(/\./g, "");
  if (!normalized) return true; // empty defaults to CA in the wizard
  return (
    normalized === "ca" ||
    normalized === "calif" ||
    normalized === "california"
  );
}

/** Instant pricing / checkout only when both ends are in California. */
export function isCaliforniaRoute(
  pickupState: string | undefined | null,
  deliveryState: string | undefined | null
): boolean {
  return isCaliforniaState(pickupState) && isCaliforniaState(deliveryState);
}

/** ZIP is outside the two-week route footprint (north of Tahoe, east of Fresno, etc.). */
export function isOutOfRouteZip(zip: string | undefined | null): boolean {
  return isOutOfRouteRegion(regionForZip(zip));
}

/**
 * Needs a custom quote / contact-us flow: non-CA ends, or either ZIP is
 * outside regular route coverage.
 */
export function requiresManualQuote(
  pickupState: string | undefined | null,
  deliveryState: string | undefined | null,
  pickupZip?: string | undefined | null,
  deliveryZip?: string | undefined | null
): boolean {
  if (!isCaliforniaRoute(pickupState, deliveryState)) return true;
  if (pickupZip && isOutOfRouteZip(pickupZip)) return true;
  if (deliveryZip && isOutOfRouteZip(deliveryZip)) return true;
  return false;
}
