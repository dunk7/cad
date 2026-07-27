import ContactForm from "@/components/ContactForm";
import { contact } from "@/content/contact";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {contact.heading}
        </h1>
        <p className="mt-4 text-muted">{contact.subheading}</p>

        <div className="mt-10 space-y-6">
          <h2 className="text-xl font-semibold">Contact</h2>
          {contact.phones.map((phone) => (
            <div key={phone.number}>
              <p className="text-sm uppercase tracking-wide text-muted">
                {phone.region}
              </p>
              <a
                href={`tel:${phone.number.replace(/-/g, "")}`}
                className="mt-1 block text-2xl font-medium hover:underline"
              >
                {phone.number}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section>
        <ContactForm />
      </section>
    </div>
  );
}
