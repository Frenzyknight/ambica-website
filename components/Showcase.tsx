"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal, RevealEyebrow } from "./RevealText";

const panels = [
  {
    title: "Apparel & Casual Wear",
    description:
      "Cotton, cotton twill, cotton-linen blends and rayon flex — soft, breathable cloth for everyday wear.",
    image: "/cotton.jpeg",
    alt: "Folded plaid and striped cotton fabrics stacked on a table",
  },
  {
    title: "Shirting",
    description:
      "Structured shirtings in PV and rayon-viscose blends — crisp hand, clean drape, built for tailored precision.",
    image: "/shirting-product.jpeg",
    alt: "Stack of folded striped dress shirts on a wooden table",
  },
  {
    title: "Suiting",
    description:
      "Suitings in wool, linen and silk blends — weight, texture and finish for formal and smart-casual wear.",
    image: "/suiting-product.jpeg",
    alt: "Tailoring threads and suiting fabrics with a jacket on a mannequin",
  },
  {
    title: "Prints, Dyes & Custom Development",
    description:
      "Printed and plain-dyed fabrics, plus bespoke fabric development to your exact specification.",
    image: "/printed.jpeg",
    alt: "Colourful dyed and printed fabric rolls with dye vats",
  },
];

export default function Showcase() {
  const [active, setActive] = useState(0);

  return (
    <section className="dark relative isolate overflow-hidden bg-ink-950 text-foreground">
      {/* woven fabric texture — matches footer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-screen"
        style={{
          backgroundImage: "url(/texture-final.jpg)",
          backgroundSize: "480px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:px-10 lg:pt-28">
        <div className="text-center">
          <RevealEyebrow centered>The possibility of Fabric</RevealEyebrow>
          <Reveal as="h2" className="mx-auto max-w-3xl text-balance text-display-sm uppercase text-ink-50">
            Cloth for{" "}
            <span className="text-brand-400">every application</span>
          </Reveal>
          <Reveal as="p" delay={0.08} className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-400">
            200+ fabric qualities across apparel, shirting, suiting, and
            custom development.
          </Reveal>
        </div>

        <div className="mt-14 flex flex-col gap-3 lg:mt-16 lg:h-[68vh] lg:min-h-[540px] lg:flex-row lg:gap-4">
          {panels.map((p, i) => {
            const isActive = i === active;
            return (
              <button
                key={p.title}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                className={`group relative isolate min-h-76 basis-0 grow cursor-pointer overflow-hidden rounded-3xl border border-border text-left transition-[flex-grow] duration-700 ease-out-expo will-change-[flex-grow] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-0 ${
                  isActive ? "lg:grow-2" : "lg:grow"
                }`}
              >
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 28vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  priority={i === 0}
                />

                {/* legibility scrim */}
                <div className="absolute inset-0 bg-linear-to-t from-ink-950/85 via-ink-950/20 to-transparent" />

                {/* index */}
                <span className="absolute left-6 top-6 font-mono text-lg tracking-[0.2em] text-ink-900">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* description — fades in above the horizontal title when active */}
                <p
                  className={`pointer-events-none absolute bottom-18 left-6 right-6 max-w-xs text-sm leading-relaxed text-ink-300 transition-opacity duration-500 lg:right-auto ${
                    isActive ? "opacity-100 lg:delay-200" : "opacity-100 lg:opacity-0"
                  }`}
                >
                  {p.description}
                </p>

                {/* title — vertical when collapsed, rotates to horizontal when active */}
                <h3
                  className={`absolute bottom-6 left-6 origin-bottom-left whitespace-nowrap text-2xl font-semibold tracking-tight text-ink-50 transition-transform duration-700 ease-out-expo ${
                    isActive
                      ? "rotate-0"
                      : "rotate-0 lg:translate-x-6 lg:-translate-y-4 lg:-rotate-90"
                  }`}
                >
                  {p.title}
                </h3>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
