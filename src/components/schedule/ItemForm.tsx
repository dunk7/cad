"use client";

import { DECOR_NAMES, FURNITURE_NAMES, SIZE_CLASSES } from "@/lib/ordering/catalog";
import type { CategoryId, OrderItem, WeightUnit } from "@/lib/ordering/types";
import { useOrder } from "@/lib/ordering/OrderContext";
import { useMemo, useRef, useState } from "react";

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
  "Unwrapped",
  "Hanging on a wall",
  "Wrapped in bubble wrap",
  "Wrapped in paper",
  "Wrapped in plastic",
  "Blanket wrapped",
  "In a cardboard box",
  "In a wooden crate",
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

const SHOW_PHOTO_UPLOAD = false;

const DEFAULT_PIECE_TYPE = "Painting or framed artwork";

const field =
  "w-full border border-black/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-black";
const label = "mb-1 block text-sm font-medium text-foreground";
const shellClass =
  "space-y-5 rounded-lg border border-black/10 bg-[#fafafa] p-4 sm:p-6";

function paintingPieceLabel(pieceType: unknown, pieceDescription?: unknown) {
  const type = String(pieceType || DEFAULT_PIECE_TYPE);
  if (type === DEFAULT_PIECE_TYPE) return "Painting";
  if (type === "Other wall art") {
    const desc = String(pieceDescription || "").trim();
    return desc || "Wall art";
  }
  return type;
}

function paintingSummaryLine(opts: {
  width: unknown;
  height: unknown;
  weight: unknown;
  pieceType?: unknown;
  pieceDescription?: unknown;
}) {
  const parts: string[] = [];
  const w = opts.width === "" || opts.width == null ? NaN : Number(opts.width);
  const h = opts.height === "" || opts.height == null ? NaN : Number(opts.height);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    parts.push(`${w}" × ${h}"`);
  }
  const weight =
    opts.weight === "" || opts.weight == null ? NaN : Number(opts.weight);
  if (Number.isFinite(weight) && weight >= 0) {
    parts.push(`~${weight} lbs`);
  }
  parts.push(paintingPieceLabel(opts.pieceType, opts.pieceDescription));
  return parts.join(" · ");
}

type Props = {
  category: CategoryId;
  initial?: OrderItem;
  onSave: (item: OrderItem) => void;
  onCancel: () => void;
};

function formatDeclaredValue(value: unknown) {
  if (value === "" || value === undefined || value === null) return "";
  const n =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n)) return "";
  return Math.max(0, Math.round(n)).toLocaleString("en-US");
}

function parseDeclaredValue(raw: string): number | "" {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits);
}

function PaintingAspectPreview({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const { boxW, boxH, labelW, labelH } = useMemo(() => {
    const w = width > 0 ? width : 24;
    const h = height > 0 ? height : 30;
    const max = 180;
    const scale = Math.min(max / w, max / h);
    return {
      boxW: Math.max(56, Math.round(w * scale)),
      boxH: Math.max(56, Math.round(h * scale)),
      labelW: width > 0 ? `${width}"` : "W",
      labelH: height > 0 ? `${height}"` : "H",
    };
  }, [width, height]);

  return (
    <div className="flex h-full min-h-[280px] items-center justify-center rounded-lg border border-black/10 bg-white px-6 py-8">
      <div
        className="grid items-center justify-items-center gap-x-3 gap-y-2"
        style={{
          gridTemplateColumns: "auto auto",
          gridTemplateRows: "auto auto",
        }}
      >
        {/* Height dimension */}
        <div
          className="flex items-center gap-1.5 self-stretch"
          style={{ height: boxH }}
          aria-hidden={height <= 0}
        >
          <span className="select-none text-[11px] font-medium tabular-nums tracking-wide text-muted">
            <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              {labelH}
            </span>
          </span>
          <div className="flex h-full flex-col items-center">
            <span className="h-px w-2.5 bg-black/30" />
            <span className="w-px flex-1 bg-black/25" />
            <span className="h-px w-2.5 bg-black/30" />
          </div>
        </div>

        {/* Frame */}
        <div
          className="relative overflow-hidden border-[3px] border-neutral-800 bg-[#f3efe6] shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-[width,height] duration-300 ease-out"
          style={{ width: boxW, height: boxH }}
          role="img"
          aria-label={
            width > 0 && height > 0
              ? `Preview at ${width} by ${height} inches`
              : "Painting size preview"
          }
        >
          <div className="absolute inset-[7px] bg-[#faf7f1]">
            <div className="absolute inset-[12%] flex items-center justify-center">
              <svg
                viewBox="0 0 80 80"
                className="h-full w-full max-h-full max-w-full text-neutral-600"
                fill="none"
                aria-hidden="true"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M8 62 L28 36 L42 50 L56 28 L72 62 Z"
                  fill="currentColor"
                  opacity="0.12"
                />
                <path
                  d="M8 62 L28 36 L42 50 L56 28 L72 62"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  opacity="0.7"
                />
                <circle
                  cx="26"
                  cy="24"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Spacer under height column */}
        <div aria-hidden />

        {/* Width dimension */}
        <div
          className="flex w-full items-center gap-2"
          style={{ width: boxW }}
          aria-hidden={width <= 0}
        >
          <span className="h-px flex-1 bg-black/25" />
          <span className="shrink-0 text-[11px] font-medium tabular-nums tracking-wide text-muted">
            {labelW}
          </span>
          <span className="h-px flex-1 bg-black/25" />
        </div>
      </div>
    </div>
  );
}

function DeclaredValueInput({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: number | "") => void;
}) {
  return (
    <div>
      <label className={label}>Declared value</label>
      <div className="flex overflow-hidden border border-black/20 bg-white focus-within:border-black">
        <span
          className="flex select-none items-center border-r border-black/10 bg-[#f3f3f3] px-3 text-sm font-medium text-muted"
          aria-hidden="true"
        >
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          className="w-full bg-transparent px-3 py-2.5 text-sm tabular-nums outline-none"
          value={formatDeclaredValue(value)}
          onChange={(e) => onChange(parseDeclaredValue(e.target.value))}
          placeholder="0"
          aria-label="Declared value in US dollars"
        />
      </div>
    </div>
  );
}

export default function ItemForm({ category, initial, onSave, onCancel }: Props) {
  const { newItemId } = useOrder();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paintingPage, setPaintingPage] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<Record<string, unknown>>(() => ({
    ...(initial || {}),
    id: initial?.id || newItemId(),
    category,
    quantity: initial?.quantity || 1,
    height: initial?.height ?? "",
    width: initial?.width ?? "",
    depth: initial?.depth ?? "",
    measureUnit: "in",
    weight: initial?.weight ?? "",
    weightUnit: "lb",
    pieceType: initial?.pieceType || DEFAULT_PIECE_TYPE,
    specialInstructions: initial?.specialInstructions || "",
    photoUrls: initial?.photoUrls || [],
    existingDamage: initial?.existingDamage || "no",
    damageNotes: initial?.damageNotes || "",
    declaredValueDollars: initial?.declaredValueDollars ?? "",
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

  const heightIn = form.height === "" ? NaN : Number(form.height);
  const widthIn = form.width === "" ? NaN : Number(form.width);
  const askAboutFrame =
    Number.isFinite(heightIn) &&
    Number.isFinite(widthIn) &&
    (heightIn >= 48 || widthIn >= 48);

  function goToPaintingPage(page: 1 | 2 | 3) {
    setPaintingPage(page);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function goToPaintingDetails() {
    if (!Number.isFinite(widthIn) || !Number.isFinite(heightIn) || widthIn <= 0 || heightIn <= 0) {
      alert("Please enter width and height in inches.");
      return;
    }
    if (form.weight === "" || !Number.isFinite(Number(form.weight)) || Number(form.weight) < 0) {
      alert("Please enter an approximate weight in pounds.");
      return;
    }
    goToPaintingPage(2);
  }

  function goToPaintingExtras() {
    if (
      form.pieceType === "Other wall art" &&
      !String(form.pieceDescription || "").trim()
    ) {
      alert("Please describe this wall art.");
      return;
    }
    goToPaintingPage(3);
  }

  function parseDeclared() {
    if (form.declaredValueDollars === "") return 0;
    if (typeof form.declaredValueDollars === "number") {
      return Math.max(0, form.declaredValueDollars);
    }
    return Math.max(0, Number(String(form.declaredValueDollars).replace(/,/g, "")) || 0);
  }

  function savePainting() {
    const item: OrderItem = {
      id: String(form.id),
      category: "paintings",
      quantity: 1,
      height: Number(form.height),
      width: Number(form.width),
      measureUnit: "in",
      weight: form.weight === "" ? undefined : Number(form.weight),
      weightUnit: "lb",
      specialInstructions: String(form.specialInstructions || ""),
      photoUrls: (form.photoUrls as string[]) || [],
      existingDamage: form.existingDamage as "yes" | "no" | "unsure",
      damageNotes: String(form.damageNotes || ""),
      declaredValueDollars: parseDeclared(),
      pieceType: String(form.pieceType || DEFAULT_PIECE_TYPE),
      pieceDescription: String(form.pieceDescription || ""),
      framed: askAboutFrame ? (form.framed as "yes" | "no" | "unsure") : "no",
      frameSizeWeight: askAboutFrame ? String(form.frameSizeWeight || "") : "",
      frameCharacteristics: askAboutFrame
        ? (form.frameCharacteristics as string[]) || []
        : [],
      frameOther: askAboutFrame ? String(form.frameOther || "") : "",
      glazing: "",
      currentWrapping: String(form.currentWrapping || "Unwrapped"),
      hardware: String(form.hardware || "Not sure"),
      removeFromWall: Boolean(form.removeFromWall),
      install: Boolean(form.install),
      installLocation: String(form.installLocation || ""),
      installHeight: String(form.installHeight || ""),
      wallMaterial: String(form.wallMaterial || ""),
      aboveStairs: String(form.aboveStairs || ""),
      obstacleBeneath: false,
      obstacleNotes: "",
      placementKnown: String(form.placementKnown || ""),
    };
    onSave(item);
  }

  function saveOther(e: React.FormEvent) {
    e.preventDefault();
    const base = {
      id: String(form.id),
      category,
      quantity: Number(form.quantity) || 1,
      height: form.height === "" ? undefined : Number(form.height),
      width: form.width === "" ? undefined : Number(form.width),
      depth: form.depth === "" ? undefined : Number(form.depth),
      measureUnit: "in" as const,
      weight: form.weight === "" ? undefined : Number(form.weight),
      weightUnit: "lb" as WeightUnit,
      specialInstructions: String(form.specialInstructions || ""),
      photoUrls: (form.photoUrls as string[]) || [],
      existingDamage: form.existingDamage as "yes" | "no" | "unsure",
      damageNotes: String(form.damageNotes || ""),
      declaredValueDollars: parseDeclared(),
    };

    let item: OrderItem;
    if (category === "sculptures") {
      if (!String(form.description || "").trim()) {
        alert("Please describe the sculpture.");
        return;
      }
      if (base.depth == null || Number.isNaN(base.depth)) {
        alert("Depth is required for sculptures.");
        return;
      }
      item = {
        ...base,
        category: "sculptures",
        description: String(form.description || ""),
        material: String(form.material || ""),
        components: String(form.components || "No"),
        componentCount: form.componentCount ? Number(form.componentCount) : undefined,
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
        separatePieces: form.separatePieces ? Number(form.separatePieces) : undefined,
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
      (item.height == null ||
        item.width == null ||
        Number.isNaN(item.height) ||
        Number.isNaN(item.width))
    ) {
      alert("Height and width are required.");
      return;
    }

    onSave(item);
  }

  // ——— Paintings: three explicit pages (never form-submit across steps) ———
  if (category === "paintings") {
    const summary = paintingSummaryLine({
      width: form.width,
      height: form.height,
      weight: form.weight,
      pieceType: form.pieceType,
      pieceDescription: form.pieceDescription,
    });

    if (paintingPage === 1) {
      return (
        <div className={shellClass}>
          <p className="text-center text-sm text-muted">{summary}</p>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <PaintingAspectPreview
              width={Number.isFinite(widthIn) ? widthIn : 0}
              height={Number.isFinite(heightIn) ? heightIn : 0}
            />
            <div className="flex flex-col justify-center space-y-4">
              <div>
                <label className={label}>Width (inches) *</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  className={field}
                  value={form.width === undefined ? "" : String(form.width)}
                  onChange={(e) => set("width", e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className={label}>Height (inches) *</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  className={field}
                  value={form.height === undefined ? "" : String(form.height)}
                  onChange={(e) => set("height", e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Approximate weight (lbs) *</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  className={field}
                  value={form.weight === undefined ? "" : String(form.weight)}
                  onChange={(e) => set("weight", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="border border-black/20 px-5 py-2.5 text-sm hover:border-black"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goToPaintingDetails}
              className="border border-black bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-white hover:text-black"
            >
              Next
            </button>
          </div>
        </div>
      );
    }

    if (paintingPage === 2) {
      return (
        <div className={shellClass}>
          <p className="text-center text-sm text-muted">{summary}</p>

          <div>
            <label className={label}>What type of piece is this?</label>
            <select
              className={field}
              value={String(form.pieceType || DEFAULT_PIECE_TYPE)}
              onChange={(e) => set("pieceType", e.target.value)}
            >
              {[
                DEFAULT_PIECE_TYPE,
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
              />
            </div>
          )}

          {askAboutFrame && (
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
            </>
          )}

          <div>
            <label className={label}>Existing damage?</label>
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

          <div>
            <label className={label}>How is the piece currently wrapped or prepared?</label>
            <select
              className={field}
              value={String(form.currentWrapping || "Unwrapped")}
              onChange={(e) => set("currentWrapping", e.target.value)}
            >
              {WRAP_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

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

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => goToPaintingPage(1)}
              className="border border-black/20 px-5 py-2.5 text-sm hover:border-black"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goToPaintingExtras}
              className="border border-black bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-white hover:text-black"
            >
              Next
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={shellClass}>
        <p className="text-center text-sm text-muted">{summary}</p>

        <DeclaredValueInput
          value={form.declaredValueDollars}
          onChange={(v) => set("declaredValueDollars", v)}
        />

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
          </div>
        )}

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
            onClick={() => goToPaintingPage(2)}
            className="border border-black/20 px-5 py-2.5 text-sm hover:border-black"
          >
            Back
          </button>
          <button
            type="button"
            onClick={savePainting}
            className="border border-black bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-white hover:text-black"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // ——— Other categories ———
  return (
    <form onSubmit={saveOther} className={shellClass}>
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

      <div className="grid gap-4 sm:grid-cols-3">
        {(["height", "width", "depth"] as const).map((dim) => (
          <div key={dim}>
            <label className={label}>
              {dim[0].toUpperCase() + dim.slice(1)} (inches)
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

      <DeclaredValueInput
        value={form.declaredValueDollars}
        onChange={(v) => set("declaredValueDollars", v)}
      />

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
          <div>
            <label className={label}>How is the piece currently wrapped or prepared?</label>
            <select
              className={field}
              value={String(form.currentWrapping || "Unwrapped")}
              onChange={(e) => set("currentWrapping", e.target.value)}
            >
              {WRAP_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className={label}>Existing damage?</label>
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

      {SHOW_PHOTO_UPLOAD && (
        <div>
          <label className={label}>Photographs (optional, up to 10)</label>
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
        </div>
      )}

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
          Back
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
