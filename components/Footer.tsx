"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealEyebrow } from "./RevealText";
import WeaveTexture from "./WeaveTexture";

const explore = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Fabrics", href: "/#fabrics" },
  { label: "Craft", href: "/#craft" },
  { label: "Contact", href: "/#contact" },
];

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/ambica_synfab/",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.2" />
        <circle cx="16.6" cy="7.4" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Ambica-Synfab/61577942832790/",
    icon: (
      <>
        <path d="M14.5 8.5h1.8V5.7c-.3 0-1.4-.1-2.3-.1-2 0-3.4 1.2-3.4 3.5v1.6H8v2.6h2.6V20h2.9v-6.7h2.4l.4-2.6h-2.8V9.4c0-.7.2-.9 1-.9z" />
      </>
    ),
  },
  {
    label: "Email",
    href: "mailto:ambicasynfabpvtltd1857@gmail.com",
    icon: (
      <>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
        <path d="M4.5 7l7.5 6 7.5-6" />
      </>
    ),
  },
];

function ContactIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-800 text-brand-400">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        {children}
      </svg>
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="dark relative isolate overflow-hidden bg-ink-950 text-foreground">
      {/* woven fabric texture */}
      <WeaveTexture />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-10 lg:px-10 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:gap-16">
          {/* Brand */}
          <div>
            <Image
              src="/ambica-logo-light.webp"
              alt="Ambica — a mark of quality"
              width={133}
              height={94}
            />
           

            <div className="mt-8 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-800 text-ink-300 transition-colors duration-300 ease-out-expo hover:border-brand-500 hover:text-brand-400"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[18px] w-[18px]"
                  >
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <RevealEyebrow className="text-brand-400">Explore</RevealEyebrow>
            <ul className="mt-7 flex flex-col gap-4">
              {explore.map((link, i) => (
                <li key={link.label}>
                  <Reveal delay={i * 0.05} y={16}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2.5 text-sm font-medium text-ink-200 transition-colors hover:text-brand-400"
                    >
                      <span className="text-brand-500 transition-transform duration-300 ease-out-expo group-hover:translate-x-1">
                        ›
                      </span>
                      {link.label}
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <RevealEyebrow className="text-brand-400">Contact Info</RevealEyebrow>

            <div className="mt-7 flex flex-col gap-6">
              <Reveal delay={0.05} y={16} className="flex items-start gap-4">
                <ContactIcon>
                  <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </ContactIcon>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-400">
                    Mill &amp; Office
                  </p>
                  <a
                    href="https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=Kfn78IPnhV45MeY6n6jvzvDM&daddr=New+Cloth+Market,+187-188+%26+32,+opposite+Raipur,+New+Cloth+Market,+Gate,+Sherkotda,+Ahmedabad,+Gujarat+380002"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 block text-sm leading-relaxed text-ink-200 transition-colors hover:text-brand-400"
                  >
                    187-188 &amp; 32, Ambica,
                    <br />
                    Opposite Raipur Gate, New Cloth Market,
                    <br />
                    Ahmedabad, Gujarat 380002
                  </a>
                </div>
              </Reveal>

              <Reveal delay={0.1} y={16} className="flex items-start gap-4">
                <ContactIcon>
                  <path d="M4 5c0 8.3 6.7 15 15 15a1.6 1.6 0 001.6-1.6v-2.3a1.2 1.2 0 00-1-1.2l-3-.6a1.2 1.2 0 00-1.2.5l-.8 1.1a11.5 11.5 0 01-4.9-4.9l1.1-.8a1.2 1.2 0 00.5-1.2l-.6-3a1.2 1.2 0 00-1.2-1H5.6A1.6 1.6 0 004 5z" />
                </ContactIcon>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-400">
                    Phones
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-200">
                    <a href="tel:+919979222457" className="transition-colors hover:text-brand-400">
                      +91 99792 22457
                    </a>
                    <br />
                    <a href="tel:+917567360244" className="transition-colors hover:text-brand-400">
                      +91 75673 60244
                    </a>
                    <br />
                    <a href="tel:+918980370557" className="transition-colors hover:text-brand-400">
                      +91 89803 70557
                    </a>
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.15} y={16} className="flex items-start gap-4">
                <ContactIcon>
                  <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
                  <path d="M4.5 7l7.5 6 7.5-6" />
                </ContactIcon>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-400">
                    Email
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-200">
                    <a
                      href="mailto:ambicasynfabpvtltd1857@gmail.com"
                      className="transition-colors hover:text-brand-400"
                    >
                      ambicasynfabpvtltd1857@gmail.com
                    </a>
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-200">
                  <a href="mailto:info@ambicasynfab.com"
                      className="transition-colors hover:text-brand-400"
                    >
                    info@ambicasynfab.com
                    </a>
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Bottom bar — stitch separator */}
        <div className="mt-16 lg:mt-20">
          <div
            aria-hidden
            className="h-[3px] w-full text-ink-700"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, currentColor 0 7px, transparent 7px 13px), repeating-linear-gradient(90deg, currentColor 0 7px, transparent 7px 13px)",
              backgroundSize: "100% 1px, 100% 1px",
              backgroundPosition: "0 0, 0 2px",
              backgroundRepeat: "repeat-x",
            }}
          />
          <div className="flex flex-col items-center justify-between gap-6 pt-8 sm:flex-row">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              ©  Ambica synfab · A mark of quality
            </p>
            <Link
              href="/"
              aria-label="Back to top"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-all duration-300 ease-out-expo hover:bg-primary-hover hover:shadow-none"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
