"use client";

import Image from "next/image";
import FluidBlobReveal from "@/components/FluidBlobReveal";
import { Reveal, RevealEyebrow } from "@/components/RevealText";

type Subsidiary = {
  logo: string;
  name: string;
  short: string;
  tagline: string;
  description: string;
  image?: string;
  imageAlt: string;
  accent: string;
};

function BrandCover({ logo }: { logo: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 14px), repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 14px)",
        }}
      />
      <div className="relative h-28 w-28 sm:h-36 sm:w-36">
        <Image
          src={logo}
          alt=""
          fill
          sizes="144px"
          className="object-contain brightness-0 invert"
          aria-hidden
        />
      </div>
    </div>
  );
}

export default function SubsidiariesContent({
  subsidiaries,
}: {
  subsidiaries: Subsidiary[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <RevealEyebrow centered>The Ambica group</RevealEyebrow>
        <Reveal as="h2" className="text-balance text-display-sm uppercase text-ink-900">
          Two mills, one <span className="text-brand-600">mark of quality</span>
        </Reveal>
        <Reveal as="p" delay={0.08} className="mx-auto mt-6 max-w-xl text-pretty text-sm leading-relaxed text-ink-600">
          Our subsidiary companies extend Ambica&apos;s reach across the
          textile value chain, each specialising in its own craft while
          holding to the same standard.
        </Reveal>
      </div>

      <div className="mt-16 flex flex-col gap-12 lg:mt-24 lg:gap-20">
        {subsidiaries.map((s, index) => (
          <article
            key={s.short}
            className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
          >
            <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
              {s.image ? (
                <FluidBlobReveal
                  image={s.image}
                  imageAlt={s.imageAlt}
                  coverColor={s.accent}
                  coverContent={<BrandCover logo={s.logo} />}
                  revealSize={96}
                  edgeSoftness={14}
                  gooStrength={18}
                  trailLag={0.22}
                  fadeDelay={320}
                  fadeTime={900}
                />
              ) : null}
            </div>

            <div className={index % 2 === 1 ? "lg:order-1" : undefined}>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
                  <Image
                    src={s.logo}
                    alt={`${s.name} logo`}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
              </div>

              <Reveal as="h3" delay={0.05} className="mt-6 text-balance text-2xl uppercase text-ink-900 lg:text-display-sm">
                {s.name}
              </Reveal>
              <Reveal
                as="p"
                delay={0.1}
                className="mt-2 text-sm font-medium italic"
                style={{ color: s.accent }}
              >
                {s.tagline}
              </Reveal>
              <Reveal as="p" delay={0.14} className="mt-5 max-w-lg text-pretty text-sm leading-relaxed text-ink-600">
                {s.description}
              </Reveal>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
