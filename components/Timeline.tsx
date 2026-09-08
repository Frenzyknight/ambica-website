"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Reveal, RevealEyebrow } from "./RevealText";

type Milestone = {
  year: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
};

// The thread's resting anchor: far left on mobile, dead-centre on desktop.
// The wavy path oscillates around this line, and every rider (dots, shuttle)
// is positioned from the same measured geometry so they stay glued to it.
const LINE_X = "left-6 lg:left-1/2";

const milestones: Milestone[] = [
  {
    year: "1992",
    title: "The Beginning",
    body: "Founders moved from Bhadra to Ahmedabad with a vision to learn something in the textile sector. In 1993, Ambica was established with a vision to deliver quality textile solutions built on trust, integrity, and craftsmanship — starting in one small room in the New Cloth Market.",
    image: "/timeline-1992.webp",
    imageAlt:
      "Two young traders working in a one-room fabric shop in Ahmedabad’s New Cloth Market",
  },
  {
    year: "2001",
    title: "Business Expansion",
    body: "Bought our own big space in the market, expanded into a wide range of fabrics, and strengthened relationships with manufacturers across India. In 2010, Ambica was officially registered.",
    image: "/timeline-2001.webp",
    imageAlt:
      "Traders spreading printed fabric across the counter of Ambica’s own cloth market showroom",
  },
  {
    year: "2017",
    title: "Growing Presence",
    body: "Expanded operations, increased product portfolio, and enhanced supply chain capabilities to meet growing customer demands.",
    image: "/timeline-2014.webp",
    imageAlt: "Fabric rolls being loaded at the Ambica warehouse",
  },
  {
    year: "2021",
    title: "Building Strong Partnerships",
    body: "Started two subsidiary firms — Nirbhay Textile Mill and Dharun Textile Mill — further expanding the business into digital print shirts and plain dyeing respectively.",
    image: "/timeline-2026.webp",
    imageAlt: "Plain dyeing at Dharun Textile Mill with steaming vats and drying racks",
  },
  {
    year: "2026 & Beyond",
    title: "Future Vision",
    body: "To become one of India’s most trusted textile sourcing and manufacturing partners by embracing innovation, sustainability, and long-term relationships.",
    image: "/timeline-2023.webp",
    imageAlt:
      "Ambica team reviewing fabric swatches against a curated fabric wall in a modern showroom",
  },
];

function MilestoneImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mt-6 aspect-4/3 w-full overflow-hidden rounded-2xl border border-border bg-surface">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}

function Entry({
  milestone,
  index,
}: {
  milestone: Milestone;
  index: number;
}) {
  const isRight = index % 2 === 1;

  return (
    <div className={`relative pl-16 lg:pl-0 ${index > 0 ? "mt-20 lg:mt-32" : ""}`}>
      {/* invisible anchor the parent measures to drop a dot onto the curve */}
      <span
        data-marker
        aria-hidden
        className={`pointer-events-none absolute top-1.5 h-4 w-0 ${LINE_X}`}
      />

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={
            isRight
              ? "lg:col-start-2 lg:pl-16"
              : "lg:col-start-1 lg:pr-16 lg:text-right"
          }
        >
          <p className="font-mono text-2xl font-semibold tracking-tight text-accent lg:text-3xl">
            {milestone.year}
          </p>
          <h3 className="mt-2 text-balance text-2xl font-semibold tracking-tight lg:text-[1.75rem]">
            {milestone.title}
          </h3>
          <p
            className={`mt-4 max-w-md text-pretty leading-relaxed text-muted ${
              isRight ? "" : "lg:ml-auto"
            }`}
          >
            {milestone.body}
          </p>
          <MilestoneImage src={milestone.image} alt={milestone.imageAlt} />
        </motion.div>
      </div>
    </div>
  );
}

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Measured geometry of the timeline column, plus where each milestone's
  // marker sits vertically — everything the curve maths needs.
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [markerYs, setMarkerYs] = useState<number[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const markers = el.querySelectorAll<HTMLElement>("[data-marker]");
      setMarkerYs(
        Array.from(markers).map((m) => {
          const r = m.getBoundingClientRect();
          return r.top - rect.top + r.height / 2;
        }),
      );
      setSize({ w: el.clientWidth, h: el.scrollHeight });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Progress runs from the moment the thread's top reaches the middle of the
  // viewport to the moment its bottom does — so the fill + shuttle track the
  // reader's eye down the page.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  const shuttleDistance = useTransform(progress, [0, 1], ["0%", "100%"]);

  // A sine that swings left/right as it travels top → bottom. Because x is a
  // pure function of y, the marker dots can be pinned to it analytically.
  const isDesktop = size.w >= 1024;
  const centerX = isDesktop ? size.w / 2 : 24; // matches LINE_X (left-6 / left-1/2)
  const amplitude = isDesktop ? Math.min(56, size.w * 0.045) : 14;
  const wavelength = isDesktop ? 620 : 480;
  const waveX = (y: number) =>
    centerX + amplitude * Math.sin((y / wavelength) * Math.PI * 2);

  // Tilt the shuttle to the path's tangent so it leans into each swing rather
  // than pointing in a fixed direction. dx/dy of the wave gives the slope; the
  // angle from vertical keeps it upright on the straight stretches.
  const shuttleAngle = useTransform(progress, (p) => {
    if (!size.h) return 0;
    const y = p * size.h;
    const dx =
      amplitude *
      Math.cos((y / wavelength) * Math.PI * 2) *
      ((Math.PI * 2) / wavelength);
    return (-Math.atan(dx) * 180) / Math.PI;
  });

  const ready = size.w > 0 && size.h > 0;

  // Sample the wave into a polyline path shared by the SVG stroke and the
  // shuttle's CSS offset-path, so the shuttle rides exactly what's drawn.
  let path = "";
  if (ready) {
    const step = 10;
    path = `M ${waveX(0).toFixed(2)} 0`;
    for (let y = step; y < size.h; y += step) {
      path += ` L ${waveX(y).toFixed(2)} ${y}`;
    }
    path += ` L ${waveX(size.h).toFixed(2)} ${size.h}`;
  }

  return (
    <section id="timeline" className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        {/* Header */}
        <div className="text-center">
          <RevealEyebrow centered>Our Journey</RevealEyebrow>
          <Reveal as="h2" className="mx-auto max-w-3xl text-balance text-display-sm uppercase">
            Woven through the{" "}
            <span className="text-brand-600">decades</span>
          </Reveal>
          <Reveal as="p" delay={0.08} className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-muted">
            From a small room in the New Cloth Market to a trusted textile
            partner — the milestones that shaped Ambica.
          </Reveal>
        </div>

        {/* Timeline */}
        <div ref={containerRef} className="relative mt-16 lg:mt-24">
          {ready && (
            <svg
              aria-hidden
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}
              fill="none"
              className="pointer-events-none absolute inset-0 z-0"
            >
              {/* base track */}
              <path
                d={path}
                stroke="var(--color-border)"
                strokeWidth={2}
                strokeLinecap="round"
              />
              {/* progress fill — draws itself in as you scroll */}
              <motion.path
                d={path}
                stroke="var(--color-brand-500)"
                strokeWidth={2}
                strokeLinecap="round"
                style={{ pathLength: progress }}
              />
            </svg>
          )}

          {/* marker dots, pinned onto the curve at each milestone */}
          {ready &&
            markerYs.map((y, i) => (
              <span
                key={i}
                aria-hidden
                style={{ left: waveX(y), top: y }}
                className="absolute z-20 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background ring-2 ring-brand-500"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              </span>
            ))}

          {/* the shuttle rides the thread via offset-path. Its PNG sits on
              white, so mix-blend-multiply drops the background out here. */}
          {ready && (
            <motion.div
              aria-hidden
              style={{
                offsetPath: `path("${path}")`,
                offsetRotate: "0deg",
                offsetDistance: shuttleDistance,
                rotate: shuttleAngle,
              }}
              className="pointer-events-none absolute left-0 top-0 z-30 w-40 lg:w-48"
            >
              <Image
                src="/shuttle-old.webp"
                alt=""
                width={512}
                height={512}
                className="h-auto w-full mix-blend-multiply drop-shadow-[0_10px_20px_rgba(23,22,20,0.18)]"
                loading="eager"
                fetchPriority="high"
              />
            </motion.div>
          )}

          {milestones.map((milestone, index) => (
            <Entry key={milestone.year} milestone={milestone} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
