"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-4 w-4 ${direction === "left" ? "rotate-180" : ""}`}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Showcase() {
  const [active, setActive] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateControls = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      setAtStart(track.scrollLeft <= 1);
      setAtEnd(track.scrollLeft >= maxScroll - 1);

      const center = track.scrollLeft + track.clientWidth / 2;
      const cards = Array.from(track.children) as HTMLElement[];
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setCurrentSlide(closestIndex);
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

        <div
          ref={trackRef}
          tabIndex={0}
          role="group"
          aria-label="Fabric applications"
          className="-mx-6 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-[8vw] pb-2 scrollbar-none sm:px-[15vw] lg:mx-0 lg:mt-16 lg:h-[68vh] lg:min-h-135 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
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
                className={`group relative isolate h-112 w-[84vw] shrink-0 snap-center cursor-pointer overflow-hidden rounded-3xl border border-ink-700 text-left shadow-lg transition-[flex-grow] duration-700 ease-out-expo will-change-[flex-grow] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-128 sm:w-[70vw] lg:h-auto lg:w-auto lg:basis-0 lg:snap-none lg:shadow-none ${
                  isActive ? "lg:grow-2" : "lg:grow"
                }`}
              >
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 640px) 70vw, 84vw"
                  className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  priority={i === 0}
                />

                {/* Deep image fade keeps the copy legible without another card. */}
                <div className="absolute inset-0 bg-linear-to-t from-ink-950 from-5% via-ink-950/55 via-45% to-transparent lg:from-ink-950/90 lg:via-ink-950/20" />

                <span className="absolute left-6 top-6 font-mono text-sm tracking-[0.2em] text-ink-100 drop-shadow-md lg:text-lg lg:text-ink-900">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="absolute inset-x-6 bottom-7 flex flex-col lg:bottom-6">
                  <h3
                    className={`order-1 origin-bottom-left text-balance text-xl font-semibold leading-tight tracking-tight text-ink-50 drop-shadow-md transition-transform duration-700 ease-out-expo sm:text-2xl lg:order-2 lg:whitespace-nowrap ${
                      isActive
                        ? "rotate-0"
                        : "rotate-0 lg:translate-x-6 lg:-translate-y-4 lg:-rotate-90"
                    }`}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={`pointer-events-none order-2 mt-3 max-w-sm border-l-2 border-brand-400 pl-4 text-sm leading-6 text-ink-100 drop-shadow-md transition-opacity duration-500 lg:order-1 lg:mt-0 lg:mb-3 lg:border-0 lg:pl-0 lg:text-ink-300 ${
                      isActive
                        ? "opacity-100 lg:delay-200"
                        : "opacity-100 lg:opacity-0"
                    }`}
                  >
                    {p.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between lg:hidden">
          <span className="font-mono text-xs tracking-[0.18em] text-ink-400">
            {String(currentSlide + 1).padStart(2, "0")} /{" "}
            {String(panels.length).padStart(2, "0")}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={atStart}
              aria-label="Previous fabric application"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-700 text-ink-50 transition-colors hover:border-brand-400 hover:text-brand-400 disabled:pointer-events-none disabled:opacity-35"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={atEnd}
              aria-label="Next fabric application"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-700 text-ink-50 transition-colors hover:border-brand-400 hover:text-brand-400 disabled:pointer-events-none disabled:opacity-35"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
