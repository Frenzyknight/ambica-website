"use client";

import Image from "next/image";
import { Reveal, RevealEyebrow } from "./RevealText";

const usps = [
  {
    title: "Quality, Every Time",
    description:
      "Soft, colour-fast, built to last — and checked against the same standard on every batch.",
    icon: (
      <>
        <path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z" />
        <path d="M9 11l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Wide Range, Honest Price",
    description:
      "Hundreds of fabrics and finishes, competetive pricing, no middleman tax.",
    icon: (
      <>
        <path d="M4 6h16M4 12h16M4 18h10" />
      </>
    ),
  },
  {
    title: "Scale Without the Wait",
    description:
      "Bulk manufacturing and deep inventory handle small runs to big orders alike.",
    icon: (
      <>
        <path d="M4 20V10l6-4 6 4v10M4 20h16M10 20v-6h4v6" />
      </>
    ),
  },
  {
    title: "Fast, Reliable Delivery",
    description:
      "Quick sampling and PAN India dispatch, on your timeline, every time.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  },
];

function ThumbPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-surface text-ink-600">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 6px), repeating-linear-gradient(-45deg, currentColor 0 1px, transparent 1px 6px)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-accent">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          {children}
        </svg>
      </div>
    </div>
  );
}

export default function FabricUsps() {
  return (
    <section id="fabrics" className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="relative rounded-3xl border border-border bg-surface-raised shadow-lift">
          {/* Content */}
          <div className="px-8 py-12 lg:max-w-[52%] lg:px-14 lg:py-16">
            <RevealEyebrow>Why our cloth</RevealEyebrow>
            <Reveal as="h2" className="max-w-md text-balance text-display-sm uppercase">
              Open your mind to the{" "}
              <span className="text-brand-600">possibility of fabric</span>
            </Reveal>

            <div className="mt-10 flex flex-col gap-8 lg:mt-12">
              {usps.map((u, i) => (
                <Reveal key={u.title} delay={i * 0.08} className="flex items-start gap-5">
                  <ThumbPlaceholder>{u.icon}</ThumbPlaceholder>
                  <div>
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em]">
                      {u.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                      {u.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Hero image — floats and bleeds above the card on large screens */}
          <div className="relative mx-8 mb-10 h-80 overflow-hidden rounded-3xl border border-border bg-surface sm:h-96 lg:absolute lg:right-8 lg:bottom-8 lg:-top-14 lg:mx-0 lg:mb-0 lg:h-auto lg:w-[42%]">
            <Image
              src="/usp-hero.jpeg"
              alt="Close-up of draped indigo fabric showing its weave and softness"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
