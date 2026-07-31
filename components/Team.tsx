"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, RevealEyebrow } from "./RevealText";

type Member = {
  name: string;
  role: string;
  photo: string;
  linkedin: string;
  facebook: string;
};

// TODO: swap in the live company profile URLs before launch.
const team: Member[] = [
  {
    name: "Rajesh Mehta",
    role: "Managing Director",
    photo: "/team/rajesh-mehta.jpg",
    linkedin: "https://www.linkedin.com/company/ambica-synfab/",
    facebook: "https://www.facebook.com/people/Ambica-Synfab/61577942832790/",
  },
  {
    name: "Ananya Sharma",
    role: "Head of Production",
    photo: "/team/ananya-sharma.jpg",
    linkedin: "https://www.linkedin.com/company/ambica-synfab/",
    facebook: "https://www.facebook.com/people/Ambica-Synfab/61577942832790/",
  },
  {
    name: "Vikram Desai",
    role: "Quality Control Manager",
    photo: "/team/vikram-desai.jpg",
    linkedin: "https://www.linkedin.com/company/ambica-synfab/",
    facebook: "https://www.facebook.com/people/Ambica-Synfab/61577942832790/",
  },
  {
    name: "Meera Iyer",
    role: "Master Weaver",
    photo: "/team/meera-iyer.jpg",
    linkedin: "https://www.linkedin.com/company/ambica-synfab/",
    facebook: "https://www.facebook.com/people/Ambica-Synfab/61577942832790/",
  },
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
          alt={`Portrait of ${member.name}, ${member.role} at Ambica`}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover"
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
        <Reveal as="p" y={16} className="font-mono text-xs font-semibold uppercase tracking-[0.2em]">
          {member.name}
        </Reveal>
        <Reveal as="p" delay={0.05} y={12} className="mt-1 text-sm text-muted">
          {member.role}
        </Reveal>
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-screen"
        style={{
          backgroundImage: "url(/texture-final.jpg)",
          backgroundSize: "480px",
          backgroundRepeat: "repeat",
        }}
      />
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

        <div className="mt-14 grid grid-cols-2 gap-6 lg:mt-16 lg:grid-cols-4 lg:gap-8">
          {team.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
