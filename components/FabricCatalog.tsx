"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Reveal } from "./RevealText";

// TODO: replace with the live enquiry / Google Form link before launch.
const ENQUIRE_URL = "https://forms.gle/REPLACE_WITH_FORM_ID";

type Slide = {
  src: string;
  alt: string;
};

type Fabric = {
  // TODO: replace placeholder names and specs with the real catalogue copy.
  name: string;
  spec: string;
  /** Slide 0 is the garment shot, slide 1 is the fabric in the same print. */
  slides: [Slide, Slide];
};

const fabrics: Fabric[] = [
  {
    name: "Mudcloth Grid",
    spec: "Cotton Poplin · 120 GSM",
    slides: [
      {
        src: "/collection/mudcloth-model.webp",
        alt: "Model in a forest green full-sleeve shirt with white mudcloth brush print",
      },
      {
        src: "/collection/mudcloth-fabric.webp",
        alt: "Folded green and maroon mudcloth brush print fabrics stacked on a beige background",
      },
    ],
  },
  {
    name: "Botanical Leaf",
    spec: "Cotton Voile · 100 GSM",
    slides: [
      {
        src: "/collection/leaf-model.webp",
        alt: "Model in a white half-sleeve shirt with soft green leaf print",
      },
      {
        src: "/collection/leaf-fabric.webp",
        alt: "Three folded leaf print fabrics in beige, blue and green on a cream background",
      },
    ],
  },
  {
    name: "Classic Pinstripe",
    spec: "Yarn-Dyed Cotton · 110 GSM",
    slides: [
      {
        src: "/collection/pinstripe-model.webp",
        alt: "Model in a navy and white pinstripe half-sleeve shirt",
      },
      {
        src: "/collection/pinstripe-fabric.webp",
        alt: "Stack of folded navy and white pinstripe fabrics",
      },
    ],
  },
  {
    name: "Abstract Brushstroke",
    spec: "Cotton Twill · 130 GSM",
    slides: [
      {
        src: "/collection/brushstroke-model.webp",
        alt: "Model in a black and white abstract brushstroke print full-sleeve shirt",
      },
      {
        src: "/collection/brushstroke-fabric.webp",
        alt: "Folded black and white abstract brushstroke print fabrics on a grey background",
      },
    ],
  },
  {
    name: "Lotus Stem",
    spec: "Cotton Dobby · 115 GSM",
    slides: [
      {
        src: "/collection/lotus-model.webp",
        alt: "Model in a cream half-sleeve shirt with brown lotus stem print",
      },
      {
        src: "/collection/lotus-fabric.webp",
        alt: "Stack of folded cream and brown botanical print fabrics",
      },
    ],
  },
  {
    name: "Fractured Marble",
    spec: "Cotton Satin · 125 GSM",
    slides: [
      {
        src: "/collection/fractured-marble-model.webp",
        alt: "Model in a slate blue full-sleeve shirt with a fractured marble print",
      },
      {
        src: "/collection/fractured-marble-fabric.webp",
        alt: "Folded mauve and slate blue fractured marble print fabrics stacked on a cream background",
      },
    ],
  },
  {
    name: "Letterpress Type",
    spec: "Rayon Crepe · 105 GSM",
    slides: [
      {
        src: "/collection/letterpress-model.webp",
        alt: "Model in a white half-sleeve shirt with a black distressed typography print",
      },
      {
        src: "/collection/letterpress-fabric.webp",
        alt: "Three folded white and slate typography print fabrics stacked on a pale grey background",
      },
    ],
  },
  {
    name: "Inkwash Maple",
    spec: "Viscose Rayon · 110 GSM",
    slides: [
      {
        src: "/collection/inkwash-maple-model.webp",
        alt: "Model in a taupe camp collar shirt with a watercolour maple leaf print",
      },
      {
        src: "/collection/inkwash-maple-fabric.webp",
        alt: "Stack of folded taupe watercolour maple leaf print fabrics on a grey background",
      },
    ],
  },
  {
    name: "Awning Stripe",
    spec: "Cotton-Linen · 160 GSM",
    slides: [
      {
        src: "/collection/awning-stripe-model.webp",
        alt: "Model in blue and white wide stripe tailored shorts",
      },
      {
        src: "/collection/awning-stripe-fabric.webp",
        alt: "Stack of folded wide stripe fabrics in grey, blue, taupe, ochre and sage",
      },
    ],
  },
  {
    name: "Textured Linen",
    spec: "Pure Linen · 180 GSM",
    slides: [
      {
        src: "/collection/textured-linen-model.webp",
        alt: "Model in brown textured linen drawstring shorts",
      },
      {
        src: "/collection/textured-linen-fabric.webp",
        alt: "Stack of folded textured linen fabrics in white, rust, sand, olive and brown",
      },
    ],
  },
];

const SWIPE_THRESHOLD = 40;

function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path d={direction === "prev" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function FabricCard({ fabric, priority }: { fabric: Fabric; priority?: boolean }) {
  const [index, setIndex] = useState(0);
  const swipeStartX = useRef<number | null>(null);

  const step = (delta: number) =>
    setIndex((current) => (current + delta + fabric.slides.length) % fabric.slides.length);

  return (
    <div className="group">
      <div
        className="relative aspect-3/4 w-full overflow-hidden rounded-md bg-ink-100"
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") return;
          swipeStartX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          const startX = swipeStartX.current;
          swipeStartX.current = null;
          if (startX === null) return;
          const distance = event.clientX - startX;
          if (Math.abs(distance) > SWIPE_THRESHOLD) step(distance < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          swipeStartX.current = null;
        }}
      >
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out-expo motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {fabric.slides.map((slide, si) => (
            <div key={slide.src} className="relative h-full w-full shrink-0">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                preload={priority && si === 0}
              />
            </div>
          ))}
        </div>

        {/* Edge arrows: slide out of the frame on hover, always shown on touch. */}
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={`Previous image of ${fabric.name}`}
          className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 -translate-x-3 items-center justify-center rounded-full bg-white/85 text-ink-900 opacity-0 shadow-sm backdrop-blur-sm transition duration-500 ease-out-expo hover:bg-white group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 motion-reduce:transition-none [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100"
        >
          <Chevron direction="prev" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={`Next image of ${fabric.name}`}
          className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 translate-x-3 items-center justify-center rounded-full bg-white/85 text-ink-900 opacity-0 shadow-sm backdrop-blur-sm transition duration-500 ease-out-expo hover:bg-white group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 motion-reduce:transition-none [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100"
        >
          <Chevron direction="next" />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
          {fabric.slides.map((slide, si) => (
            <span
              key={slide.src}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                si === index ? "bg-white" : "bg-white/45"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <Reveal as="h3" y={16} className="font-serif text-base font-semibold tracking-tight text-ink-900">
            {fabric.name}
          </Reveal>
          <Reveal as="p" delay={0.05} y={12} className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
            {fabric.spec}
          </Reveal>
        </div>
        <a
          href={ENQUIRE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 border-b border-transparent pb-0.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:border-brand-600"
        >
          Enquire
        </a>
      </div>
    </div>
  );
}

export default function FabricCatalog() {
  return (
    <section id="fabrics" className="rounded-t-3xl bg-white text-ink-900 lg:rounded-t-[3rem]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <Reveal as="h2" className="font-serif text-2xl font-bold tracking-tight text-ink-900 lg:text-3xl">
          The Collection
        </Reveal>
        <div className="mt-5 h-px w-full bg-ink-200" />

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {fabrics.map((fabric, fi) => (
            <FabricCard key={fabric.name} fabric={fabric} priority={fi === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
