import { NextResponse } from "next/server";
import {
  availableServiceDaysForZip,
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
      days: [],
      error: "Enter a 5-digit ZIP code to see available dates.",
    });
  }

  const regionId = regionForZip(zip);
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
    days,
  });
}
