import React from "react";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import { Reveal } from "./RevealText";

type Crumb = {
  label: string;
  href?: string;
};

export default function PageHero({
  title,
  image,
  imageAlt,
  breadcrumbs,
}: {
  title: React.ReactNode;
  image: string;
  imageAlt: string;
  breadcrumbs: Crumb[];
}) {
  return (
    <section className="dark sticky top-0 z-0 flex h-[50vh] min-h-[420px] w-full items-center justify-center overflow-hidden bg-ink-950 text-foreground">
      {/* `fill` needs an absolute/relative/fixed parent; the section is sticky,
          so anchor the image to an absolute wrapper instead. */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={imageAlt}
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Legibility scrims */}
      <div className="pointer-events-none absolute inset-0 bg-ink-950/55" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/80 via-transparent to-ink-950/85" />

      <SiteHeader />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <Reveal as="h1" immediate delay={0.2} y={36}>
          <span className="text-balance text-display-sm uppercase text-ink-50 lg:text-display">
            {title}
          </span>
        </Reveal>
        <Reveal
          as="nav"
          immediate
          delay={0.38}
          aria-label="Breadcrumb"
          className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-ink-300"
        >
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.label} className="flex items-center gap-3">
              {index > 0 && <span className="text-brand-500">|</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-brand-400"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-brand-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
