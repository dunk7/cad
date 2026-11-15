import { NextResponse } from "next/server";
import { getAppConfig } from "@/lib/ordering/config";
import { calculatePrice } from "@/lib/ordering/pricing";
import type { DraftOrder } from "@/lib/ordering/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { draft: DraftOrder };
    const { pricing } = await getAppConfig();
    const result = calculatePrice(
      body.draft || { items: [], declaredValueProtection: true },
      pricing
    );
    return NextResponse.json({ pricing: result, config: pricing });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Pricing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { routes, pricing } = await getAppConfig();
    return NextResponse.json({
      routes,
      declaredValuePercent: pricing.declaredValuePercent,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Config failed" },
      { status: 500 }
    );
  }
}
