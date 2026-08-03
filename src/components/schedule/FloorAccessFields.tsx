"use client";

import {
  DEFAULT_FLOOR_ACCESS,
  FLOOR_LEVELS,
  floorAccessLabel,
  floorAccessOptions,
  needsFloorLevel,
  needsStairsFlights,
} from "@/lib/ordering/floorAccess";
import type { FloorAccess, LocationDetails } from "@/lib/ordering/types";

const field =
  "w-full border border-black/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-black";
const label = "mb-1 block text-sm font-medium";

export default function FloorAccessFields({
  kind,
  data,
  onChange,
}: {
  kind: "pickup" | "delivery";
  data: Partial<LocationDetails>;
  onChange: (patch: Partial<LocationDetails>) => void;
}) {
  const access = data.floorAccess || DEFAULT_FLOOR_ACCESS;
  const options = floorAccessOptions(kind);
  const showFloorLevel = needsFloorLevel(access);
  const showStairs = needsStairsFlights(access);

  function setAccess(next: FloorAccess) {
    const patch: Partial<LocationDetails> = {
      floorAccess: next,
      floor: floorAccessLabel(
        next,
        kind,
        next === "level_3_plus" ? data.floorLevel : undefined
      ),
    };
    if (next !== "level_3_plus") {
      patch.floorLevel = undefined;
    } else if (data.floorLevel == null) {
      patch.floorLevel = 3;
      patch.floor = floorAccessLabel(next, kind, 3);
    }
    if (!needsStairsFlights(next)) {
      patch.stairsFlights = undefined;
    }
    onChange(patch);
  }

  function setFloorLevel(level: number) {
    onChange({
      floorLevel: level,
      floorAccess: "level_3_plus",
      floor: floorAccessLabel("level_3_plus", kind, level),
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={label} htmlFor={`${kind}-floor-access`}>
          Floor access
        </label>
        <select
          id={`${kind}-floor-access`}
          className={field}
          value={access}
          onChange={(e) => setAccess(e.target.value as FloorAccess)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {showFloorLevel && (
        <div className="animate-floor-reveal">
          <label className={label} htmlFor={`${kind}-floor-level`}>
            Floor level
          </label>
          <select
            id={`${kind}-floor-level`}
            className={field}
            value={data.floorLevel ?? 3}
            onChange={(e) => setFloorLevel(Number(e.target.value))}
          >
            {FLOOR_LEVELS.map((n) => (
              <option key={n} value={n}>
                Floor {n}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted">
            Choose the exact floor for this {kind}.
          </p>
        </div>
      )}

      <div
        className={`grid gap-4 ${showStairs ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}
      >
        {showStairs && (
          <div className="animate-floor-reveal">
            <label className={label} htmlFor={`${kind}-stairs`}>
              Flights of stairs
            </label>
            <input
              id={`${kind}-stairs`}
              type="number"
              inputMode="numeric"
              min={0}
              className={field}
              value={data.stairsFlights ?? ""}
              onChange={(e) =>
                onChange({
                  stairsFlights:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              placeholder="e.g. 1"
            />
            <p className="mt-1.5 text-xs text-muted">
              How many flights must be climbed to reach the item?
            </p>
          </div>
        )}

        <div>
          <label className={label} htmlFor={`${kind}-elevator`}>
            Elevator
          </label>
          <select
            id={`${kind}-elevator`}
            className={field}
            value={data.elevator || "unsure"}
            onChange={(e) =>
              onChange({
                elevator: e.target.value as LocationDetails["elevator"],
              })
            }
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unsure">Not sure</option>
          </select>
        </div>
      </div>
    </div>
  );
}
