"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok">("idle");

  function onSubscribe(e: FormEvent) {
    e.preventDefault();
    setStatus("ok");
    setEmail("");
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-band text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Subscribe to our emails
          </h2>
          <form
            onSubmit={onSubscribe}
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch"
          >
            <label className="sr-only" htmlFor="footer-email">
              Email
            </label>
            <input
              id="footer-email"
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 border border-white/30 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/50 focus:border-white"
            />
            <button
              type="submit"
              className="border border-white bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-transparent hover:text-white"
            >
              Subscribe
            </button>
          </form>
          {status === "ok" && (
            <p className="mt-3 text-sm text-white/70">
              Thanks — subscription will be wired up next.
            </p>
          )}
        </div>

        <div className="md:text-right">
          <Link href="/" className="text-lg font-medium hover:opacity-80">
            California Art Delivery
          </Link>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75 md:justify-end">
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms of service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} California Art Delivery LLC
      </div>
    </footer>
  );
}
