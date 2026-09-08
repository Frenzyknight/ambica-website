"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EASE_OUT_EXPO, Reveal, RevealEyebrow } from "./RevealText";

const usps = [
  {
    label: "Sourcing promise 01",
    title: "Quality, Every Time",
    description:
      "Soft, colour-fast, built to last — and checked against the same standard on every batch.",
    stat: "100%",
    statLabel: "of batches checked",
    weave: "Quality reviewed",
    pattern:
      "repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 11px), repeating-linear-gradient(0deg, rgb(255 255 255 / 0.2) 0 2px, transparent 2px 11px)",
  },
  {
    label: "Sourcing promise 02",
    title: "Wide Range, Honest Price",
    description:
      "Hundreds of fabrics and finishes, sourced with competitive and transparent pricing.",
    stat: "200+",
    statLabel: "fabric qualities",
    weave: "200+ fabric qualities",
    pattern: 
      "repeating-linear-gradient(90deg, currentColor 0 3px, transparent 3px 13px), repeating-linear-gradient(45deg, rgb(255 255 255 / 0.18) 0 2px, transparent 2px 9px)",
  },
  {
    label: "Sourcing promise 03",
    title: "Scale Without the Wait",
    description:
      "A broad supplier network and deep inventory support small runs and bulk orders alike.",
    stat: "Bulk",
    statLabel: "capacity, deep stock",
    weave: "Small runs to bulk orders",
    pattern:
      "repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 9px), repeating-linear-gradient(0deg, rgb(255 255 255 / 0.2) 0 3px, transparent 3px 9px)",
  },
  {
    label: "Sourcing promise 04",
    title: "Fast, Reliable Delivery",
    description:
      "Quick sampling and PAN India dispatch, on your timeline, every time.",
    stat: "PAN",
    statLabel: "India dispatch",
    weave: "PAN India dispatch",
    pattern:
      "repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 10px), repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.2) 0 2px, transparent 2px 10px)",
  },
];

function FabricSelectionVisual({ active }: { active: number }) {
  const reduce = useReducedMotion();
  const selected = usps[active];

  return (
    <div
      aria-hidden
      className="relative min-h-107.5 overflow-hidden rounded-4xl border border-ink-800 bg-ink-950 sm:min-h-130"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 0.1) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="absolute left-6 right-6 top-6 flex items-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500 sm:left-9 sm:right-9 sm:top-8">
        <span className="flex items-center gap-2 text-brand-400">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-brand-400"
            animate={reduce ? undefined : { opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Ambica Synfab
        </span>
      </div>

      {/* Loom frame */}
      <div className="absolute inset-x-7 bottom-8 top-20 border-x-[6px] border-ink-700 sm:inset-x-12 sm:bottom-10 sm:top-24 sm:border-x-8">
        <div className="absolute -left-3 -right-3 top-0 h-5 rounded-full border border-ink-600 bg-ink-800 shadow-lg sm:h-6" />
        <div className="absolute -left-3 -right-3 bottom-0 h-7 rounded-full border border-ink-600 bg-ink-800 shadow-lg sm:h-9" />

        {/* Warp threads */}
        <div className="absolute inset-x-3 bottom-5 top-5 flex justify-around overflow-hidden sm:inset-x-5">
          {Array.from({ length: 22 }).map((_, i) => (
            <motion.span
              key={i}
              className={`h-full w-px ${
                i % 4 === active ? "bg-brand-400/80" : "bg-ink-500/45"
              }`}
              animate={
                reduce
                  ? undefined
                  : { x: i % 2 === 0 ? [0, 1.5, 0] : [0, -1.5, 0] }
              }
              transition={{
                duration: 0.45,
                repeat: Infinity,
                delay: i * 0.025,
              }}
            />
          ))}
        </div>

        {/* Cloth being woven */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="absolute inset-x-[12%] bottom-8 top-[38%] overflow-hidden rounded-t-sm border-x border-brand-300/20 bg-ink-900 text-brand-400 shadow-2xl sm:bottom-10"
            initial={{ opacity: 0, scaleY: 0.9 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.55, ease: EASE_OUT_EXPO }}
            style={{ transformOrigin: "bottom" }}
          >
            <motion.div
              className="absolute -inset-8"
              style={{
                backgroundImage: selected.pattern,
                backgroundSize: active === 2 ? "18px 18px" : "22px 22px",
              }}
              animate={
                reduce ? undefined : { backgroundPositionY: [0, 22] }
              }
              transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-ink-950/20" />
          </motion.div>
        </AnimatePresence>

        {/* Reed / beater */}
        <motion.div
          className="absolute left-[6%] right-[6%] top-[32%] z-20 h-9 rounded-md border border-ink-500 bg-ink-700/95 shadow-xl sm:h-11"
          animate={reduce ? undefined : { y: [0, 22, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-x-3 top-1/2 h-px bg-ink-400/60" />
          <div className="absolute inset-1 bg-[repeating-linear-gradient(90deg,transparent_0_8px,rgb(190_189_183/0.3)_8px_9px)]" />
        </motion.div>

        {/* Moving shuttle */}
        <motion.div
          className="absolute top-[27%] z-30 h-5 w-20 rounded-[50%_15%_15%_50%] border border-brand-200/50 bg-brand-500 shadow-glow sm:h-6 sm:w-24"
          animate={
            reduce
              ? { left: "38%" }
              : { left: ["5%", "72%", "5%"], rotate: [0, 2, 0] }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="absolute left-1/2 top-1/2 h-2 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-900/75 sm:w-11" />
        </motion.div>

        {/* Fabric roll */}
        <div className="absolute -left-2 -right-2 bottom-2 z-20 h-10 rounded-full border border-brand-300/20 bg-[repeating-linear-gradient(0deg,#a3ac20_0_2px,#c9d234_2px_5px)] shadow-2xl sm:h-12">
          <span className="absolute left-2 top-1/2 h-14 w-3 -translate-y-1/2 rounded-full bg-ink-600 sm:h-16" />
          <span className="absolute right-2 top-1/2 h-14 w-3 -translate-y-1/2 rounded-full bg-ink-600 sm:h-16" />
        </div>
      </div>

      <div className="absolute bottom-11 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-ink-700 bg-ink-950/90 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300 backdrop-blur sm:bottom-14">
        Selection {String(active + 1).padStart(2, "0")} / {selected.weave}
      </div>
    </div>
  );
}

export default function FabricUsps() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const selected = usps[active];

  return (
    <section id="fabrics" className="overflow-hidden bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="mb-12 grid items-end gap-7 lg:mb-16 lg:grid-cols-[1fr_0.65fr]">
          <div>
            <RevealEyebrow>Why our cloth</RevealEyebrow>
            <Reveal as="h2" className="max-w-2xl text-balance text-display-sm uppercase">
              Sourced at scale.{" "}
              <span className="text-brand-600">Selected by human eye.</span>
            </Reveal>
          </div>
          <Reveal
            as="p"
            delay={0.08}
            className="max-w-md text-sm leading-relaxed text-muted lg:justify-self-end"
          >
            We source, compare and supply cloth.
            Explore the standards that guide every fabric we select.
          </Reveal>
        </div>

        <Reveal className="rounded-[2.5rem] bg-ink-900 p-3 shadow-lift sm:p-5 lg:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">
            <FabricSelectionVisual active={active} />

            <div className="flex min-h-107.5 flex-col rounded-4xl bg-ink-950 p-6 sm:min-h-130 sm:p-8 lg:p-9">
              <div className="flex items-center justify-between border-b border-ink-800 pb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
                <span>Our sourcing promises</span>
                <span>Tap to inspect</span>
              </div>

              <div className="mt-2">
                {usps.map((u, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={u.title}
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-pressed={isActive}
                      className="group flex w-full items-center gap-4 border-b border-ink-800 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:py-5"
                    >
                      <span
                        className={`font-mono text-[10px] transition-colors ${
                          isActive ? "text-brand-400" : "text-ink-600"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`grow text-sm font-medium transition-colors sm:text-base ${
                          isActive
                            ? "text-ink-50"
                            : "text-ink-500 group-hover:text-ink-300"
                        }`}
                      >
                        {u.title}
                      </span>
                      <motion.span
                        animate={{ x: isActive ? 0 : -5, opacity: isActive ? 1 : 0.3 }}
                        className="text-brand-400"
                      >
                        →
                      </motion.span>
                    </button>
                  );
                })}
              </div>

              <div className="relative mt-auto min-h-40 pt-8" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                    transition={{ duration: reduce ? 0 : 0.4, ease: EASE_OUT_EXPO }}
                    className="grid grid-cols-[1fr_auto] items-end gap-6"
                  >
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-400">
                        {selected.label}
                      </p>
                      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-300">
                        {selected.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-4xl font-semibold tracking-tight text-brand-400 sm:text-5xl">
                        {selected.stat}
                      </span>
                      <span className="mt-1 block max-w-28 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-ink-500">
                        {selected.statLabel}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
