export type PricingConfig = {
  declaredValuePercent: number;
  painting: {
    framedBetween40And72PercentDelivery: number;
    framedBetween40And72PercentInstall: number;
    oversizedMinInches: number;
    oversizedDeliveryFeeCents: number;
    oversizedInstallFeeCents: number;
    framed72to80PercentDelivery: number;
    framed72to80PercentInstall: number;
    eightyPlusPercentDelivery: number;
    eightyPlusPercentInstall: number;
    secondaryDimThresholdPrimary: number;
    secondaryDimThresholdOther: number;
    secondaryDimPercentDelivery: number;
    secondaryDimPercentInstall: number;
    baseDeliveryCents: number;
    baseInstallCents: number;
    wrappingFeeCents: number;
    removalFeeCents: number;
  };
  sculpture: {
    weightTiers: { maxLb: number; priceCents: number }[];
    footprintMidInches: number;
    footprintLargeInches: number;
    footprintMidPercent: number;
    footprintLargePercent: number;
    wrappingFeeCents: number;
  };
  furniture: Record<string, { small: number; medium: number; large: number }>;
  decor: Record<string, { small: number; medium: number; large: number }>;
  otherBaseCents: number;
  wrappingDefaultCents: number;
  alerts: {
    exceptionalDimInches: number;
    exceptionalWeightLb: number;
    highDeclaredValueDollars: number;
  };
  photos: {
    requireOnExceptional: boolean;
  };
};

export const defaultPricingConfig: PricingConfig = {
  declaredValuePercent: 1.5,
  painting: {
    framedBetween40And72PercentDelivery: 10,
    framedBetween40And72PercentInstall: 10,
    oversizedMinInches: 72,
    oversizedDeliveryFeeCents: 10000,
    oversizedInstallFeeCents: 20000,
    framed72to80PercentDelivery: 20,
    framed72to80PercentInstall: 30,
    eightyPlusPercentDelivery: 15,
    eightyPlusPercentInstall: 15,
    secondaryDimThresholdPrimary: 72,
    secondaryDimThresholdOther: 60,
    secondaryDimPercentDelivery: 10,
    secondaryDimPercentInstall: 15,
    baseDeliveryCents: 17500,
    baseInstallCents: 12500,
    wrappingFeeCents: 4500,
    removalFeeCents: 4500,
  },
  sculpture: {
    weightTiers: [
      { maxLb: 25, priceCents: 15000 },
      { maxLb: 50, priceCents: 22500 },
      { maxLb: 100, priceCents: 35000 },
      { maxLb: 200, priceCents: 50000 },
      { maxLb: 99999, priceCents: 75000 },
    ],
    footprintMidInches: 24,
    footprintLargeInches: 60,
    footprintMidPercent: 25,
    footprintLargePercent: 50,
    wrappingFeeCents: 5500,
  },
  furniture: {
    Sofa: { small: 20000, medium: 27500, large: 35000 },
    Loveseat: { small: 17500, medium: 22500, large: 30000 },
    "2-Piece Sectional": { small: 30000, medium: 40000, large: 52500 },
    "3-Piece Sectional": { small: 37500, medium: 50000, large: 65000 },
    "4-Piece Sectional": { small: 45000, medium: 60000, large: 80000 },
    "Armchair / Accent Chair": { small: 10000, medium: 13500, large: 17500 },
    "Recliner / Lounge Chair": { small: 12500, medium: 16500, large: 21000 },
    Bench: { small: 9000, medium: 12000, large: 16000 },
    Ottoman: { small: 7500, medium: 10000, large: 13500 },
    "Dining Table": { small: 17500, medium: 25000, large: 35000 },
    "Dining Chair — Single": { small: 4500, medium: 6000, large: 8000 },
    "Dining Chairs — Set of 4": { small: 15000, medium: 20000, large: 27500 },
    "Dining Chairs — Set of 6": { small: 20000, medium: 27500, large: 36000 },
    "Dining Chairs — Set of 8": { small: 25000, medium: 35000, large: 45000 },
    "Barstool — Single": { small: 5000, medium: 7000, large: 9000 },
    "Barstools — Set of 2": { small: 9000, medium: 12000, large: 16000 },
    "Coffee Table": { small: 10000, medium: 14000, large: 19000 },
    "Side Table": { small: 7500, medium: 10000, large: 13500 },
    "Console Table": { small: 10000, medium: 14000, large: 19000 },
    "Credenza / Sideboard": { small: 15000, medium: 21000, large: 28000 },
    "Buffet / Hutch": { small: 17500, medium: 25000, large: 35000 },
    Desk: { small: 12500, medium: 17500, large: 24000 },
    "Headboard / Bed Frame": { small: 15000, medium: 21000, large: 28000 },
    Dresser: { small: 15000, medium: 21000, large: 28000 },
    Nightstand: { small: 7500, medium: 10000, large: 13500 },
    "Nightstands — Set of 2": { small: 12500, medium: 17000, large: 23000 },
    "Storage Trunk / Chest": { small: 10000, medium: 14000, large: 19000 },
    Vanity: { small: 12500, medium: 17500, large: 24000 },
    Armoire: { small: 20000, medium: 27500, large: 37500 },
    "Other furniture": { small: 15000, medium: 22000, large: 32000 },
  },
  decor: {
    Mirror: { small: 9000, medium: 13000, large: 18000 },
    "Table Lamp": { small: 6000, medium: 8500, large: 12000 },
    "Floor Lamp": { small: 8000, medium: 11000, large: 15000 },
    Chandelier: { small: 15000, medium: 22500, large: 32500 },
    "Wall Décor": { small: 7500, medium: 11000, large: 16000 },
    Vase: { small: 5000, medium: 7500, large: 11000 },
    "Sculptural Décor": { small: 9000, medium: 14000, large: 20000 },
    "Accent Piece": { small: 7000, medium: 10000, large: 15000 },
    Figurine: { small: 4500, medium: 7000, large: 10000 },
    "Other Décor": { small: 8000, medium: 12000, large: 18000 },
  },
  otherBaseCents: 20000,
  wrappingDefaultCents: 4500,
  alerts: {
    exceptionalDimInches: 80,
    exceptionalWeightLb: 150,
    highDeclaredValueDollars: 25000,
  },
  photos: {
    requireOnExceptional: true,
  },
};

export type RouteSlot = {
  id: string;
  pickupDate: string;
  deliveryDate: string;
  label: string;
  regions?: string[];
};

export const defaultRouteSlots: RouteSlot[] = [
  {
    id: "r1",
    pickupDate: "2026-08-04",
    deliveryDate: "2026-08-06",
    label: "NorCal / Central corridor",
  },
  {
    id: "r2",
    pickupDate: "2026-08-05",
    deliveryDate: "2026-08-07",
    label: "SoCal coastal route",
  },
  {
    id: "r3",
    pickupDate: "2026-08-11",
    deliveryDate: "2026-08-13",
    label: "Statewide mid-week",
  },
  {
    id: "r4",
    pickupDate: "2026-08-12",
    deliveryDate: "2026-08-15",
    label: "Bay Area → LA",
  },
];
