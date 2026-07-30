import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppConfig } from "@/lib/ordering/config";
import { calculatePrice, totalDeclaredValueDollars } from "@/lib/ordering/pricing";
import { evaluateAlerts } from "@/lib/ordering/alerts";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import type { DraftOrder } from "@/lib/ordering/types";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

function orderNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `CAD-${stamp}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { draft: DraftOrder };
  const draft = body.draft;
  if (!draft?.items?.length) {
    return NextResponse.json({ error: "Add at least one item" }, { status: 400 });
  }
  if (!draft.customer?.name || !draft.customer?.email) {
    return NextResponse.json({ error: "Customer contact required" }, { status: 400 });
  }
  if (!draft.schedule?.pickupDate || !draft.schedule?.deliveryDate) {
    return NextResponse.json({ error: "Schedule required" }, { status: 400 });
  }
  if (!draft.termsAccepted) {
    return NextResponse.json({ error: "Please accept the terms" }, { status: 400 });
  }

  const { pricing } = await getAppConfig();
  const price = calculatePrice(draft, pricing);
  if (price.totalCents < 50) {
    return NextResponse.json({ error: "Order total too low" }, { status: 400 });
  }

  const alerts = evaluateAlerts(draft, pricing);
  const number = orderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber: number,
      status: "pending_payment",
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
    },
  });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!stripeConfigured()) {
    // Dev fallback: mark paid without Stripe so local flow is testable
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid", paymentMethod: "ach_simulated" },
    });
    return NextResponse.json({
      url: `${site}/schedule/confirmation?order=${order.orderNumber}`,
      simulated: true,
    });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: draft.customer.email,
    // ACH first; card secondary
    payment_method_types: ["us_bank_account", "card"],
    payment_method_options: {
      us_bank_account: {
        financial_connections: { permissions: ["payment_method"] },
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: price.totalCents,
          product_data: {
            name: `California Art Delivery — ${number}`,
            description: "White-glove delivery service (ACH preferred)",
          },
        },
      },
    ],
    metadata: {
      orderId: order.id,
      orderNumber: number,
    },
    success_url: `${site}/schedule/confirmation?order=${number}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/schedule?step=review&canceled=1`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
