"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, RevealEyebrow } from "./RevealText";
import WeaveTexture from "./WeaveTexture";

type Member = {
  name: string;
  role?: string;
  focus: string;
  photo: string;
  photoPosition?: string;
  linkedin: string;
  facebook: string;
};

const LINKEDIN = "https://www.linkedin.com/company/ambica-synfab/";
const FACEBOOK = "https://www.facebook.com/people/Ambica-Synfab/61577942832790/";

const team: Member[] = [
  {
    name: "Pramod Agarwal",
    role: "Managing Director",
    focus: "Sales & Customer Relationships",
    photo: "/team/pramod.webp",
    linkedin: LINKEDIN,
    facebook: FACEBOOK,
  },
  {
    name: "Anand Agarwal",
    role: "Managing Director",
    focus: "Product Development & Production",
    photo: "/team/anand.webp",
    linkedin: LINKEDIN,
    facebook: FACEBOOK,
  },
  {
    name: "Pawan Agarwal",
    role: "Managing Director",
    focus: "Finance & Backend Operations",
    photo: "/team/pawan.webp",
    linkedin: LINKEDIN,
    facebook: FACEBOOK,
  },
  {
    name: "Manav Agarwal",
    focus: "Marketing & Production",
    photo: "/team/Manav.webp",
    linkedin: LINKEDIN,
    facebook: FACEBOOK,
  },
  {
    name: "Nirbhay Agarwal",
    role: "Founder",
    focus: "Nirbhay Textile Mill",
    photo: "/team/nirbhay.webp",
    linkedin: LINKEDIN,
    facebook: FACEBOOK,
  },
  {
    name: "Dharun Agarwal",
    role: "Founder",
    focus: "Dharun Textile Mill",
    photo: "/team/dharun.webp",
    photoPosition: "object-top",
    linkedin: LINKEDIN,
    facebook: FACEBOOK,
  }
 
];

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <path d="M8.1 10.6l7.5-4.3M8.1 13.4l7.5 4.3" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="3.5" y="9" width="3.5" height="11" />
      <circle cx="5.25" cy="4.75" r="1.9" />
      <path d="M11.5 20V9h3.4v1.7c.7-1.1 1.9-2 3.6-2 2.7 0 4 1.8 4 4.9V20h-3.5v-5.7c0-1.4-.5-2.4-1.8-2.4-1 0-1.6.7-1.9 1.3-.1.3-.1.6-.1 1V20z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M14.5 8.5h1.8V5.7c-.3 0-1.4-.1-2.3-.1-2 0-3.4 1.2-3.4 3.5v1.6H8v2.6h2.6V20h2.9v-6.7h2.4l.4-2.6h-2.8V9.4c0-.7.2-.9 1-.9z" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${direction === "left" ? "rotate-180" : ""}`}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function MemberCard({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div>
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-border bg-surface">
        <Image
          src={member.photo}
          alt={`Portrait of ${member.name}, ${member.role ?? member.focus} at Ambica`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw"
          className={`object-cover ${member.photoPosition ?? "object-center"}`}
        />

        <div
          ref={containerRef}
          className="absolute right-3 top-3 flex flex-col items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`Share ${member.name}'s profile`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-lift transition-colors duration-300 ease-out-expo ${
              open
                ? "border-brand-500 bg-primary text-primary-foreground"
                : "border-border bg-surface-raised text-foreground hover:border-brand-500 hover:text-brand-400"
            }`}
          >
            <ShareIcon />
          </button>

          <AnimatePresence>
            {open && (
              <>
                <motion.a
                  key="linkedin"
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on LinkedIn`}
                  initial={{ opacity: 0, y: -8, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground shadow-lift transition-colors hover:border-brand-500 hover:text-brand-400"
                >
                  <LinkedinIcon />
                </motion.a>
                <motion.a
                  key="facebook"
                  href={member.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on Facebook`}
                  initial={{ opacity: 0, y: -8, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground shadow-lift transition-colors hover:border-brand-500 hover:text-brand-400"
                >
                  <FacebookIcon />
                </motion.a>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em]">
          {member.name}
        </p>
        {member.role && (
          <p className="mt-1.5 text-sm font-medium text-foreground">
            {member.role}
          </p>
        )}
        <p className="mt-0.5 text-sm text-muted">{member.focus}</p>
      </div>
    </div>
  );
}

function TeamCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft >= max - 1);
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  // One card plus its gap — read off the DOM so it stays right across breakpoints.
  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const second = el.children[1] as HTMLElement | null;
    const step =
      first && second
        ? second.offsetLeft - first.offsetLeft
        : (first?.offsetWidth ?? el.clientWidth);
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <div className="mt-14 lg:mt-16">
      <div
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label="Ambica leadership team"
        className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth px-[8vw] scrollbar-none sm:px-6 lg:-mx-10 lg:gap-8 lg:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {team.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: Math.min(i, 3) * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-[84vw] shrink-0 snap-center sm:w-[calc((100%-1.5rem)/2)] sm:snap-start lg:w-[calc((100%-4rem)/3)]"
          >
            <MemberCard member={member} />
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-6">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
            aria-label="Previous team members"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground transition-all duration-300 ease-out-expo hover:border-brand-500 hover:text-brand-400 disabled:pointer-events-none disabled:opacity-35"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
            aria-label="Next team members"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground transition-all duration-300 ease-out-expo hover:border-brand-500 hover:text-brand-400 disabled:pointer-events-none disabled:opacity-35"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>

        <div aria-hidden className="h-px flex-1 bg-border">
          <div
            className="h-px origin-left bg-brand-500 transition-transform duration-300 ease-out-expo"
            style={{ transform: `scaleX(${0.2 + progress * 0.8})` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Team({ className = "" }: { className?: string }) {
  return (
    <section
      id="team"
      className={`dark relative isolate overflow-hidden bg-ink-950 text-foreground ${className}`}
    >
      {/* woven fabric texture — matches footer */}
      <WeaveTexture />
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <RevealEyebrow>Our Team</RevealEyebrow>
            <Reveal as="h2" className="max-w-md text-balance text-display-sm uppercase">
              Meet the people{" "}
              <span className="text-brand-400">behind the cloth</span>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Link
              href="/#contact"
              className="shrink-0 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 ease-out-expo hover:bg-primary-hover hover:shadow-none"
            >
              Contact Us
            </Link>
          </Reveal>
        </div>

        <TeamCarousel />
      </div>
    </section>
  );
}
