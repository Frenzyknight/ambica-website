"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  useMotionTemplate,
} from "motion/react";

export default function VideoParallax() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const raf = useRef(0);
  const [soundOn, setSoundOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // The video weighs ~1.5MB, so we don't fetch it on page load. It only starts
  // loading once the reveal window nears the viewport (see the observer below).
  const [activated, setActivated] = useState(false);

  const { scrollY } = useScroll();

  // How much of the fixed video to hide from the top / bottom of the viewport.
  // The video is pinned to the viewport and only revealed through the band
  // occupied by this section — so the video never moves, the window does.
  //
  // Start fully clipped from the top: the video paints over the (opaque) hero,
  // so it must stay hidden until `update()` measures the section. On a soft
  // client navigation the mount effect can fire before layout settles, and a
  // 0/0 default would leave the video covering the hero. A large top inset
  // guarantees "hidden until measured".
  const topInset = useMotionValue(999999);
  const bottomInset = useMotionValue(0);

  const update = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    topInset.set(Math.min(Math.max(rect.top, 0), vh));
    bottomInset.set(Math.min(Math.max(vh - rect.bottom, 0), vh));
  }, [topInset, bottomInset]);

  useMotionValueEvent(scrollY, "change", update);

  useEffect(() => {
    update();
    // On a soft navigation, layout/scroll may not be settled when the effect
    // first fires — re-measure across the next couple of frames so the clip
    // band lands on the section instead of leaving the video over the hero.
    const r1 = requestAnimationFrame(() => {
      update();
      const r2 = requestAnimationFrame(update);
      raf.current = r2;
    });
    raf.current = r1;
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === videoRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Defer the video download until the reveal window is within ~1.5 viewports,
  // then let the <source> elements mount. `rootMargin` gives it a head start so
  // it's decoded and playing by the time the window scrolls onto it.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || activated) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActivated(true);
          io.disconnect();
        }
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [activated]);

  // Once the sources are in the DOM, kick off the load + autoplay explicitly —
  // `preload="none"` means the element won't fetch on its own.
  useEffect(() => {
    if (!activated) return;
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
  }, [activated]);

  const clipPath = useMotionTemplate`inset(${topInset}px 0px ${bottomInset}px 0px)`;

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) v.play().catch(() => {});
    setSoundOn(!v.muted);
  };

  const toggleFullscreen = () => {
    const v = videoRef.current as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitExitFullscreen?: () => void;
      webkitDisplayingFullscreen?: boolean;
    };
    if (!v) return;

    // iOS Safari only supports fullscreen on the <video> element itself.
    if (typeof v.webkitEnterFullscreen === "function" && !v.requestFullscreen) {
      if (v.webkitDisplayingFullscreen) {
        v.webkitExitFullscreen?.();
      } else {
        v.webkitEnterFullscreen();
      }
      return;
    }

    if (!document.fullscreenElement) {
      v.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <>
      {/* The still, fixed video. It fills the viewport and never moves — it's
          only ever visible through the clip band that tracks the section. */}
      <motion.div
        aria-hidden
        style={{ clipPath }}
        className="dark pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          poster="/video-showcase-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          controls={isFullscreen}
          controlsList="nodownload noremoteplayback"
        >
          {activated && (
            <>
              <source src="/video-showcase.webm" type="video/webm" />
              <source src="/video-showcase.mp4" type="video/mp4" />
            </>
          )}
        </video>

        {/* Legibility scrims */}
        <div className="absolute inset-0 bg-linear-to-b from-ink-950/55 via-ink-950/15 to-ink-950/65" />
        <div className="absolute inset-0 bg-ink-950/20" />
      </motion.div>

      {/* The window: a transparent slot in normal flow. The sections above and
          below cover the fixed video; this gap reveals it. Its height sets how
          long the window travels across the video. The mute toggle lives here
          (above the video, z-10) so it stays centered in the window and is
          always clickable while the window is on screen. */}
      <section
        ref={sectionRef}
        aria-label="Ambica fabric in motion"
        className="relative z-10 flex h-[70vh] w-full items-center justify-center"
      >
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Mute video" : "Unmute video"}
          className="group relative flex h-24 w-24 items-center justify-center rounded-full border border-ink-50/40 backdrop-blur-sm transition-[transform,border-color] duration-300 ease-out-expo hover:scale-105 hover:border-brand-400 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="absolute inset-0 rounded-full bg-ink-50/5 transition-colors group-hover:bg-brand-500/10" />
          {soundOn ? (
            <svg
              viewBox="0 0 24 24"
              className="relative h-8 w-8 text-ink-50 transition-colors group-hover:text-brand-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M11 5 6 9H3v6h3l5 4z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="relative h-8 w-8 text-ink-50 transition-colors group-hover:text-brand-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M11 5 6 9H3v6h3l5 4z" />
              <path d="m22 9-5 5M17 9l5 5" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-pressed={isFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
          className="group absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-ink-50/40 backdrop-blur-sm transition-[transform,border-color] duration-300 ease-out-expo hover:scale-105 hover:border-brand-400 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-8 sm:right-8"
        >
          <span className="absolute inset-0 rounded-full bg-ink-50/5 transition-colors group-hover:bg-brand-500/10" />
          {isFullscreen ? (
            <svg
              viewBox="0 0 24 24"
              className="relative h-5 w-5 text-ink-50 transition-colors group-hover:text-brand-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 4v3a2 2 0 0 1-2 2H4M20 9h-3a2 2 0 0 1-2-2V4M15 20v-3a2 2 0 0 1 2-2h3M4 15h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="relative h-5 w-5 text-ink-50 transition-colors group-hover:text-brand-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 9V6a2 2 0 0 1 2-2h3M15 4h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M9 20H6a2 2 0 0 1-2-2v-3" />
            </svg>
          )}
        </button>
      </section>
    </>
  );
}
