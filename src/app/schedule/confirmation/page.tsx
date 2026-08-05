import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You",
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; quote?: string }>;
}) {
  const { order: orderNumber, quote } = await searchParams;
  const order = orderNumber
    ? await prisma.order.findUnique({ where: { orderNumber } })
    : null;

  const isQuote =
    quote === "1" ||
    order?.status === "quote_pending" ||
    order?.paymentMethod === "quote_request";

  if (isQuote) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Thank You for Your Information
        </h1>
        <div className="mt-8 space-y-3 text-muted">
          {order && (
            <p>
              Reference{" "}
              <span className="font-medium text-foreground">{order.orderNumber}</span>
            </p>
          )}
          <p className="text-foreground">
            We will be working on this and providing you with a quote within 24 to 48
            hours.
          </p>
          {order && (
            <p>
              A confirmation will be sent to{" "}
              <span className="text-foreground">{order.customerEmail}</span>.
            </p>
          )}
        </div>
        <Link
          href="/"
          className="mt-10 inline-flex border border-black px-6 py-3 text-sm hover:bg-black hover:text-white"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Your Order Is Confirmed</h1>
      {order ? (
        <div className="mt-8 space-y-3 text-muted">
          <p>
            Order <span className="font-medium text-foreground">{order.orderNumber}</span>
          </p>
          <p>Status: {order.status}</p>
          <p>Total: {formatCents(order.totalCents)}</p>
          <p>
            A confirmation will be sent to{" "}
            <span className="text-foreground">{order.customerEmail}</span>.
          </p>
          {order.paymentMethod?.includes("ach") && (
            <p className="text-sm">
              Bank (ACH) payments may take a few business days to fully clear.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-6 text-muted">Thank you. Your payment is being processed.</p>
      )}
      <Link
        href="/"
        className="mt-10 inline-flex border border-black px-6 py-3 text-sm hover:bg-black hover:text-white"
      >
        Back to home
      </Link>
    </div>
  );
}
