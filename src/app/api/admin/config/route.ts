import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  getAppConfig,
  savePricingConfig,
  saveRouteSlots,
} from "@/lib/ordering/config";
import type { PricingConfig } from "@/lib/ordering/defaults";
import type { RouteSlot } from "@/lib/ordering/defaults";
import { defaultPricingConfig } from "@/lib/ordering/defaults";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = await getAppConfig();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (body.pricing) {
    const pricing = { ...defaultPricingConfig, ...body.pricing } as PricingConfig;
    await savePricingConfig(pricing);
  }
  if (body.routes) {
    await saveRouteSlots(body.routes as RouteSlot[]);
  }
  return NextResponse.json(await getAppConfig());
}
