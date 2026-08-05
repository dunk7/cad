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

export function requiresManualQuote(
  pickupState: string | undefined | null,
  deliveryState: string | undefined | null
): boolean {
  return !isCaliforniaRoute(pickupState, deliveryState);
}
