export type CategoryId =
  | "paintings"
  | "sculptures"
  | "furniture"
  | "decor"
  | "other";

export type MeasureUnit = "in" | "ft";
export type WeightUnit = "lb" | "kg" | "unsure";

export type OrderItemBase = {
  id: string;
  category: CategoryId;
  quantity: number;
  height?: number;
  width?: number;
  depth?: number;
  measureUnit: MeasureUnit;
  weight?: number;
  weightUnit: WeightUnit;
  specialInstructions?: string;
  photoUrls: string[];
  wrappingRequested?: boolean;
  existingDamage?: "yes" | "no" | "unsure";
  damageNotes?: string;
  /** Customer-declared value for this item in USD */
  declaredValueDollars?: number;
};

export type PaintingItem = OrderItemBase & {
  category: "paintings";
  pieceType: string;
  pieceDescription?: string;
  framed?: "yes" | "no" | "unsure";
  frameSizeWeight?: string;
  frameCharacteristics?: string[];
  frameOther?: string;
  glazing?: string;
  currentWrapping?: string;
  currentWrappingOther?: string;
  hardware?: string;
  hardwareOther?: string;
  removeFromWall?: boolean;
  install?: boolean;
  installLocation?: string;
  installLocationOther?: string;
  /** Height from floor to bottom of piece, in inches */
  installHeight?: string;
  wallMaterial?: string;
  wallMaterialOther?: string;
  /** Stair shape when installLocation is a stairwell */
  stairType?: string;
  stairTypeOther?: string;
  aboveStairs?: string;
  obstacleBeneath?: boolean;
  obstacleNotes?: string;
  placementKnown?: string;
};

export type SculptureItem = OrderItemBase & {
  category: "sculptures";
  description: string;
  material?: string;
  components?: string;
  componentCount?: number;
  handling?: string[];
  currentWrapping?: string;
  currentWrappingOther?: string;
  deliveryService?: string;
};

export type FurnitureItem = OrderItemBase & {
  category: "furniture";
  itemName: string;
  sizeClass?: string;
  separates?: string;
  separatePieces?: number;
  handling?: string[];
};

export type DecorItem = OrderItemBase & {
  category: "decor";
  itemName: string;
  sizeClass?: string;
  material?: string;
  install?: boolean;
};

export type OtherItem = OrderItemBase & {
  category: "other";
  description: string;
  material?: string;
  serviceNeeded?: string;
};

export type OrderItem =
  | PaintingItem
  | SculptureItem
  | FurnitureItem
  | DecorItem
  | OtherItem;

export type LocationDetails = {
  name: string;
  phone: string;
  /** Whether the contact number is a cell or landline. */
  phoneType?: "cell" | "landline";
  email?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  floor?: string;
  stairsFlights?: number;
  elevator?: "yes" | "no" | "unsure";
  parkingInstructions?: string;
  accessInstructions?: string;
  region?: string;
};

export type ScheduleSelection = {
  pickupDate: string;
  deliveryDate: string;
  label?: string;
};

export type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
};

export type DraftOrder = {
  categories: CategoryId[];
  items: OrderItem[];
  pickup: Partial<LocationDetails>;
  delivery: Partial<LocationDetails>;
  customer: Partial<CustomerInfo>;
  /** Sum of item declared values (kept in sync for checkout/alerts). */
  declaredValueDollars: number;
  /** When true, charge declared-value protection on the order total. */
  declaredValueProtection: boolean;
  schedule?: ScheduleSelection;
  measureUnitDefault: MeasureUnit;
  weightUnitDefault: WeightUnit;
  termsAccepted: boolean;
};

export type PriceLine = {
  code: string;
  label: string;
  amountCents: number;
};

export type PriceResult = {
  lines: PriceLine[];
  subtotalCents: number;
  totalCents: number;
};
