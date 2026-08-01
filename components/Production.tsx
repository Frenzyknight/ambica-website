"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal, RevealEyebrow } from "./RevealText";

const steps = [
  {
    title: "Procurement of Grey Fabric",
    description:
      "Premium-quality grey fabric is sourced from reputed weaving units, each lot selected against the customer's specifications — composition, construction, GSM and width.",
    image: "/Procurement.jpeg",
    imageAlt: "Grey fabric rolls stacked in a warehouse for procurement",
  },
  {
    title: "Processing",
    description:
      "Pre-inspected fabric is sent to our best-in-class processing partners for dyeing, printing and finishing — coordinated closely to lock in the desired shade and finish.",
    image: "/Processing.jpeg",
    imageAlt: "Fabric being dyed and finished on industrial processing machines",
  },
  {
    title: "Quality Check",
    description:
      "Every roll is visually inspected for shade consistency, appearance and overall quality before dispatch, so it meets customer expectations before it leaves us.",
    image: "/Quality%20Check.jpeg",
    imageAlt: "Inspector examining fabric quality with a magnifying glass",
  },
  {
    title: "Rolling & Packaging",
    description:
      "Finished fabric is packed in standard 100-metre rolls, or in customised lengths and packaging as specified — with custom labelling available on request.",
    image: "/Packaging.jpeg",
    imageAlt: "Finished fabric rolls being wrapped and stacked on pallets",
  },
  {
    title: "Dispatch",
    description:
      "Packed fabric is dispatched through reliable logistics partners, ensuring timely and secure delivery across domestic and international markets.",
    image: "/export.jpeg",
    imageAlt: "Fabric rolls being loaded into a shipping container for export",
  },
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isDesktop;
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${direction === "left" ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function StepImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mt-5 aspect-4/3 overflow-hidden rounded-2xl border border-border bg-surface">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 28rem"
        className="object-cover"
      />
    </div>
  );
}

function StepCard({
  step,
  index,
  total,
  isDesktop,
}: {
  step: (typeof steps)[number];
  index: number;
  total: number;
  isDesktop: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const isRight = index % 2 === 1;
  const isLast = index === total - 1;
  const tilt = isRight ? 2.5 : -2;

  // Previous cards lift up, shrink and fade as the next one rises. The last
  // card just scrolls away naturally (nothing follows it in the stack).
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    isLast ? [1, 1, 1] : [1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    isLast ? [0, 0, 0] : [0, 0, -110]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    isLast ? [1, 1, 1] : [1, 1, 0.92]
  );

  return (
    <div
      ref={ref}
      className={`w-[84vw] shrink-0 snap-center lg:flex lg:h-[90vh] lg:min-h-150 lg:w-auto ${
        isRight ? "lg:justify-end" : "lg:justify-start"
      } ${index > 0 ? "lg:mt-24" : ""}`}
    >
      <motion.article
        style={
          isDesktop
            ? { opacity, y, scale, rotate: tilt }
            : undefined
        }
        className="relative isolate w-full max-w-md overflow-hidden rounded-[1.75rem] border border-border bg-white p-6 text-ink-950 shadow-lift lg:sticky lg:top-28 lg:h-fit lg:self-start lg:p-7"
      >
        {/* woven fabric texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply"
          style={{
            backgroundImage: "url(/texture-final.jpg)",
            backgroundSize: "280px",
            backgroundRepeat: "repeat",
          }}
        />

        <div className="relative">
          <Reveal as="h3" y={20} className="text-2xl font-semibold tracking-tight lg:text-[1.75rem]">
            {step.title}
          </Reveal>
          <Reveal as="p" delay={0.06} y={16} className="mt-1 font-mono text-sm font-semibold tracking-[0.15em] text-accent">
            {String(index + 1).padStart(3, "0")}
          </Reveal>

          <StepImage src={step.image} alt={step.imageAlt} />

          <Reveal as="p" delay={0.1} y={16} className="mt-5 max-w-sm text-pretty text-[0.9375rem] leading-relaxed text-ink-700">
            {step.description}
          </Reveal>
        </div>
      </motion.article>
    </div>
  );
}

export default function Production({
  className = "",
}: {
  className?: string;
}) {
  const isDesktop = useIsDesktop();
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateControls = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      setAtStart(track.scrollLeft <= 1);
      setAtEnd(track.scrollLeft >= maxScroll - 1);
    };

    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    const resizeObserver = new ResizeObserver(updateControls);
    resizeObserver.observe(track);

    return () => {
      track.removeEventListener("scroll", updateControls);
      resizeObserver.disconnect();
    };
  }, []);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const second = track.children[1] as HTMLElement | null;
    const step =
      first && second
        ? second.offsetLeft - first.offsetLeft
        : (first?.offsetWidth ?? track.clientWidth);
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section
      id="production"
      className={`bg-background text-foreground ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* Left — sticky heading */}
          <div className="lg:sticky lg:top-28 lg:h-fit lg:self-start">
            <RevealEyebrow>How it&apos;s made</RevealEyebrow>
            <Reveal as="h2" className="max-w-md text-balance text-display-sm uppercase">
              From grey cloth to{" "}
              <span className="text-brand-600">finished fabric</span>
            </Reveal>
            <Reveal as="p" delay={0.08} className="mt-6 max-w-md text-pretty leading-relaxed text-muted">
              Every metre passes through five deliberate stages — sourcing,
              processing, inspection, packing and dispatch — coordinated end to
              end so the fabric that reaches you is exactly the fabric you
              specified.
            </Reveal>

            <Reveal delay={0.14}>
              <Link
                href="/#contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                Start a project
                <span aria-hidden>→</span>
              </Link>
            </Reveal>
          </div>

          {/* Swipe carousel on mobile; stacked cards on desktop */}
          <div className="min-w-0">
            <div
              ref={trackRef}
              tabIndex={0}
              role="group"
              aria-label="Fabric production stages"
              className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth px-[8vw] pb-4 scrollbar-none lg:mx-0 lg:block lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
            >
              {steps.map((step, i) => (
                <StepCard
                  key={step.title}
                  step={step}
                  index={i}
                  total={steps.length}
                  isDesktop={isDesktop}
                />
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between lg:hidden">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                Swipe or use arrows
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => scrollByCard(-1)}
                  disabled={atStart}
                  aria-label="Previous production stage"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-raised transition-colors hover:border-brand-500 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-35"
                >
                  <ArrowIcon direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCard(1)}
                  disabled={atEnd}
                  aria-label="Next production stage"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-raised transition-colors hover:border-brand-500 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-35"
                >
                  <ArrowIcon direction="right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
