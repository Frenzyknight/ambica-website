"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Blob = {
  id: number;
  x: number;
  y: number;
  peak: number;
  born: number;
  growMs: number;
  /** Timestamp when fade begins. */
  fadeAt: number;
  fadeMs: number;
};

type FluidBlobRevealProps = {
  image: string;
  imageAlt: string;
  coverColor?: string;
  coverContent?: ReactNode;
  className?: string;
  /** Pointer follow smoothing (0–1). Higher = snappier. Default 0.18 */
  trailLag?: number;
  /** Base blob radius in px. Default 96 */
  revealSize?: number;
  /** Gaussian blur for soft edges. Default 16 */
  edgeSoftness?: number;
  /** Color-matrix alpha multiplier for goo merge. Default 20 */
  gooStrength?: number;
  /** Growth duration in ms. Default 420 */
  growTime?: number;
  /** Hold before fade starts, ms. Default 280 */
  fadeDelay?: number;
  /** Fade-out duration in ms. Default 950 */
  fadeTime?: number;
};

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function blobState(b: Blob, now: number) {
  const age = now - b.born;
  let scale = 1;

  if (age < b.growMs) {
    scale = 0.82 + 0.18 * easeOutCubic(age / b.growMs);
  }

  if (now < b.fadeAt) {
    return { r: Math.max(1, b.peak * scale), opacity: 1 };
  }

  const fadeT = (now - b.fadeAt) / b.fadeMs;
  if (fadeT >= 1) return null;

  const eased = easeInOutCubic(fadeT);
  scale = scale * (1 - 0.55 * eased);
  const opacity = eased < 0.65 ? 1 : 1 - (eased - 0.65) / 0.35;

  return { r: Math.max(1, b.peak * scale), opacity: Math.max(0, opacity) };
}

function getPrefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const MAX_BLOBS = 120;

export default function FluidBlobReveal({
  image,
  imageAlt,
  coverColor = "#3b3392",
  coverContent,
  className = "",
  trailLag = 0.18,
  revealSize = 96,
  edgeSoftness = 16,
  gooStrength = 20,
  growTime = 420,
  fadeDelay = 280,
  fadeTime = 950,
}: FluidBlobRevealProps) {
  const uid = useId().replace(/:/g, "");
  const filterId = `goo-${uid}`;
  const maskId = `mask-${uid}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<Blob[]>([]);
  const nextId = useRef(0);
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const trail = useRef({ x: 0, y: 0 });
  const lastSpawn = useRef(0);
  const lastStamp = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const circlePool = useRef<SVGCircleElement[]>([]);

  const configRef = useRef({
    trailLag,
    revealSize,
    growTime,
    fadeDelay,
    fadeTime,
  });

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [reducedMotion, setReducedMotion] = useState(getPrefersReducedMotion);

  useEffect(() => {
    configRef.current = {
      trailLag,
      revealSize,
      growTime,
      fadeDelay,
      fadeTime,
    };
  }, [trailLag, revealSize, growTime, fadeDelay, fadeTime]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const spawnBlob = (x: number, y: number, now: number) => {
      const cfg = configRef.current;
      const jitter = cfg.revealSize * 0.1;

      if (blobsRef.current.length >= MAX_BLOBS) {
        // Drop the oldest stamp so painting can keep covering new areas
        blobsRef.current.shift();
      }

      const growMs = Math.min(cfg.growTime, 160);
      blobsRef.current.push({
        id: nextId.current++,
        x: x + (Math.random() - 0.5) * jitter,
        y: y + (Math.random() - 0.5) * jitter,
        peak: cfg.revealSize * (0.94 + Math.random() * 0.12),
        born: now,
        growMs,
        fadeAt: now + growMs + cfg.fadeDelay,
        fadeMs: cfg.fadeTime,
      });
      lastStamp.current = { x, y };
      lastSpawn.current = now;
    };

    const ensureCircles = (count: number) => {
      const group = groupRef.current;
      if (!group) return;
      const pool = circlePool.current;
      while (pool.length < count) {
        const c = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        c.setAttribute("fill", "#fff");
        group.appendChild(c);
        pool.push(c);
      }
    };

    const loop = (now: number) => {
      const p = pointer.current;
      const t = trail.current;
      const cfg = configRef.current;
      const lag = Math.min(1, Math.max(0.04, cfg.trailLag));

      if (p.inside) {
        t.x += (p.x - t.x) * lag;
        t.y += (p.y - t.y) * lag;

        // Dense distance stamps so the full card can be painted
        const step = Math.max(8, cfg.revealSize * 0.28);
        const moved = Math.hypot(
          t.x - lastStamp.current.x,
          t.y - lastStamp.current.y
        );
        if (moved >= step || now - lastSpawn.current > 70) {
          spawnBlob(t.x, t.y, now);
        }
      }

      const drawn: { x: number; y: number; r: number; opacity: number }[] = [];
      const alive: Blob[] = [];

      for (const b of blobsRef.current) {
        const s = blobState(b, now);
        if (!s) continue;
        alive.push(b);
        drawn.push({ x: b.x, y: b.y, r: s.r, opacity: s.opacity });
      }
      blobsRef.current = alive;

      if (p.inside) {
        drawn.push({
          x: t.x,
          y: t.y,
          r: cfg.revealSize,
          opacity: 1,
        });
      }

      ensureCircles(drawn.length);
      const pool = circlePool.current;
      for (let i = 0; i < pool.length; i++) {
        const c = pool[i];
        if (i < drawn.length) {
          const d = drawn[i];
          c.setAttribute("cx", String(d.x));
          c.setAttribute("cy", String(d.y));
          c.setAttribute("r", String(d.r));
          c.setAttribute("opacity", String(d.opacity));
          c.style.display = "";
        } else {
          c.style.display = "none";
        }
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = drawn.length === 0 ? "1" : "0";
      }

      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf.current);
      circlePool.current = [];
    };
  }, [reducedMotion, size.w, size.h]);

  const setPointerFromEvent = (clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pointer.current.x = clientX - rect.left;
    pointer.current.y = clientY - rect.top;
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    if (reducedMotion) return;
    setPointerFromEvent(e.clientX, e.clientY);
    trail.current.x = pointer.current.x;
    trail.current.y = pointer.current.y;
    pointer.current.inside = true;

    const cfg = configRef.current;
    const now = performance.now();
    const x = pointer.current.x;
    const y = pointer.current.y;
    const growMs = Math.min(cfg.growTime, 160);
    blobsRef.current.push({
      id: nextId.current++,
      x,
      y,
      peak: cfg.revealSize,
      born: now,
      growMs,
      fadeAt: now + growMs + cfg.fadeDelay,
      fadeMs: cfg.fadeTime,
    });
    if (blobsRef.current.length > MAX_BLOBS) {
      blobsRef.current.shift();
    }
    lastStamp.current = { x, y };
    lastSpawn.current = now;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (reducedMotion) return;
    setPointerFromEvent(e.clientX, e.clientY);
    pointer.current.inside = true;
  };

  const onPointerLeave = () => {
    pointer.current.inside = false;
  };

  const gooOffset = Math.min(gooStrength * 0.42, gooStrength - 1);

  return (
    <div
      ref={rootRef}
      className={`relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-border lg:aspect-auto lg:h-full lg:min-h-[420px] ${className}`}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerEnter}
      style={{ touchAction: "none" }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: coverColor }}
        aria-hidden={!coverContent}
      >
        {coverContent ?? null}
      </div>

      {reducedMotion ? (
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          preload
        />
      ) : (
        size.w > 0 &&
        size.h > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            width={size.w}
            height={size.h}
            viewBox={`0 0 ${size.w} ${size.h}`}
            aria-hidden
          >
            <defs>
              <filter
                id={filterId}
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation={edgeSoftness}
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${gooStrength} -${gooOffset}`}
                  result="goo"
                />
              </filter>
              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                x={0}
                y={0}
                width={size.w}
                height={size.h}
              >
                <rect width={size.w} height={size.h} fill="black" />
                <g ref={groupRef} filter={`url(#${filterId})`} />
              </mask>
            </defs>
            <image
              href={image}
              width={size.w}
              height={size.h}
              preserveAspectRatio="xMidYMid slice"
              mask={`url(#${maskId})`}
            />
          </svg>
        )
      )}

      <span className="sr-only">{imageAlt}</span>

      {!reducedMotion && (
        <div
          ref={hintRef}
          className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center transition-opacity duration-300"
        >
          <span className="rounded-full bg-black/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm">
            Hover to reveal
          </span>
        </div>
      )}
    </div>
  );
}
