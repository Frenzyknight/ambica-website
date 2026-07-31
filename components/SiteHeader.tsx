"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Our Subsidiaries", href: "/subsidiaries" },
  { label: "Fabrics", href: "/fabrics" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="pointer-events-auto" onClick={() => setOpen(false)}>
          <Image
            src="/ambica-logo-light.png"
            alt="Ambica — a mark of quality"
            width={180}
            height={128}
            priority
            className="h-auto w-[120px] md:w-[180px]"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="pointer-events-auto hidden items-center gap-8 text-sm font-medium text-ink-200 md:flex">
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
              className="absolute left-0 top-[7px] block h-0.5 w-6 rounded-full bg-ink-50"
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="absolute left-0 top-[14px] block h-0.5 w-6 rounded-full bg-ink-50"
              animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto fixed inset-0 z-10 flex flex-col justify-center gap-2 bg-ink-950/95 px-8 backdrop-blur-md md:hidden"
          >
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
                src="/ambica-logo-light.png"
                alt="Ambica — a mark of quality"
                width={110}
                height={78}
                className="opacity-80"
              />
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
