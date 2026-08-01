"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Reveal } from "./RevealText";

// TODO: replace with the live enquiry / Google Form link before launch.
const ENQUIRE_URL = "https://forms.gle/REPLACE_WITH_FORM_ID";

type Fabric = {
  name: string;
  spec: string;
  image: string;
  alt: string;
};

type Group = {
  id: string;
  label: string;
  heading: string;
  fabrics: Fabric[];
};

const groups: Group[] = [
  {
    id: "shirting",
    label: "Shirting",
    heading: "Shirting Fabrics",
    fabrics: [
      {
        name: "Egyptian Cotton Poplin",
        spec: "140 TC",
        image: "/fabrics/shirting-poplin.png",
        alt: "Draped navy Egyptian cotton poplin with fine tight weave",
      },
      {
        name: "Oxford Chambray",
        spec: "110 TC",
        image: "/fabrics/shirting-chambray.png",
        alt: "Flat oatmeal Oxford chambray showing crosshatch weave",
      },
      {
        name: "Linen Slub Shirting",
        spec: "80 TC",
        image: "/fabrics/shirting-linen.png",
        alt: "Draped olive and cream linen slub shirting",
      },
    ],
  },
  {
    id: "suiting",
    label: "Suiting",
    heading: "Suiting Fabrics",
    fabrics: [
      {
        name: "Tropical Worsted Wool",
        spec: "260 GSM",
        image: "/fabrics/suiting-wool.png",
        alt: "Marigold orange tropical worsted wool with ribbed texture",
      },
      {
        name: "Linen Suiting Blend",
        spec: "210 GSM",
        image: "/fabrics/suiting-linen.png",
        alt: "Dusty teal linen suiting blend with open plain weave",
      },
      {
        name: "Silk Noil Suiting",
        spec: "180 GSM",
        image: "/fabrics/suiting-silk.png",
        alt: "Glossy black silk noil suiting draped in folds",
      },
    ],
  },
  {
    id: "specialty",
    label: "Specialty",
    heading: "Specialty Fabrics",
    fabrics: [
      {
        name: "Metallic Jacquard",
        spec: "220 GSM",
        image: "/fabrics/specialty-jacquard.png",
        alt: "Champagne gold metallic jacquard with damask floral pattern",
      },
      {
        name: "Coated Technical Twill",
        spec: "190 GSM",
        image: "/fabrics/specialty-twill.png",
        alt: "Matte black coated technical twill with diagonal weave",
      },
      {
        name: "Hand-Block Print Voile",
        spec: "90 GSM",
        image: "/fabrics/specialty-voile.png",
        alt: "Indigo hand-block printed cotton voile with floral motif",
      },
    ],
  },
];

const tabs = [{ id: "all", label: "All" }, ...groups.map((g) => ({ id: g.id, label: g.label }))];

function FabricCard({ fabric, priority }: { fabric: Fabric; priority?: boolean }) {
  return (
    <div className="group">
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-md bg-ink-100">
        <Image
          src={fabric.image}
          alt={fabric.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
          priority={priority}
        />
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
  const [active, setActive] = useState("all");

  const visibleGroups = useMemo(
    () => (active === "all" ? groups : groups.filter((g) => g.id === active)),
    [active]
  );

  return (
    <section id="fabrics" className="rounded-t-3xl bg-white text-ink-900 lg:rounded-t-[3rem]">
      {/* Category filter bar */}
      <div className="sticky top-0 z-20 rounded-t-3xl border-b border-ink-200/70 bg-white/90 backdrop-blur-md lg:rounded-t-[3rem]">
        <div className="mx-auto flex max-w-7xl items-center gap-7 overflow-x-auto px-6 py-4 lg:px-10">
          {tabs.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                aria-pressed={isActive}
                className={`relative shrink-0 pb-1 font-mono text-xs uppercase tracking-[0.22em] transition-colors ${
                  isActive ? "text-accent" : "text-ink-400 hover:text-ink-700"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute -bottom-px left-0 h-px bg-brand-600 transition-all duration-300 ease-out-expo ${
                    isActive ? "w-full" : "w-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        {visibleGroups.map((group, gi) => (
          <div key={group.id} className={gi > 0 ? "mt-16 lg:mt-20" : ""}>
            <Reveal as="h2" className="font-serif text-2xl font-bold tracking-tight text-ink-900 lg:text-3xl">
              {group.heading}
            </Reveal>
            <div className="mt-5 h-px w-full bg-ink-200" />

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
