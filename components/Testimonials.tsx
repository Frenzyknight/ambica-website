"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import { Reveal, RevealEyebrow } from "./RevealText";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "We have repeated the same shirting quality four seasons running and the shade card still matches lot for lot.",
    name: "Rohit Agarwal",
    role: "Garment Manufacturer",
    initials: "RA",
    rating: 5,
  },
  {
    quote:
      "Buying straight from the mill changed our margins. Wide range, honest rates, and dispatch reaches our warehouse when they say it will.",
    name: "Vikram Shah",
    role: "Fabric Wholesaler",
    initials: "VS",
    rating: 5,
  },
  {
    quote:
      "They developed a custom finish for our capsule line and had samples back within the week. Bulk followed on time with no drop in quality.",
    name: "Ananya Deshmukh",
    role: "Fashion Label Owner",
    initials: "AD",
    rating: 5,
  },
];

const MAX_CARD_WIDTH = 400;
const GAP = 24;
const VISIBLE_CARDS = 3;
const VIEWPORT_MAX_WIDTH =
  VISIBLE_CARDS * MAX_CARD_WIDTH + (VISIBLE_CARDS - 1) * GAP;

function Stars({ count }: { count: number }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-1 text-brand-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill={i < count ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-border bg-surface">
      <div
        className="absolute inset-0 text-ink-500 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 6px), repeating-linear-gradient(-45deg, currentColor 0 1px, transparent 1px 6px)",
        }}
      />
      <span className="font-mono text-sm font-semibold tracking-widest text-accent">
        {initials}
      </span>
    </div>
  );
}

function QuoteMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`h-7 w-7 text-brand-500 ${className}`}
      fill="currentColor"
    >
      <path d="M10 6H4v7h4l-2 5h3l3-6V6zm10 0h-6v7h4l-2 5h3l3-6V6z" />
    </svg>
  );
}

function Card({
  testimonial,
  raised,
}: {
  testimonial: Testimonial;
  raised?: boolean;
}) {
  return (
    <figure
      className={`flex select-none flex-col items-center px-6 text-center transition-all duration-500 ease-out-expo ${
        raised
          ? "scale-100 rounded-3xl border border-border bg-surface py-12 opacity-100 shadow-lift"
          : "scale-[0.92] py-8 opacity-45"
      }`}
    >
      <QuoteMark />
      <blockquote className="mt-5 max-w-sm text-pretty text-sm italic leading-relaxed text-ink-700">
        {testimonial.quote}
      </blockquote>
      <div className="mt-8">
        <Avatar initials={testimonial.initials} />
      </div>
      <figcaption className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
        {testimonial.name}
      </figcaption>
      <p className="mt-1.5 text-xs text-muted">{testimonial.role}</p>
      <Stars count={testimonial.rating} />
    </figure>
  );
}

export default function Testimonials() {
  const total = testimonials.length;
  const [active, setActive] = useState(Math.floor(total / 2));

  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const x = useMotionValue(0);

  // Cap the card to the viewport so it never spills past the screen edge on
  // mobile (leaving a little room for the raised card's shadow to breathe).
  const cardWidth = Math.min(MAX_CARD_WIDTH, Math.max(0, viewportWidth - 32));
  const step = cardWidth + GAP;

  // Horizontal offset that puts the card at `index` in the center of the viewport.
  const offsetFor = useCallback(
    (index: number, width: number) =>
      (width - cardWidth) / 2 - index * step,
    [cardWidth, step],
  );

  // Measure the viewport so we can center cards regardless of screen size.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setViewportWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Snap x to the active card whenever the viewport size changes (no animation
  // on the first paint / resize so it doesn't slide unexpectedly).
  useEffect(() => {
    if (viewportWidth === 0) return;
    x.set(offsetFor(active, viewportWidth));
  }, [viewportWidth, active, offsetFor, x]);

  const snapTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(total - 1, index));
      setActive(clamped);
      animate(x, offsetFor(clamped, viewportWidth), {
        type: "spring",
        stiffness: 320,
        damping: 34,
      });
    },
    [offsetFor, total, viewportWidth, x],
  );

  const handleDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      // Project where the drag would land using its release velocity, then lock
      // onto whichever tile is closest.
      const projected = x.get() + info.velocity.x * 0.12;
      const index = Math.round(
        ((viewportWidth - cardWidth) / 2 - projected) / step,
      );
      snapTo(index);
    },
    [snapTo, viewportWidth, x, cardWidth, step],
  );

  const dragLeft = offsetFor(total - 1, viewportWidth);
  const dragRight = offsetFor(0, viewportWidth);

  return (
    <section id="testimonials" className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="text-center">
          <RevealEyebrow centered>Testimonials</RevealEyebrow>
          <Reveal as="h2" className="mx-auto max-w-2xl text-balance text-display-sm uppercase">
            Customers&rsquo;{" "}
            <span className="text-brand-600">Experience</span>
          </Reveal>
        </div>

        {/* Draggable, snapping strip. Grab and fling — it locks onto the
            nearest tile when released. Vertical padding + a matching negative
            margin give the raised card's shadow room to breathe without
            growing the section's overall spacing. */}
        <div className="mt-14 lg:mt-16">
          <div
            ref={viewportRef}
            className="relative -my-10 mx-auto overflow-hidden py-10"
            style={{ maxWidth: VIEWPORT_MAX_WIDTH }}
          >
            <motion.div
              className="flex cursor-grab items-center active:cursor-grabbing"
              style={{ x, gap: GAP }}
              drag="x"
              dragConstraints={{ left: dragLeft, right: dragRight }}
              dragElastic={0.16}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
            >
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => snapTo(i)}
                  aria-label={`Show testimonial from ${t.name}`}
                  className="shrink-0 focus:outline-none"
                  style={{ width: cardWidth }}
                  tabIndex={i === active ? 0 : -1}
                >
                  <Card testimonial={t} raised={i === active} />
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="mt-12 flex items-center justify-center gap-3">
          {testimonials.map((t, i) => {
            const isActive = i === active;
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => snapTo(i)}
                aria-label={`Show testimonial from ${t.name}`}
                aria-current={isActive}
                className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive ? "border border-brand-500" : ""
                }`}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "h-2 w-2 bg-brand-500"
                      : "h-2 w-2 bg-ink-300 hover:bg-ink-400"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
