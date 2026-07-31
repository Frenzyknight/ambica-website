"use client";

import { Reveal, RevealEyebrow } from "./RevealText";

// TODO: replace with the live Google Form link before launch.
const LEAD_FORM_URL = "https://forms.gle/REPLACE_WITH_FORM_ID";

export default function CtaConsultation() {
  return (
    <section id="contact" className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="dark relative isolate overflow-hidden rounded-3xl border border-border bg-ink-950 px-8 py-16 text-center shadow-lift sm:px-12 lg:px-16 lg:py-20">
          {/* woven fabric texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-screen"
            style={{
              backgroundImage: "url(/texture-final.jpg)",
              backgroundSize: "480px",
              backgroundRepeat: "repeat",
            }}
          />
          <div className="relative">
            <RevealEyebrow centered className="text-brand-400">
              Get a custom quote
            </RevealEyebrow>
            <Reveal as="h2" className="mx-auto max-w-2xl text-balance text-display-sm uppercase text-ink-50">
              Tell us what you need.{" "}
              <span className="text-brand-400">We&apos;ll fabric it.</span>
            </Reveal>
            <Reveal as="p" delay={0.08} className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-ink-300">
              Share your fabric type, quantity and timeline in a two-minute
              form — our sourcing team will get back with pricing, samples
              and lead times within 24 hours.
            </Reveal>
            <Reveal delay={0.16} className="mt-9 flex justify-center">
              <a
                href={LEAD_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 ease-out-expo hover:bg-primary-hover hover:shadow-none"
              >
                Get my quote →
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
