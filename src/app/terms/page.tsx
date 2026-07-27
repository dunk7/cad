import { terms } from "@/content/policies";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: terms.title,
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{terms.title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated {terms.updated}</p>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted">
        {terms.paragraphs.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>
    </article>
  );
}
