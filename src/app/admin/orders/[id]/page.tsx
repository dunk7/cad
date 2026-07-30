import { isAdminAuthenticated } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import OrderNotesForm from "@/components/admin/OrderNotesForm";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  const items = JSON.parse(order.itemsJson || "[]") as Record<string, unknown>[];
  const pickup = JSON.parse(order.pickupJson || "{}") as Record<string, string>;
  const delivery = JSON.parse(order.deliveryJson || "{}") as Record<string, string>;
  const schedule = JSON.parse(order.scheduleJson || "{}") as Record<string, string>;
  const pricing = JSON.parse(order.pricingJson || "{}") as {
    lines?: { label: string; amountCents: number }[];
    totalCents?: number;
  };
  const alerts = JSON.parse(order.alertsJson || "[]") as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-muted hover:text-foreground">
            ← Orders
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {order.customerName} · {order.customerEmail}
            {order.customerPhone ? ` · ${order.customerPhone}` : ""}
          </p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted">Total</p>
          <p className="text-xl font-semibold">{formatCents(order.totalCents)}</p>
          <p className="text-xs text-muted">
            {order.status}
            {order.paymentMethod ? ` · ${order.paymentMethod}` : ""}
          </p>
        </div>
      </div>

      {!!alerts.length && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-950">Internal alerts</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {alerts.map((a) => (
              <li
                key={a}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-amber-200"
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Pickup">
          <Addr data={pickup} />
        </Card>
        <Card title="Delivery">
          <Addr data={delivery} />
        </Card>
      </div>

      <Card title="Schedule">
        <p className="text-sm">
          {schedule.label || "Route"}
          <br />
          Pickup {schedule.pickupDate} → Delivery {schedule.deliveryDate}
        </p>
      </Card>

      <Card title="Items">
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={String(item.id || i)} className="border-t border-black/5 pt-4 first:border-0 first:pt-0">
              <p className="font-medium capitalize">
                {String(item.category)} · qty {String(item.quantity || 1)}
              </p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-[#fafafa] p-3 text-xs text-muted">
                {JSON.stringify(item, null, 2)}
              </pre>
              {Array.isArray(item.photoUrls) && item.photoUrls.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(item.photoUrls as string[]).map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs underline"
                    >
                      Photo
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Pricing breakdown">
        <ul className="space-y-1 text-sm">
          {(pricing.lines || []).map((l, i) => (
            <li key={i} className="flex justify-between gap-4">
              <span className="text-muted">{l.label}</span>
              <span>{formatCents(l.amountCents)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Internal notes">
        <OrderNotesForm id={order.id} initial={order.internalNotes} />
      </Card>

      {order.stripeSessionId && (
        <p className="text-xs text-muted">Stripe session: {order.stripeSessionId}</p>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Addr({ data }: { data: Record<string, string> }) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-medium">{data.name}</p>
      <p className="text-muted">{data.phone}</p>
      <p>
        {data.address1}
        {data.address2 ? `, ${data.address2}` : ""}
      </p>
      <p>
        {data.city}, {data.state} {data.zip}
      </p>
      {data.parkingInstructions && (
        <p className="pt-2 text-muted">Parking: {data.parkingInstructions}</p>
      )}
      {data.accessInstructions && (
        <p className="text-muted">Access: {data.accessInstructions}</p>
      )}
    </div>
  );
}
