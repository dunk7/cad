import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppConfig } from "@/lib/ordering/config";
import { calculatePrice, totalDeclaredValueDollars } from "@/lib/ordering/pricing";
import { evaluateAlerts } from "@/lib/ordering/alerts";
import { requiresManualQuote } from "@/lib/ordering/california";
import type { DraftOrder } from "@/lib/ordering/types";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

function orderNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `CAD-${stamp}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

/**
 * Submit a scheduling request that needs a manual quote (non-California
 * pickup or delivery). Persists the draft for ops follow-up — no Stripe.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { draft: DraftOrder };
  const draft = body.draft;
  if (!draft?.items?.length) {
    return NextResponse.json({ error: "Add at least one item" }, { status: 400 });
  }
  if (!draft.customer?.name || !draft.customer?.email) {
    return NextResponse.json({ error: "Customer contact required" }, { status: 400 });
  }
  if (!draft.termsAccepted) {
    return NextResponse.json({ error: "Please accept the terms" }, { status: 400 });
  }
  if (!requiresManualQuote(draft.pickup?.state, draft.delivery?.state)) {
    return NextResponse.json(
      { error: "This route is eligible for instant checkout" },
      { status: 400 }
    );
  }

  const { pricing } = await getAppConfig();
  const price = calculatePrice(draft, pricing);
  const alerts = evaluateAlerts(draft, pricing);
  const number = orderNumber();

  await prisma.order.create({
    data: {
      orderNumber: number,
      status: "quote_pending",
      customerName: draft.customer.name,
      customerEmail: draft.customer.email,
      customerPhone: draft.customer.phone || null,
      pickupJson: JSON.stringify(draft.pickup),
      deliveryJson: JSON.stringify(draft.delivery),
      itemsJson: JSON.stringify(draft.items),
      scheduleJson: JSON.stringify(draft.schedule),
      pricingJson: JSON.stringify(price),
      alertsJson: JSON.stringify(alerts),
      declaredValueCents: Math.round(totalDeclaredValueDollars(draft.items) * 100),
      totalCents: price.totalCents,
      termsAcceptedAt: new Date(),
      paymentMethod: "quote_request",
    },
  });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return NextResponse.json({
    url: `${site}/schedule/confirmation?order=${number}&quote=1`,
    quotePending: true,
  });
}
