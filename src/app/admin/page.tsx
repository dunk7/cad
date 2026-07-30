import { isAdminAuthenticated } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { q, status } = await searchParams;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const filtered = orders.filter((o) => {
    if (status && o.status !== status) return false;
    if (!q) return true;
    const hay = `${o.orderNumber} ${o.customerName} ${o.customerEmail}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-muted">
            {filtered.length} shown · paid confirmation required for standard jobs
          </p>
        </div>
        <form className="flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, email, order #"
            className="min-w-[220px] border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black"
          />
          <select
            name="status"
            defaultValue={status || ""}
            className="border border-black/15 bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending_payment">Pending payment</option>
            <option value="payment_failed">Payment failed</option>
          </select>
          <button
            type="submit"
            className="border border-black bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-[#fafafa] text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Schedule</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Alerts</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  No orders yet. Completed Schedule Now checkouts will appear here.
                </td>
              </tr>
            )}
            {filtered.map((o) => {
              const schedule = JSON.parse(o.scheduleJson || "{}") as {
                pickupDate?: string;
                deliveryDate?: string;
              };
              const alerts = JSON.parse(o.alertsJson || "[]") as string[];
              return (
                <tr key={o.id} className="border-t border-black/5 hover:bg-[#fafafa]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-muted">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{o.customerName}</p>
                    <p className="text-xs text-muted">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {schedule.pickupDate || "—"}
                    <span className="mx-1">→</span>
                    {schedule.deliveryDate || "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCents(o.totalCents)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} method={o.paymentMethod} />
                  </td>
                  <td className="px-4 py-3">
                    {alerts.length ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        {alerts.length} alert{alerts.length === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  method,
}: {
  status: string;
  method: string | null;
}) {
  const color =
    status === "paid"
      ? "bg-emerald-100 text-emerald-900"
      : status === "payment_failed"
        ? "bg-red-100 text-red-900"
        : "bg-neutral-100 text-neutral-800";
  return (
    <div>
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
        {status.replace(/_/g, " ")}
      </span>
      {method && (
        <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
          {method.includes("ach") ? "ACH" : method}
        </p>
      )}
    </div>
  );
}
