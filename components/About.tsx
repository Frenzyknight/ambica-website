"use client";

import Image from "next/image";
import { Reveal, RevealEyebrow } from "./RevealText";

const features = [
  {
    label: "Sustainable Fabrics",
    description:
      "Natural Fabrics sourced responsibly for a softer hand and longer life.",
    icon: (
      <>
        <path d="M20 34c0-8 6-14 14-14M20 34c0 8 6 14 14 14M20 34h28" />
        <path d="M34 12c6 3 10 9 10 16s-4 13-10 16" />
        <path d="M34 12v40" />
      </>
    ),
  },
  {
    label: "Quality Control",
    description:
      "Every cloth inspected against strict GSM, shade and shrinkage standards.",
    icon: (
      <>
        <circle cx="30" cy="30" r="16" />
        <path d="M23 30l5 5 10-11" />
      </>
    ),
  },
  {
    label: "Expert Manufacturers",
    description:
      "Decades at the loom, refining every cloth for drape, weight and touch.",
    icon: (
      <>
        <circle cx="30" cy="22" r="7" />
        <path d="M16 46c0-8 6-13 14-13s14 5 14 13" />
      </>
    ),
  },
  {
    label: "Custom Finishing",
    description:
      "Fabric sourced to your composition, width and construction, every lot matched before it moves forward.",
    icon: (
      <>
        <path d="M22 14h16v10a8 8 0 01-16 0z" />
        <path d="M22 46h16V36a8 8 0 00-16 0z" />
        <path d="M20 14h20M20 46h20" />
      </>
    ),
  },
];

function Photo({
  src,
  alt,
  className = "",
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(min-width: 1024px) 50vw, 100vw"}
        className="object-cover"
        preload={priority}
      />
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 lg:px-10 lg:pt-28 lg:pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — hero image */}
          <Photo
            src="/about-mill-floor.webp"
            alt="Weaver inspecting freshly woven greige cloth coming off the beam at the Ambica mill"
            className="aspect-4/5 w-full lg:aspect-auto lg:h-full lg:min-h-[460px]"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />

          {/* Right — copy + supporting images */}
          <div className="relative">
            {/* decorative loom rings */}
            <svg
              aria-hidden
              viewBox="0 0 200 200"
              className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 text-brand-500 opacity-20 lg:h-56 lg:w-56"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              {[92, 76, 60, 44, 28].map((r) => (
                <circle key={r} cx="100" cy="100" r={r} />
              ))}
            </svg>

            <RevealEyebrow>About the Company</RevealEyebrow>
            <Reveal as="h2" className="max-w-xl text-balance text-display-sm uppercase">
              Premium textile sourcing from{" "}
              <span className="text-brand-600">raw material</span> to finished
              cloth
            </Reveal>
            <Reveal as="p" delay={0.08} className="mt-5 max-w-lg text-pretty leading-relaxed text-muted">
              End-to-end manufacturing covers weaving, dyeing, finishing and
              quality assurance, so brands can stay focused on design while
              we obsess over the drape.
            </Reveal>

            <div className="relative mt-8 grid grid-cols-2 gap-4">
              <Photo
                src="/about-yarn.webp"
                alt="Raw cotton yarn cones on a creel rack, a single thread drawn by hand"
                className="aspect-square"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
              <Photo
                src="/square-2.webp"
                alt="Quality check of finished denim fabric on a light table"
                className="aspect-square"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />

              {/* Years-of-experience badge */}
              <div className="absolute -right-2 -top-10 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-primary text-center text-primary-foreground shadow-glow lg:-right-6 lg:h-28 lg:w-28">
                <span className="text-2xl font-semibold leading-none lg:text-3xl">
                  40
                </span>
                <span className="mt-1 font-mono text-[9px] uppercase leading-tight tracking-[0.18em] lg:text-[10px]">
                  Years of
                  <br />
                  Experience
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature row */}
        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 lg:mt-24 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal
              key={f.label}
              delay={i * 0.08}
              className="flex flex-col items-center text-center"
            >
              <svg
                viewBox="0 0 60 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-14 w-14 text-accent"
              >
                {f.icon}
              </svg>
              <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
                {f.label}
              </p>
              <p className="mt-3 max-w-60 text-sm leading-relaxed text-muted">
                {f.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
