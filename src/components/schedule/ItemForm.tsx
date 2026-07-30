"use client";

import { DECOR_NAMES, FURNITURE_NAMES, SIZE_CLASSES } from "@/lib/ordering/catalog";
import type {
  CategoryId,
  MeasureUnit,
  OrderItem,
  WeightUnit,
} from "@/lib/ordering/types";
import { useOrder } from "@/lib/ordering/OrderContext";
import { useRef, useState } from "react";

const FRAME_CHARS = [
  "Ornate",
  "Delicate",
  "Fragile",
  "Antique",
  "Existing damage",
  "Loose components",
  "None of the above",
  "Not sure",
  "Other",
];

const WRAP_OPTIONS = [
  "Wrapped in paper",
  "Wrapped in plastic",
  "Wrapped in bubble wrap",
  "Blanket wrapped",
  "In a box",
  "In a crate",
  "Hanging on a wall",
  "Unwrapped",
  "Not sure",
  "Other",
];

const HARDWARE = [
  "Hanging wire",
  "D-rings without wire",
  "Z-bar or French cleat",
  "Sawtooth hanger",
  "Keyhole slots",
  "Security hardware",
  "No hardware attached",
  "Not sure",
  "Other",
];

type Props = {
  category: CategoryId;
  initial?: OrderItem;
  onSave: (item: OrderItem) => void;
  onCancel: () => void;
};

export default function ItemForm({ category, initial, onSave, onCancel }: Props) {
  const { draft, newItemId } = useOrder();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Record<string, unknown>>(() => ({
    ...(initial || {}),
    id: initial?.id || newItemId(),
    category,
    quantity: initial?.quantity || 1,
    height: initial?.height ?? "",
    width: initial?.width ?? "",
    depth: initial?.depth ?? "",
    measureUnit: initial?.measureUnit || draft.measureUnitDefault,
    weight: initial?.weight ?? "",
    weightUnit: "lb",
    specialInstructions: initial?.specialInstructions || "",
    photoUrls: initial?.photoUrls || [],
    existingDamage: initial?.existingDamage || "no",
    damageNotes: initial?.damageNotes || "",
  }));

  function set<K extends string>(key: K, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const urls = [...((form.photoUrls as string[]) || [])];
    try {
      for (const file of Array.from(files).slice(0, 10 - urls.length)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body });
        const data = await res.json();
        if (data.url) urls.push(data.url);
      }
      set("photoUrls", urls);
    } finally {
      setUploading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const measureUnit = form.measureUnit as MeasureUnit;
    const base = {
      id: String(form.id),
      category,
      quantity: category === "paintings" ? 1 : Number(form.quantity) || 1,
      height: form.height === "" ? undefined : Number(form.height),
      width: form.width === "" ? undefined : Number(form.width),
      depth: form.depth === "" ? undefined : Number(form.depth),
      measureUnit,
      weight: form.weight === "" ? undefined : Number(form.weight),
      weightUnit: "lb" as WeightUnit,
      specialInstructions: String(form.specialInstructions || ""),
      photoUrls: (form.photoUrls as string[]) || [],
      existingDamage: form.existingDamage as "yes" | "no" | "unsure",
      damageNotes: String(form.damageNotes || ""),
    };

    let item: OrderItem;
    if (category === "paintings") {
      if (
        form.pieceType === "Other wall art" &&
        !String(form.pieceDescription || "").trim()
      ) {
        alert("Please describe this wall art.");
        return;
      }
      item = {
        ...base,
        category: "paintings",
        pieceType: String(form.pieceType || "Painting or framed artwork"),
        pieceDescription: String(form.pieceDescription || ""),
        framed: form.framed as "yes" | "no" | "unsure",
        frameSizeWeight: String(form.frameSizeWeight || ""),
        frameCharacteristics: (form.frameCharacteristics as string[]) || [],
        frameOther: String(form.frameOther || ""),
        glazing: String(form.glazing || ""),
        currentWrapping: String(form.currentWrapping || ""),
        hardware: String(form.hardware || ""),
        removeFromWall: Boolean(form.removeFromWall),
        install: Boolean(form.install),
        installLocation: String(form.installLocation || ""),
        installHeight: String(form.installHeight || ""),
        wallMaterial: String(form.wallMaterial || ""),
        aboveStairs: String(form.aboveStairs || ""),
        obstacleBeneath: Boolean(form.obstacleBeneath),
        obstacleNotes: String(form.obstacleNotes || ""),
        placementKnown: String(form.placementKnown || ""),
      };
    } else if (category === "sculptures") {
      item = {
        ...base,
        category: "sculptures",
        description: String(form.description || ""),
        material: String(form.material || ""),
        components: String(form.components || "No"),
        componentCount: form.componentCount
          ? Number(form.componentCount)
          : undefined,
        handling: (form.handling as string[]) || [],
        currentWrapping: String(form.currentWrapping || ""),
        deliveryService: String(form.deliveryService || ""),
      };
    } else if (category === "furniture") {
      item = {
        ...base,
        category: "furniture",
        itemName: String(form.itemName || "Other furniture"),
        sizeClass: String(form.sizeClass || "Medium / Average"),
        separates: String(form.separates || ""),
        separatePieces: form.separatePieces
          ? Number(form.separatePieces)
          : undefined,
        handling: (form.handling as string[]) || [],
      };
    } else if (category === "decor") {
      item = {
        ...base,
        category: "decor",
        itemName: String(form.itemName || "Other Décor"),
        sizeClass: String(form.sizeClass || "Medium / Average"),
        material: String(form.material || ""),
        install: Boolean(form.install),
      };
    } else {
      item = {
        ...base,
        category: "other",
        description: String(form.description || ""),
        material: String(form.material || ""),
        serviceNeeded: String(form.serviceNeeded || ""),
      };
    }

    if (
      category !== "other" &&
      (item.height == null || item.width == null || Number.isNaN(item.height) || Number.isNaN(item.width))
    ) {
      alert("Height and width are required.");
      return;
    }
    if (category === "sculptures" && (item.depth == null || Number.isNaN(item.depth))) {
      alert("Depth is required for sculptures.");
      return;
    }
    if (category === "sculptures" && !String(form.description || "").trim()) {
      alert("Please describe the sculpture.");
      return;
    }
    if (category === "other" && !String(form.description || "").trim()) {
      alert("Please describe the item.");
      return;
    }

    onSave(item);
  }

  const field =
    "w-full border border-black/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-black";
  const label = "mb-1 block text-sm font-medium text-foreground";

  return (
    <form onSubmit={submit} className="space-y-5 rounded-lg border border-black/10 bg-[#fafafa] p-4 sm:p-6">
      {category === "paintings" && (
        <>
          <div>
            <label className={label}>What type of piece is this?</label>
            <select
              className={field}
              value={String(form.pieceType || "Painting or framed artwork")}
              onChange={(e) => set("pieceType", e.target.value)}
            >
              {[
                "Painting or framed artwork",
                "Wall décor",
                "Mirror",
                "Other wall art",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          {form.pieceType === "Other wall art" && (
            <div>
              <label className={label}>Please describe this wall art</label>
              <input
                className={field}
                value={String(form.pieceDescription || "")}
                onChange={(e) => set("pieceDescription", e.target.value)}
                placeholder="e.g. metal wall sculpture, tapestry, mixed-media panel"
                required
              />
              <p className="mt-1 text-xs text-muted">
                A short description helps us price and handle the piece correctly.
              </p>
            </div>
          )}
        </>
      )}

      {category === "sculptures" && (
        <div>
          <label className={label}>What type of sculpture or object is this?</label>
          <input
            className={field}
            value={String(form.description || "")}
            onChange={(e) => set("description", e.target.value)}
            placeholder="e.g. Bronze figurative sculpture"
            required
          />
        </div>
      )}

      {category === "furniture" && (
        <div>
          <label className={label}>Furniture item</label>
          <select
            className={field}
            value={String(form.itemName || FURNITURE_NAMES[0])}
            onChange={(e) => set("itemName", e.target.value)}
          >
            {FURNITURE_NAMES.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      {category === "decor" && (
        <div>
          <label className={label}>Décor item</label>
          <select
            className={field}
            value={String(form.itemName || DECOR_NAMES[0])}
            onChange={(e) => set("itemName", e.target.value)}
          >
            {DECOR_NAMES.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      {category === "other" && (
        <div>
          <label className={label}>Please describe the item</label>
          <textarea
            className={field}
            rows={3}
            value={String(form.description || "")}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {category !== "paintings" && (
          <div>
            <label className={label}>Quantity</label>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              className={field}
              value={Number(form.quantity) || 1}
              onChange={(e) => set("quantity", e.target.value)}
            />
          </div>
        )}
        <div className={category === "paintings" ? "sm:col-span-2" : ""}>
          <label className={label}>Measurement unit</label>
          <select
            className={field}
            value={String(form.measureUnit)}
            onChange={(e) => set("measureUnit", e.target.value)}
          >
            <option value="in">Inches</option>
            <option value="ft">Feet</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(["height", "width", "depth"] as const).map((dim) => (
          <div key={dim}>
            <label className={label}>
              {dim[0].toUpperCase() + dim.slice(1)}
              {category === "sculptures" || dim !== "depth" ? " *" : ""}
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              className={field}
              value={form[dim] === undefined ? "" : String(form[dim])}
              onChange={(e) => set(dim, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div>
        <label className={label}>Approximate weight (lbs)</label>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          className={field}
          value={form.weight === undefined ? "" : String(form.weight)}
          onChange={(e) => set("weight", e.target.value)}
        />
      </div>

      {(category === "furniture" || category === "decor") && (
        <div>
          <label className={label}>Which size best describes the item?</label>
          <select
            className={field}
            value={String(form.sizeClass || "Medium / Average")}
            onChange={(e) => set("sizeClass", e.target.value)}
          >
            {SIZE_CLASSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {category === "paintings" && (
        <>
          <div>
            <label className={label}>Is this piece framed?</label>
            <select
              className={field}
              value={String(form.framed || "no")}
              onChange={(e) => set("framed", e.target.value)}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="unsure">Not sure</option>
            </select>
          </div>
          {form.framed === "yes" && (
            <>
              <div>
                <label className={label}>Frame size and weight</label>
                <select
                  className={field}
                  value={String(form.frameSizeWeight || "Medium / Average")}
                  onChange={(e) => set("frameSizeWeight", e.target.value)}
                >
                  {["Small / Light", "Medium / Average", "Large / Heavy", "Not sure"].map(
                    (o) => (
                      <option key={o}>{o}</option>
                    )
                  )}
                </select>
              </div>
              <fieldset>
                <legend className={label}>Frame characteristics</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {FRAME_CHARS.map((c) => {
                    const list = (form.frameCharacteristics as string[]) || [];
                    const checked = list.includes(c);
                    return (
                      <label key={c} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            set(
                              "frameCharacteristics",
                              checked ? list.filter((x) => x !== c) : [...list, c]
                            )
                          }
                        />
                        {c}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}
          <div>
            <label className={label}>Does this piece contain glass or acrylic?</label>
            <select
              className={field}
              value={String(form.glazing || "No")}
              onChange={(e) => set("glazing", e.target.value)}
            >
              {["Glass", "Acrylic or Plexiglas", "No", "Not sure"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {category === "sculptures" && (
        <>
          <div>
            <label className={label}>Primary material</label>
            <select
              className={field}
              value={String(form.material || "Not sure")}
              onChange={(e) => set("material", e.target.value)}
            >
              {[
                "Bronze or metal",
                "Stone or concrete",
                "Ceramic",
                "Glass",
                "Wood",
                "Resin or fiberglass",
                "Plaster",
                "Mixed media",
                "Other",
                "Not sure",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Separate base, pedestal, or components?</label>
            <select
              className={field}
              value={String(form.components || "No")}
              onChange={(e) => set("components", e.target.value)}
            >
              {[
                "No",
                "Separate base",
                "Separate pedestal",
                "Multiple components",
                "Other",
                "Not sure",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Service needed at delivery</label>
            <select
              className={field}
              value={String(form.deliveryService || "Deliver and place")}
              onChange={(e) => set("deliveryService", e.target.value)}
            >
              {[
                "Deliver and place",
                "Deliver, unwrap, and place",
                "Place on an existing pedestal or base",
                "Secure or install",
                "Leave wrapped",
                "Other",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className={label}>Existing damage or unusual fragility?</label>
        <select
          className={field}
          value={String(form.existingDamage || "no")}
          onChange={(e) => set("existingDamage", e.target.value)}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
          <option value="unsure">Not sure</option>
        </select>
      </div>
      {form.existingDamage === "yes" && (
        <div>
          <label className={label}>Please briefly describe the condition</label>
          <textarea
            className={field}
            rows={2}
            value={String(form.damageNotes || "")}
            onChange={(e) => set("damageNotes", e.target.value)}
          />
        </div>
      )}

      {(category === "paintings" || category === "sculptures") && (
        <div>
          <label className={label}>How is the piece currently wrapped or prepared?</label>
          <select
            className={field}
            value={String(form.currentWrapping || "Not sure")}
            onChange={(e) => set("currentWrapping", e.target.value)}
          >
            {WRAP_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      )}

      {category === "paintings" && (
        <>
          <div>
            <label className={label}>What hardware is attached to the back?</label>
            <select
              className={field}
              value={String(form.hardware || "Not sure")}
              onChange={(e) => set("hardware", e.target.value)}
            >
              {HARDWARE.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          {form.currentWrapping === "Hanging on a wall" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.removeFromWall)}
                onChange={(e) => set("removeFromWall", e.target.checked)}
              />
              Remove this piece from the wall
            </label>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(form.install)}
              onChange={(e) => set("install", e.target.checked)}
            />
            Would you like us to install this piece?
          </label>
          {form.install && (
            <div className="space-y-4 border border-black/10 bg-white p-4">
              <div>
                <label className={label}>Where will this piece be installed?</label>
                <select
                  className={field}
                  value={String(form.installLocation || "Standard eye or gallery level")}
                  onChange={(e) => set("installLocation", e.target.value)}
                >
                  {[
                    "Standard eye or gallery level",
                    "Above furniture",
                    "Above a fireplace or mantel",
                    "Above standard gallery level",
                    "In a stairwell",
                    "Other",
                  ].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Wall material</label>
                <select
                  className={field}
                  value={String(form.wallMaterial || "Drywall")}
                  onChange={(e) => set("wallMaterial", e.target.value)}
                >
                  {[
                    "Drywall",
                    "Plaster",
                    "Wood",
                    "Brick",
                    "Concrete",
                    "Stone",
                    "Tile",
                    "Metal",
                    "Other",
                    "Not sure",
                  ].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Is the installation directly above stairs?</label>
                <select
                  className={field}
                  value={String(form.aboveStairs || "No")}
                  onChange={(e) => set("aboveStairs", e.target.value)}
                >
                  <option>Yes</option>
                  <option>No</option>
                  <option>Not sure</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(form.obstacleBeneath)}
                  onChange={(e) => set("obstacleBeneath", e.target.checked)}
                />
                Furniture, cabinetry, fireplace, or obstacle beneath the area
              </label>
            </div>
          )}
        </>
      )}

      <div>
        <label className={label}>Photographs (optional, up to 10)</label>
        <p className="mb-3 text-xs text-muted">
          Photographs are optional, but they can help us better understand your items and may
          improve pricing accuracy for larger, heavier, fragile, unusually valuable, or more
          complex projects.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            void onPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={uploading || ((form.photoUrls as string[]) || []).length >= 10}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center border border-black bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? "Uploading…" : "Add photos"}
        </button>
        {!!(form.photoUrls as string[])?.length && (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {(form.photoUrls as string[]).map((url) => (
              <div key={url} className="relative aspect-square overflow-hidden border border-black/10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() =>
                    set(
                      "photoUrls",
                      ((form.photoUrls as string[]) || []).filter((u) => u !== url)
                    )
                  }
                  className="absolute right-1 top-1 bg-black/75 px-1.5 py-0.5 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={label}>Special instructions for this item</label>
        <textarea
          className={field}
          rows={2}
          value={String(form.specialInstructions || "")}
          onChange={(e) => set("specialInstructions", e.target.value)}
          placeholder="Condition, handling, wrapping, removal, placement, or installation notes"
        />
      </div>

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="border border-black/20 px-5 py-2.5 text-sm hover:border-black"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="border border-black bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-white hover:text-black"
        >
          Save & Continue
        </button>
      </div>
    </form>
  );
}
