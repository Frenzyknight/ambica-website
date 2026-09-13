"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Our Subsidiaries", href: "/subsidiaries" },
  { label: "Fabrics", href: "/fabrics" },
];

// Routes that open on a dark hero, which is the only backdrop the bar can sit
// on transparently. Anywhere else it wears the floating pill from the first
// frame, otherwise the light logo would vanish into a light page.
const DARK_HERO_ROUTES = new Set([
  "/",
  "/about",
  "/subsidiaries",
  "/fabrics",
]);

// Asymmetric thresholds: the bar detaches once the hero starts leaving, but
// only re-docks back at the very top, so a scroll that hovers on the boundary
// can't flip it back and forth.
const DETACH_AT = 56;
const REATTACH_AT = 8;

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      setScrolled((prev) => (prev ? y > REATTACH_AT : y > DETACH_AT));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const floating = scrolled || !DARK_HERO_ROUTES.has(pathname);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-[padding] duration-700 ease-out-expo motion-reduce:transition-none ${
        floating ? "px-3 pt-3 sm:px-6 sm:pt-4" : "px-0 pt-0"
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between border transition-all duration-700 ease-out-expo motion-reduce:transition-none ${
          floating
            ? "pointer-events-auto max-w-5xl rounded-full border-ink-700/50 bg-ink-950/70 px-4 py-2 shadow-[0_16px_44px_-18px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:px-5"
            : "max-w-7xl rounded-none border-transparent px-6 py-6 lg:px-10"
        }`}
      >
        <Link href="/" className="pointer-events-auto" onClick={() => setOpen(false)}>
          <Image
            src="/ambica-logo-light.webp"
            alt="Ambica — a mark of quality"
            // 181×128 is the asset's true ratio (512×362). Declaring a width
            // no breakpoint actually renders at also avoids next/image's
            // "width or height modified, but not the other" dev warning.
            width={181}
            height={128}
            loading="eager"
            fetchPriority="high"
            // Only the width is animated — height stays auto so it follows the
            // aspect ratio frame by frame. (CSS can't interpolate `auto`.)
            className={`h-auto transition-[width] duration-700 ease-out-expo motion-reduce:transition-none ${
              floating ? "w-18" : "w-30 md:w-45"
            }`}
          />
        </Link>

        {/* Desktop nav */}
        <nav
          className={`pointer-events-auto hidden items-center text-sm font-medium text-ink-200 transition-[gap] duration-700 ease-out-expo motion-reduce:transition-none md:flex ${
            floating ? "gap-6" : "gap-8"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-brand-400"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="rounded-full border border-ink-700 px-5 py-2 text-ink-50 transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            Contact
          </Link>
        </nav>

        {/* Mobile hamburger button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="pointer-events-auto relative z-30 flex h-10 w-10 items-center justify-center md:hidden"
        >
          <span className="relative block h-4 w-6">
            <motion.span
              className="absolute left-0 top-0 block h-0.5 w-6 rounded-full bg-ink-50"
              animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="absolute left-0 top-1.75 block h-0.5 w-6 rounded-full bg-ink-50"
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="absolute left-0 top-3.5 block h-0.5 w-6 rounded-full bg-ink-50"
              animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </span>
        </button>
      </div>

      {/* Portalling the overlay keeps it above page-level stacking contexts. */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.nav
                aria-label="Mobile navigation"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-100 flex flex-col justify-center gap-2 bg-ink-950/95 px-8 backdrop-blur-md md:hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-ink-700 text-ink-50"
                >
                  <span className="relative block h-5 w-5">
                    <span className="absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                    <span className="absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
                  </span>
                </button>

                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block py-3 text-3xl font-semibold text-ink-50 transition-colors hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + navLinks.length * 0.06, duration: 0.3 }}
                >
                  <Link
                    href="/#contact"
                    onClick={() => setOpen(false)}
                    className="mt-4 inline-block rounded-full border border-ink-700 px-6 py-3 text-base font-medium text-ink-50 transition-colors hover:border-brand-500 hover:text-brand-400"
                  >
                    Contact
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute inset-x-0 bottom-10 flex justify-center"
                >
                  <Image
                    src="/ambica-logo-light.webp"
                    alt="Ambica — a mark of quality"
                    width={110}
                    height={78}
                    className="opacity-80"
                  />
                </motion.div>
              </motion.nav>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </header>
  );
}
