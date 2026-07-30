"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/routes", label: "Routes" },
];

export default function AdminShell({
  authed,
  children,
}: {
  authed: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f4f4f6] text-foreground">
      <header className="border-b border-black/10 bg-header text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Admin</p>
            <p className="text-lg font-semibold">California Art Delivery</p>
          </div>
          {authed && (
            <nav className="flex flex-wrap items-center gap-1 text-sm">
              {links.map((l) => {
                const active =
                  l.href === "/admin"
                    ? pathname === "/admin" || pathname.startsWith("/admin/orders")
                    : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`px-3 py-2 ${
                      active ? "bg-white/15" : "hover:bg-white/10"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => void logout()}
                className="ml-2 border border-white/30 px-3 py-1.5 text-xs hover:bg-white hover:text-black"
              >
                Log out
              </button>
            </nav>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
