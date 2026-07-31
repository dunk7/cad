import Image from "next/image";
import Link from "next/link";
import ImageText from "@/components/ImageText";
import Reviews from "@/components/Reviews";
import {
  finalCta,
  hero,
  intro,
  serviceAreas,
  serviceSections,
} from "@/content/home";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[70vh] overflow-hidden bg-header text-white sm:min-h-[78vh]">
        <Image
          src={hero.image}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:min-h-[78vh] sm:px-6">
          <h1 className="translate-y-[25px] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            {hero.headline}
          </h1>
          <Link
            href={hero.ctaHref}
            className="mt-10 inline-flex translate-y-[75px] border-2 border-white bg-white px-12 py-5 text-xl font-semibold tracking-wide text-black transition hover:bg-transparent hover:text-white sm:mt-12 sm:px-16 sm:py-6 sm:text-2xl"
          >
            {hero.ctaLabel}
          </Link>
        </div>
      </section>

      <Reviews />

      <ImageText
        heading={intro.heading}
        body={intro.body}
        image={intro.image}
        dark
      />

      <section className="bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            {serviceAreas.heading}
          </h2>
          <p className="mt-3 text-center text-muted">{serviceAreas.label}</p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {serviceAreas.regions.map((region) => (
              <div key={region.name}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={region.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{region.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {region.places}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {serviceSections.map((section, i) => (
        <ImageText
          key={section.heading + i}
          heading={section.heading}
          body={section.body}
          image={section.image}
          imageRight={section.imageRight ?? i % 2 === 1}
          dark={i % 2 === 0}
        />
      ))}

      <section className="relative overflow-hidden bg-header text-white">
        <Image
          src={finalCta.image}
          alt=""
          fill
          className="object-cover opacity-40"
          sizes="100vw"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {finalCta.heading}
          </h2>
          <Link
            href={finalCta.ctaHref}
            className="mt-8 inline-flex border border-white px-8 py-3 text-sm font-medium tracking-wide transition hover:bg-white hover:text-black"
          >
            {finalCta.ctaLabel}
          </Link>
        </div>
      </section>
    </>
  );
}
