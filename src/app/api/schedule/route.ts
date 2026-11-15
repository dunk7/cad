import { NextResponse } from "next/server";
import {
  availableServiceDaysForZip,
  isOutOfRouteRegion,
  normalizeZip,
  regionForZip,
  REGION_LABELS,
} from "@/lib/ordering/routeCalendar";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zip = normalizeZip(searchParams.get("zip") || "");
  const after = searchParams.get("after") || undefined;
  const minOptions = Number(searchParams.get("min") || 3);

  if (zip.length < 5) {
    return NextResponse.json({
      zip,
      regionId: "unknown",
      regionLabel: REGION_LABELS.unknown,
      contactRequired: false,
      days: [],
      error: "Enter a 5-digit ZIP code to see available dates.",
    });
  }

  const regionId = regionForZip(zip);
  const contactRequired = isOutOfRouteRegion(regionId);

  if (contactRequired) {
    return NextResponse.json({
      zip,
      regionId,
      regionLabel: REGION_LABELS[regionId],
      contactRequired: true,
      days: [],
      error:
        "This ZIP is outside our regular two-week route (for example north of Tahoe or east of Fresno). Please contact us for a custom schedule.",
    });
  }

  const days = availableServiceDaysForZip({
    zip,
    fromDate: after,
    minOptions: Number.isFinite(minOptions) ? Math.max(1, minOptions) : 3,
    initialHorizonDays: 21,
    maxHorizonDays: 56,
  });

  return NextResponse.json({
    zip,
    regionId,
    regionLabel: REGION_LABELS[regionId],
    contactRequired: false,
    days,
  });
}
