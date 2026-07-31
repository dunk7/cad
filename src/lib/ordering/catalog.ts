export const CATEGORIES = [
  {
    id: "paintings" as const,
    name: "Paintings or Wall Art",
    image: "/images/home/IMG_4705.jpg",
  },
  {
    id: "sculptures" as const,
    name: "Sculptures",
    image: "/images/home/1000003546.jpg",
  },
  {
    id: "furniture" as const,
    name: "Furniture",
    image: "/images/home/IMG_4218.jpg",
  },
  {
    id: "decor" as const,
    name: "Décor",
    image: "/images/home/IMG_4270.jpg",
  },
] as const;

export const FURNITURE_NAMES = [
  "Sofa",
  "Loveseat",
  "2-Piece Sectional",
  "3-Piece Sectional",
  "4-Piece Sectional",
  "Armchair / Accent Chair",
  "Recliner / Lounge Chair",
  "Bench",
  "Ottoman",
  "Dining Table",
  "Dining Chair — Single",
  "Dining Chairs — Set of 4",
  "Dining Chairs — Set of 6",
  "Dining Chairs — Set of 8",
  "Barstool — Single",
  "Barstools — Set of 2",
  "Coffee Table",
  "Side Table",
  "Console Table",
  "Credenza / Sideboard",
  "Buffet / Hutch",
  "Desk",
  "Headboard / Bed Frame",
  "Dresser",
  "Nightstand",
  "Nightstands — Set of 2",
  "Storage Trunk / Chest",
  "Vanity",
  "Armoire",
  "Other furniture",
];

export const DECOR_NAMES = [
  "Mirror",
  "Table Lamp",
  "Floor Lamp",
  "Chandelier",
  "Wall Décor",
  "Vase",
  "Sculptural Décor",
  "Accent Piece",
  "Figurine",
  "Other Décor",
];

export const SIZE_CLASSES = [
  "Small / Light",
  "Medium / Average",
  "Large / Heavy",
  "Not sure",
];

export const WIZARD_STEPS = [
  "Items",
  "Pickup",
  "Delivery",
  "Payment",
] as const;
