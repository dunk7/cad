"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "ok">("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("ok");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold">Contact form</h2>
      {(
        [
          ["name", "Name", "text"],
          ["email", "Email", "email"],
          ["phone", "Phone number", "tel"],
        ] as const
      ).map(([id, label, type]) => (
        <div key={id}>
          <label htmlFor={id} className="sr-only">
            {label}
          </label>
          <input
            id={id}
            name={id}
            type={type}
            placeholder={label}
            required={id === "email" || id === "name"}
            className="w-full border border-black/20 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>
      ))}
      <div>
        <label htmlFor="comment" className="sr-only">
          Comment
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={5}
          placeholder="Comment"
          className="w-full border border-black/20 bg-white px-4 py-3 text-sm outline-none focus:border-black"
        />
      </div>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
        <input
          type="checkbox"
          name="sms"
          className="mt-1 h-4 w-4 shrink-0"
        />
        <span>
          By checking this box, you agree to receive SMS messages from California
          Art Delivery LLC related to pick up and delivery reminders and updates,
          follow ups, marketing and promotions. You may reply STOP to opt out at
          any time. Message and data rates may apply. Message frequency varies.
          View our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="underline">
            Terms & Conditions
          </Link>
          .
        </span>
      </label>
      <button
        type="submit"
        className="border border-black bg-black px-8 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black"
      >
        Send
      </button>
      {status === "ok" && (
        <p className="text-sm text-muted">
          Thanks — form submission will be wired up next. Please call us for
          urgent scheduling.
        </p>
      )}
    </form>
  );
}
