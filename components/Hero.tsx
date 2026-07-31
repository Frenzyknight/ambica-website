"use client";

import Link from "next/link";
import ClothCanvas from "./ClothCanvas";
import SiteHeader from "./SiteHeader";
import { Reveal, RevealEyebrow, RevealStagger } from "./RevealText";

export default function Hero() {
  return (
    <section className="dark relative h-svh min-h-[640px] w-full overflow-hidden bg-ink-950 text-foreground">
      {/* Cloth simulation backdrop */}
      <div className="absolute inset-0">
        <ClothCanvas />
      </div>

      {/* Legibility scrims — pointer-events-none so the cloth still feels the cursor */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/60 via-transparent to-ink-950/70" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/45 via-transparent to-transparent" />

      {/* Nav */}
      <SiteHeader />

      {/* Copy */}
      <div className="pointer-events-none relative z-10 flex h-full items-end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10 lg:pb-24">
          <RevealEyebrow
            immediate
            delay={0.15}
            className="text-brand-400"
            lineClassName="bg-brand-500"
          >
            A mark of quality
          </RevealEyebrow>
          <RevealStagger
            as="h1"
            immediate
            delay={0.28}
            stagger={0.12}
            className="max-w-3xl text-balance text-display-lg text-ink-50"
          >
            <>Fabric you can</>
            <>
              <span className="text-brand-400">feel</span> before you touch.
            </>
          </RevealStagger>
          <Reveal
            as="p"
            immediate
            delay={0.55}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-300"
          >
            Three generations of manufacturing, and obsessing over the drape.
            Ambica synfab is made to move.
          </Reveal>
          <Reveal
            immediate
            delay={0.72}
            className="pointer-events-auto mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="#fabrics"
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 ease-out-expo hover:bg-primary-hover hover:shadow-none"
            >
              Explore fabrics
            </Link>
            <Link
              href="#craft"
              className="rounded-full border border-ink-600 px-7 py-3.5 text-sm font-semibold text-ink-100 transition-colors hover:border-brand-500 hover:text-brand-400"
            >
              Our craft
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
