import { NextResponse } from "next/server";
import { getAppConfig } from "@/lib/ordering/config";
import { calculatePrice } from "@/lib/ordering/pricing";
import type { DraftOrder } from "@/lib/ordering/types";

export async function POST(req: Request) {
  const body = (await req.json()) as { draft: DraftOrder };
  const { pricing } = await getAppConfig();
  const result = calculatePrice(
    body.draft || { items: [], declaredValueProtection: false },
    pricing
  );
  return NextResponse.json({ pricing: result, config: pricing });
}

export async function GET() {
  const { routes, pricing } = await getAppConfig();
  return NextResponse.json({
    routes,
    declaredValuePercent: pricing.declaredValuePercent,
  });
}
