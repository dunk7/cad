/**
 * Two-week California route calendar.
 *
 * Week A (Carmel / NorCal week):
 *   Mon LA · Tue Carmel · Wed–Fri San Jose+ · Thu–Fri SF/Stockton/north · Sat Carmel
 *   Sun Carmel→LA central corridor (coast) and Fresno
 *
 * Week B (SoCal week):
 *   Mon LA · Tue Coachella/Palm Desert · Wed San Diego (incl. Temecula) · Thu Newport/Laguna/OC
 *   Fri–Sun off
 *
 * Epoch Monday 2026-11-16 starts Week A (northbound): LA Monday, Carmel Tuesday, etc.
 *
 * Out of regular routes (custom contact / quote):
 *   north of Tahoe, far north CA, east of Fresno (eastern Sierra / high desert).
 */

export type RouteRegionId =
  | "carmel"
  | "sj_corridor"
  | "sf_north"
  | "central_coast"
  | "central_valley"
  | "la"
  | "orange_county"
  | "san_diego"
  | "coachella"
  | "out_of_route"
  | "unknown";

export type ServiceDay = {
  /** ISO date YYYY-MM-DD (calendar date in America/Los_Angeles). */
  date: string;
  weekday: string;
  regionId: RouteRegionId;
  regionLabel: string;
  label: string;
  week: "A" | "B";
};

/** Monday that begins a Week A cycle (America/Los_Angeles calendar). */
export const ROUTE_CYCLE_EPOCH_MONDAY = "2026-11-16";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const REGION_LABELS: Record<RouteRegionId, string> = {
  carmel: "Carmel / Monterey Peninsula",
  sj_corridor: "San Jose & north of Carmel",
  sf_north: "Bay Area, Stockton & further north",
  central_coast: "Central California (Carmel → LA corridor)",
  central_valley: "Fresno area",
  la: "Los Angeles",
  orange_county: "Orange County / Newport / Laguna",
  san_diego: "San Diego / Temecula",
  coachella: "Coachella Valley",
  out_of_route: "Outside regular routes",
  unknown: "California (unmapped)",
};

/** Representative ZIP used for nearest-region matching (covered areas only). */
const REGION_ANCHORS: { region: Exclude<RouteRegionId, "out_of_route" | "unknown">; zip: number }[] =
  [
    { region: "carmel", zip: 93923 },
    { region: "sj_corridor", zip: 95113 },
    { region: "sf_north", zip: 94102 },
    { region: "central_coast", zip: 93101 },
    { region: "central_valley", zip: 93721 },
    { region: "la", zip: 90012 },
    { region: "orange_county", zip: 92651 },
    { region: "san_diego", zip: 92101 },
    { region: "coachella", zip: 92262 },
  ];

function parseIsoDate(iso: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

/** Treat YYYY-MM-DD as a civil date (no TZ shift). */
export function civilDateUtc(iso: string): Date {
  const p = parseIsoDate(iso);
  if (!p) return new Date(NaN);
  return new Date(Date.UTC(p.y, p.m - 1, p.d));
}

export function formatIsoDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysIso(iso: string, days: number): string {
  const dt = civilDateUtc(iso);
  dt.setUTCDate(dt.getUTCDate() + days);
  return formatIsoDate(dt);
}

export function weekdayIndex(iso: string): number {
  return civilDateUtc(iso).getUTCDay(); // 0=Sun … 6=Sat
}

/** Today's date in America/Los_Angeles as YYYY-MM-DD. */
export function todayInLosAngeles(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function normalizeZip(zip: string | undefined | null): string {
  const digits = (zip || "").replace(/\D/g, "");
  return digits.slice(0, 5);
}

export function isOutOfRouteRegion(region: RouteRegionId): boolean {
  return region === "out_of_route";
}

/** Temecula / Murrieta — served on San Diego day. */
function isTemeculaMurrieta(n: number): boolean {
  return (
    (n >= 92590 && n <= 92593) ||
    (n >= 92562 && n <= 92564) ||
    n === 92596 // Winchester
  );
}

/**
 * Outside the two-week route footprint → custom contact / quote.
 * North of Tahoe / far north, and east of Fresno (eastern Sierra / high desert).
 */
function isOutOfRouteZip(n: number, prefix3: number): boolean {
  // Far north coast (Humboldt / Del Norte)
  if (prefix3 === 955) return true;

  // North of Tahoe / far northeast (Redding, Alturas, Susanville, etc.)
  if (prefix3 === 960) return true;

  // 961: Tahoe basin is on-route (sf_north); everything north of Tahoe is not
  if (prefix3 === 961) {
    // South Lake Tahoe / Tahoe / Truckee corridor
    if (
      (n >= 96140 && n <= 96148) ||
      (n >= 96150 && n <= 96158) ||
      (n >= 96160 && n <= 96162)
    ) {
      return false;
    }
    return true;
  }

  // East of Fresno — eastern Sierra / high desert (Bishop, Mammoth, Ridgecrest, Mojave…)
  if (prefix3 === 935) return true;

  // Bakersfield / south valley — not on Carmel→LA Sunday corridor or Fresno Sunday run
  if (prefix3 === 932 || prefix3 === 933) return true;

  return false;
}

/**
 * Map a CA ZIP to a route region using known prefixes, then nearest anchor.
 */
export function regionForZip(zipInput: string | undefined | null): RouteRegionId {
  const zip = normalizeZip(zipInput);
  if (zip.length < 5) return "unknown";
  const n = Number(zip);
  if (!Number.isFinite(n)) return "unknown";

  const prefix3 = Math.floor(n / 100);

  if (n < 90001 || n > 96162) return "unknown";

  if (isOutOfRouteZip(n, prefix3)) return "out_of_route";

  // Carmel / Monterey Peninsula (not Big Sur 93920)
  if (
    (n >= 93921 && n <= 93955) ||
    n === 93940 ||
    n === 93950 ||
    n === 93953 ||
    n === 93933 ||
    n === 93901 ||
    n === 93905 ||
    n === 93906 ||
    n === 93907 ||
    n === 93908
  ) {
    return "carmel";
  }

  // Central California coast corridor: Big Sur → SLO → Santa Barbara → Ventura (toward LA)
  if (n === 93920 || prefix3 === 934 || prefix3 === 931 || prefix3 === 930) {
    return "central_coast";
  }

  // Coachella / desert
  if (prefix3 === 922) return "coachella";

  // Temecula / Murrieta → San Diego day
  if (isTemeculaMurrieta(n)) return "san_diego";

  // San Diego
  if (prefix3 === 919 || prefix3 === 920 || prefix3 === 921) return "san_diego";

  // Orange County / Newport / Laguna
  if (prefix3 === 926 || prefix3 === 927 || prefix3 === 928) {
    return "orange_county";
  }

  // LA basin (incl. much of 925 Inland Empire that isn't Temecula)
  if (
    (prefix3 >= 900 && prefix3 <= 918) ||
    prefix3 === 925
  ) {
    return "la";
  }

  // Fresno area only for Sunday "central" valley stop — NOT Stockton/Modesto
  if (prefix3 === 936 || prefix3 === 937) {
    return "central_valley";
  }

  // Stockton, Modesto, Merced — Bay Area / north Thu–Fri corridor (not central CA)
  if (prefix3 === 952 || prefix3 === 953) {
    return "sf_north";
  }

  // Sacramento metro — Thu/Fri with SF/north
  if (prefix3 === 956 || prefix3 === 957 || prefix3 === 958 || prefix3 === 959) {
    return "sf_north";
  }

  // San Jose / South Bay / Santa Cruz / Peninsula (north of Carmel, not SF)
  if (
    prefix3 === 950 ||
    prefix3 === 951 ||
    prefix3 === 940 ||
    prefix3 === 943 ||
    prefix3 === 944 ||
    n === 94536 ||
    n === 94538 ||
    n === 94539 ||
    n === 94555 ||
    n === 94560 ||
    n === 94587
  ) {
    return "sj_corridor";
  }

  // San Francisco + North Bay / East Bay / Wine Country (on-route north)
  if (
    prefix3 === 941 ||
    prefix3 === 946 ||
    prefix3 === 947 ||
    prefix3 === 948 ||
    prefix3 === 949 ||
    prefix3 === 945 ||
    prefix3 === 954
  ) {
    return "sf_north";
  }

  // Tahoe basin (not north of Tahoe) — Thu/Fri with north routes
  if (
    (n >= 96140 && n <= 96148) ||
    (n >= 96150 && n <= 96158) ||
    (n >= 96160 && n <= 96162)
  ) {
    return "sf_north";
  }

  // Remaining CA ZIPs: nearest covered anchor
  let best: RouteRegionId = "unknown";
  let bestDist = Infinity;
  for (const anchor of REGION_ANCHORS) {
    const dist = Math.abs(anchor.zip - n);
    if (dist < bestDist) {
      bestDist = dist;
      best = anchor.region;
    }
  }
  return best;
}

export type CycleDayInfo = {
  week: "A" | "B";
  /** 0=Sun … 6=Sat */
  weekday: number;
  dayOffset: number;
};

export function cycleInfoForDate(iso: string): CycleDayInfo {
  const epoch = civilDateUtc(ROUTE_CYCLE_EPOCH_MONDAY);
  const day = civilDateUtc(iso);
  const diffDays = Math.round((day.getTime() - epoch.getTime()) / 86_400_000);
  const mod = ((diffDays % 14) + 14) % 14;
  return {
    week: mod < 7 ? "A" : "B",
    weekday: weekdayIndex(iso),
    dayOffset: mod,
  };
}

/**
 * Which regions are on the road this calendar date?
 */
export function regionsServedOnDate(iso: string): RouteRegionId[] {
  const { week, weekday } = cycleInfoForDate(iso);

  if (week === "A") {
    switch (weekday) {
      case 1: // Mon
        return ["la"];
      case 2: // Tue
        return ["carmel"];
      case 3: // Wed
        return ["sj_corridor"];
      case 4: // Thu
        return ["sj_corridor", "sf_north"];
      case 5: // Fri
        return ["sj_corridor", "sf_north"];
      case 6: // Sat
        return ["carmel"];
      case 0: // Sun — coast corridor Carmel→LA + Fresno
        return ["central_coast", "central_valley"];
      default:
        return [];
    }
  }

  switch (weekday) {
    case 1: // Mon
      return ["la"];
    case 2: // Tue — Coachella / Palm Desert
      return ["coachella"];
    case 3: // Wed — San Diego / Temecula
      return ["san_diego"];
    case 4: // Thu — Newport / Laguna / OC
      return ["orange_county"];
    case 5:
    case 6:
    case 0:
      return [];
    default:
      return [];
  }
}

function labelFor(iso: string, region: RouteRegionId, week: "A" | "B"): string {
  const wd = WEEKDAY_NAMES[weekdayIndex(iso)];
  return `${wd} · ${REGION_LABELS[region]} (Week ${week})`;
}

/**
 * Upcoming service days for a ZIP.
 * Default window is ~3 weeks; extends until at least `minOptions` dates
 * (or `maxHorizonDays` is hit). Out-of-route ZIPs return no days.
 */
export function availableServiceDaysForZip(options: {
  zip: string;
  /** First selectable date (inclusive). Defaults to tomorrow in LA. */
  fromDate?: string;
  minOptions?: number;
  initialHorizonDays?: number;
  maxHorizonDays?: number;
}): ServiceDay[] {
  const region = regionForZip(options.zip);
  if (region === "unknown" && normalizeZip(options.zip).length < 5) {
    return [];
  }
  if (region === "out_of_route") {
    return [];
  }

  const today = todayInLosAngeles();
  const from = options.fromDate || addDaysIso(today, 1);
  const minOptions = options.minOptions ?? 3;
  const initialHorizon = options.initialHorizonDays ?? 21;
  const maxHorizon = options.maxHorizonDays ?? 56;

  const results: ServiceDay[] = [];
  let horizon = initialHorizon;

  while (results.length < minOptions && horizon <= maxHorizon) {
    results.length = 0;
    for (let i = 0; i <= horizon; i++) {
      const date = addDaysIso(from, i);
      if (date < from) continue;
      const served = regionsServedOnDate(date);
      if (!served.includes(region)) continue;

      const { week } = cycleInfoForDate(date);
      results.push({
        date,
        weekday: WEEKDAY_NAMES[weekdayIndex(date)],
        regionId: region,
        regionLabel: REGION_LABELS[region],
        label: labelFor(date, region, week),
        week,
      });
    }
    if (results.length >= minOptions) break;
    horizon += 14;
  }

  return results;
}

/** Convert service days into legacy RouteSlot-shaped objects for the wizard. */
export function serviceDaysToRouteSlots(
  days: ServiceDay[],
  deliveryDateFor?: (pickup: ServiceDay) => string
): {
  id: string;
  pickupDate: string;
  deliveryDate: string;
  label: string;
  regions?: string[];
}[] {
  return days.map((day) => ({
    id: `route-${day.date}-${day.regionId}`,
    pickupDate: day.date,
    deliveryDate: deliveryDateFor?.(day) ?? day.date,
    label: day.label,
    regions: [day.regionId],
  }));
}
