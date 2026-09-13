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
  /** Slide 0 is the garment shot when available; remaining slides are the matching fabric. */
  slides: Slide[];
};

type FabricGroup = {
  title: string;
  fabrics: Fabric[];
};

const patternGroups: FabricGroup[] = [
  {
    title: "Checks & Plaids",
    fabrics: [
      {
        name: "Dusty Windowpane",
        spec: "Yarn-Dyed Cotton · 115 GSM",
        slides: [
          {
            src: "/collection/dusty-windowpane-model.webp",
            alt: "Model in a dusty rose windowpane check full-sleeve shirt with a chest pocket",
          },
          {
            src: "/collection/dusty-windowpane-fabric.webp",
            alt: "Folded dusty rose, beige and slate blue windowpane check fabrics stacked on a white background",
          },
        ],
      },
      {
        name: "Rose Windowpane",
        spec: "Yarn-Dyed Cotton · 115 GSM",
        slides: [
          {
            src: "/collection/rose-windowpane-model.webp",
            alt: "Model in a dusty rose windowpane check full-sleeve shirt",
          },
          {
            src: "/collection/rose-windowpane-fabric.webp",
            alt: "Folded dusty rose, grey and slate windowpane check fabrics stacked on a linen background",
          },
        ],
      },
      {
        name: "Blush Tartan",
        spec: "Yarn-Dyed Cotton · 125 GSM",
        slides: [
          {
            src: "/collection/blush-tartan-model.webp",
            alt: "Model in a blush pink tartan full-sleeve shirt with a chest pocket",
          },
          {
            src: "/collection/blush-tartan-fabric.webp",
            alt: "Folded blush pink and grey tartan fabrics stacked on a pale grey background",
          },
        ],
      },
      {
        name: "Crimson Tartan",
        spec: "Yarn-Dyed Cotton · 130 GSM",
        slides: [
          {
            src: "/collection/crimson-tartan-model.webp",
            alt: "Model in a crimson and black tartan full-sleeve shirt",
          },
          {
            src: "/collection/crimson-tartan-fabric.webp",
            alt: "Folded crimson, indigo and charcoal tartan fabrics stacked on a white background",
          },
        ],
      },
      {
        name: "Ikat Check",
        spec: "Yarn-Dyed Cotton · 120 GSM",
        slides: [
          {
            src: "/collection/ikat-check-model.webp",
            alt: "Model in a mauve and cream ikat check full-sleeve shirt with rolled cuffs",
          },
          {
            src: "/collection/ikat-check-fabric.webp",
            alt: "Folded mauve, grey, blue and sage ikat check fabrics stacked on a beige background",
          },
        ],
      },
    ],
  },
  {
    title: "Stripes",
    fabrics: [
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
        name: "Pencil Stripe",
        spec: "Yarn-Dyed Cotton · 110 GSM",
        slides: [
          {
            src: "/collection/pencil-stripe-model.webp",
            alt: "Model in a red and white pencil stripe full-sleeve shirt",
          },
          {
            src: "/collection/pencil-stripe-fabric.webp",
            alt: "Folded navy and red pencil stripe fabrics stacked on a grey background",
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
    ],
  },
  {
    title: "Florals",
    fabrics: [
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
        name: "Poppy Bloom",
        spec: "Cotton Poplin · 120 GSM",
        slides: [
          {
            src: "/collection/poppy-bloom-model.webp",
            alt: "Model in a burgundy full-sleeve shirt with a large ivory poppy print",
          },
          {
            src: "/collection/poppy-bloom-fabric.webp",
            alt: "Folded burgundy and navy large poppy print fabrics stacked on a white background",
          },
        ],
      },
      {
        name: "Branch Floral",
        spec: "Cotton Poplin · 115 GSM",
        slides: [
          {
            src: "/collection/branch-floral-model.webp",
            alt: "Model in a forest green full-sleeve shirt with cream botanical branch print",
          },
          {
            src: "/collection/branch-floral-fabric.webp",
            alt: "Folded burgundy, forest green and black botanical branch print fabrics",
          },
        ],
      },
      {
        name: "Hibiscus Trail",
        spec: "Cotton Poplin · 115 GSM",
        slides: [
          {
            src: "/collection/hibiscus-trail-model.webp",
            alt: "Model in a burgundy full-sleeve shirt with a silver hibiscus print",
          },
          {
            src: "/collection/hibiscus-trail-fabric.webp",
            alt: "Folded ivory and burgundy grey hibiscus print fabrics stacked on a beige background",
          },
        ],
      },
      {
        name: "Mist Floral",
        spec: "Cotton Satin · 125 GSM",
        slides: [
          {
            src: "/collection/mist-floral-model.webp",
            alt: "Model in a mauve full-sleeve shirt with a watercolour floral print",
          },
          {
            src: "/collection/mist-floral-fabric.webp",
            alt: "Folded mauve, beige and teal watercolour floral fabrics stacked on a grey background",
          },
        ],
      },
      {
        name: "Climbing Vine",
        spec: "Cotton Poplin · 110 GSM",
        slides: [
          {
            src: "/collection/climbing-vine-model.webp",
            alt: "Model in a black half-sleeve shirt with a silver climbing vine floral print",
          },
          {
            src: "/collection/climbing-vine-fabric.webp",
            alt: "Folded grey, ivory and navy climbing vine floral fabrics stacked on a beige background",
          },
        ],
      },
      {
        name: "Chrysanthemum Oak",
        spec: "Cotton Poplin · 115 GSM",
        slides: [
          {
            src: "/collection/chrysanthemum-oak-fabric.webp",
            alt: "Folded grey, ivory and navy chrysanthemum and oak leaf print fabrics stacked on a white background",
          },
        ],
      },
      {
        name: "Mandala Burst",
        spec: "Cotton Poplin · 115 GSM",
        slides: [
          {
            src: "/collection/mandala-burst-model.webp",
            alt: "Model in a mauve full-sleeve shirt with a white mandala print",
          },
          {
            src: "/collection/mandala-burst-fabric.webp",
            alt: "Folded ivory, mauve and olive mandala print fabrics stacked on a grey background",
          },
        ],
      },
    ],
  },
  {
    title: "Leaves",
    fabrics: [
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
        name: "Brush Leaf",
        spec: "Cotton Poplin · 110 GSM",
        slides: [
          {
            src: "/collection/brush-leaf-model.webp",
            alt: "Model in a navy half-sleeve shirt with a white leaf outline and brush-block print",
          },
          {
            src: "/collection/brush-leaf-fabric.webp",
            alt: "Mauve, ivory and navy leaf outline fabrics with brush-block print laid out for showcase",
          },
        ],
      },
      {
        name: "Veined Leaf",
        spec: "Cotton Satin · 120 GSM",
        slides: [
          {
            src: "/collection/veined-leaf-model.webp",
            alt: "Model in a beige full-sleeve shirt with a large veined leaf print",
          },
          {
            src: "/collection/veined-leaf-fabric.webp",
            alt: "Folded burgundy, beige and navy large veined leaf print fabrics stacked on a white background",
          },
        ],
      },
      {
        name: "Canopy Leaf",
        spec: "Cotton Satin · 125 GSM",
        slides: [
          {
            src: "/collection/canopy-leaf-model.webp",
            alt: "Model in a teal full-sleeve shirt with a large tropical leaf print",
          },
          {
            src: "/collection/canopy-leaf-fabric.webp",
            alt: "Folded teal, olive and burgundy tropical leaf print fabrics stacked on a grey background",
          },
        ],
      },
    ],
  },
  {
    title: "Abstract & Geometric",
    fabrics: [
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
        name: "Hatch Block",
        spec: "Cotton Twill · 120 GSM",
        slides: [
          {
            src: "/collection/hatch-block-model.webp",
            alt: "Model in a sage full-sleeve shirt with a white hatched square print",
          },
          {
            src: "/collection/hatch-block-fabric.webp",
            alt: "Sage, ivory and navy hatched square print fabrics laid out on a grey background",
          },
        ],
      },
      {
        name: "Lattice Bloom",
        spec: "Cotton Poplin · 115 GSM",
        slides: [
          {
            src: "/collection/lattice-bloom-model.webp",
            alt: "Model in an ivory half-sleeve shirt with a lattice floral print",
          },
          {
            src: "/collection/lattice-bloom-fabric.webp",
            alt: "Mauve, ivory and navy lattice floral print fabrics laid out for showcase",
          },
        ],
      },
      {
        name: "Neat Geometric",
        spec: "Cotton Poplin · 110 GSM",
        slides: [
          {
            src: "/collection/neat-geometric-model.webp",
            alt: "Model in a navy full-sleeve shirt with a small white geometric print",
          },
        ],
      },
    ],
  },
  {
    title: "Solids & Textures",
    fabrics: [
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

function FabricCard({
  fabric,
  priority,
}: {
  fabric: Fabric;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const swipeStartX = useRef<number | null>(null);
  const canCarousel = fabric.slides.length > 1;

  const step = (delta: number) =>
    setIndex(
      (current) =>
        (current + delta + fabric.slides.length) % fabric.slides.length,
    );

  return (
    <div className="group">
      <div
        className="relative aspect-3/4 w-full overflow-hidden rounded-md bg-ink-100"
        onPointerDown={(event) => {
          if (!canCarousel || event.pointerType === "mouse") return;
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

        {canCarousel ? (
          <>
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
          </>
        ) : null}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <Reveal
            as="h3"
            y={16}
            className="font-serif text-base font-semibold tracking-tight text-ink-900"
          >
            {fabric.name}
          </Reveal>
          <Reveal
            as="p"
            delay={0.05}
            y={12}
            className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400"
          >
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
    <section
      id="fabrics"
      className="rounded-t-3xl bg-white text-ink-900 lg:rounded-t-[3rem]"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        {patternGroups.map((group, gi) => (
          <div key={group.title} className={gi === 0 ? undefined : "mt-16"}>
            <Reveal
              as="h2"
              className="font-serif text-xl font-semibold tracking-tight text-ink-900 lg:text-2xl"
            >
              {group.title}
            </Reveal>
            <div className="mt-4 h-px w-full bg-ink-200" />
            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {group.fabrics.map((fabric, fi) => (
                <FabricCard
                  key={fabric.name}
                  fabric={fabric}
                  priority={gi === 0 && fi === 0}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
