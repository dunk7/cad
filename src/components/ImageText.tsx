import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  heading: string;
  body?: string;
  image: string;
  imageRight?: boolean;
  dark?: boolean;
  children?: ReactNode;
};

export default function ImageText({
  heading,
  body,
  image,
  imageRight,
  dark,
  children,
}: Props) {
  return (
    <section className={dark ? "bg-band text-white" : "bg-white text-foreground"}>
      <div
        className={`mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:gap-12 ${
          imageRight ? "" : ""
        }`}
      >
        <div
          className={`relative aspect-[4/3] overflow-hidden ${
            imageRight ? "md:order-2" : "md:order-1"
          }`}
        >
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className={imageRight ? "md:order-1" : "md:order-2"}>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h2>
          {body && (
            <p
              className={`mt-4 text-base leading-relaxed ${
                dark ? "text-white/80" : "text-muted"
              }`}
            >
              {body}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
