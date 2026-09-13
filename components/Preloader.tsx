"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";

// How many charcoal panels sweep away during the reveal. Each one leaves on a
// staggered delay so the wall retreats as a diagonal staircase (tall on the
// left, short on the right) mid-animation.
const PANELS = 6;

// Signature Ambica easing — matches --ease-out-expo in globals.css.
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const SESSION_KEY = "ambica:preloaded";

// Read the once-per-session flag as an external store so React can reconcile
// the server value (always "not preloaded") with the client value after
// hydration — no synchronous setState in an effect required.
function subscribe() {
  return () => {};
}
function getPreloadedSnapshot() {
  return sessionStorage.getItem(SESSION_KEY) !== null;
}
function getPreloadedServerSnapshot() {
  return false;
}

export default function Preloader() {
  const reduceMotion = useReducedMotion();
  const alreadyPreloaded = useSyncExternalStore(
    subscribe,
    getPreloadedSnapshot,
    getPreloadedServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const [phase, setPhase] = useState<"loading" | "revealing">("loading");
  const [count, setCount] = useState(0);
  // Set once the hero has painted its first frame; the reveal waits on this.
  const heroReadyRef = useRef(false);

  const visible = !alreadyPreloaded && !dismissed;

  // Lock scroll while the curtain is up.
  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  // Listen for the hero's first paint. The curtain lifts the moment the page
  // is actually on screen rather than after a fixed timer. A generous fallback
  // guarantees the curtain never hangs if the hero never signals (e.g. WebGL
  // context creation failed).
  useEffect(() => {
    if (!visible) return;
    const markReady = () => {
      heroReadyRef.current = true;
    };
    if ((window as { __heroPainted?: boolean }).__heroPainted) markReady();
    window.addEventListener("hero:painted", markReady);
    const fallback = window.setTimeout(markReady, reduceMotion ? 800 : 4000);
    return () => {
      window.removeEventListener("hero:painted", markReady);
      window.clearTimeout(fallback);
    };
  }, [visible, reduceMotion]);

  // Run the counter, then trigger the reveal once the hero has painted.
  useEffect(() => {
    if (!visible || phase !== "loading") return;

    const duration = reduceMotion ? 400 : 1100;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease-out so the number decelerates as it climbs.
      const eased = 1 - Math.pow(1 - t, 3);
      const ready = heroReadyRef.current;
      // Hold just shy of 100 until the hero has painted, so the number never
      // sits at 100 while the curtain waits.
      setCount(Math.round(eased * (ready ? 100 : 96)));
      if (t < 1 || !ready) {
        frame = requestAnimationFrame(tick);
      } else {
        setCount(100);
        setTimeout(() => setPhase("revealing"), reduceMotion ? 80 : 180);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, phase, reduceMotion]);

  if (!visible) return null;

  const revealing = phase === "revealing";
  const lastPanel = PANELS - 1;

  return (
    <div className="dark fixed inset-0 z-100 overflow-hidden" aria-hidden="true">
      {/* Charcoal panel wall — retreats upward as a staggered staircase. */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: PANELS }).map((_, i) => (
          <motion.div
            key={i}
            className="h-full flex-1 bg-ink-950"
            initial={{ y: "0%" }}
            animate={revealing ? { y: "-100%" } : { y: "0%" }}
            transition={{
              duration: reduceMotion ? 0.4 : 0.9,
              ease: EASE_OUT_EXPO,
              // Right-most panel leaves first → tall charcoal lingers on the left.
              delay: revealing ? (lastPanel - i) * 0.08 : 0,
            }}
            onAnimationComplete={() => {
              if (revealing && i === 0) {
                // Mark the session as preloaded only once the curtain has fully
                // lifted, so subsequent full reloads in this session skip it.
                sessionStorage.setItem(SESSION_KEY, "1");
                setDismissed(true);
              }
            }}
          />
        ))}
      </div>

      {/* Centered brand mark + progress, fades out before the wall lifts. */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: revealing ? 0 : 1 }}
        transition={{ duration: revealing ? 0.35 : 0.6, ease: EASE_OUT_EXPO }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          className="flex flex-col items-center"
        >
          {/* Width matches the header logo so both resolve to the same
              optimized URL — otherwise a retina visitor downloads the same
              mark twice while the curtain is still up. */}
          <Image
            src="/ambica-logo-light.webp"
            alt="Ambica — a mark of quality"
            width={180}
            height={128}
            loading="eager"
            fetchPriority="high"
            className="h-auto w-40 lg:w-48"
          />

          <p className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-brand-400">
            <span className="inline-block h-px w-8 bg-brand-500" />
            A mark of quality
            <span className="inline-block h-px w-8 bg-brand-500" />
          </p>
        </motion.div>

        {/* Progress rail + count */}
        <div className="mt-12 flex w-56 flex-col items-center gap-3">
          <div className="relative h-px w-full overflow-hidden bg-ink-800">
            <motion.span
              className="absolute inset-y-0 left-0 bg-brand-500"
              initial={{ width: "0%" }}
              animate={{ width: `${count}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-400 tabular-nums">
            {String(count).padStart(3, "0")}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
