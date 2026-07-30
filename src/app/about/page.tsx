import Image from "next/image";
import type { Metadata } from "next";
import { aboutIntro, team } from "@/content/about";

export const metadata: Metadata = {
  title: "About Us",
};

export default function AboutPage() {
  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2">
        {aboutIntro.bannerImages.map((src) => (
          <div key={src} className="relative aspect-[16/10] sm:aspect-[4/3]">
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
              priority
            />
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {aboutIntro.heading}
        </h1>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-muted">
          {aboutIntro.paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
      </section>

      <section className="border-t border-black/5 bg-[#f7f7f7]">
        <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6">
          {team.map((member, index) => (
            <article
              key={member.name}
              className="grid items-start gap-8 md:grid-cols-2 md:gap-12"
            >
              {member.image && (
                <div
                  className={`relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden ${
                    index % 2 === 1 ? "md:order-2" : ""
                  }`}
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                    sizes="(min-width: 768px) 40vw, 100vw"
                  />
                </div>
              )}
              <div className={index % 2 === 1 ? "md:order-1" : ""}>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {member.name}
                </h2>
                <p className="mt-1 text-lg text-muted">{member.title}</p>
                <div className="mt-5 space-y-4 text-base leading-relaxed text-muted">
                  {member.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
