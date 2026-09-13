import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System — Ambica",
  description: "Color, type, and component tokens for the Ambica website.",
};

const brandScale = [
  ["50", "#fafbe9"],
  ["100", "#f4f7cb"],
  ["200", "#eaf09b"],
  ["300", "#dee55f"],
  ["400", "#d3dc3d"],
  ["500", "#c9d234"],
  ["600", "#a3ac20"],
  ["700", "#7d831c"],
  ["800", "#63681d"],
  ["900", "#54581d"],
  ["950", "#2c300c"],
] as const;

const inkScale = [
  ["50", "#f7f7f5"],
  ["100", "#edede9"],
  ["200", "#dad9d4"],
  ["300", "#bebdb7"],
  ["400", "#9c9b94"],
  ["500", "#82817a"],
  ["600", "#6b6a64"],
  ["700", "#575651"],
  ["800", "#454440"],
  ["900", "#2f2e2d"],
  ["950", "#171614"],
] as const;

function Swatch({
  step,
  hex,
  note,
}: {
  step: string;
  hex: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-lg border border-border"
        style={{ background: hex }}
      />
      <div className="font-mono text-xs text-muted">
        <span className="block font-semibold text-foreground">{step}</span>
        {hex}
        {note && <span className="block text-accent">{note}</span>}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-14">
      <h2 className="mb-8 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-20 pt-32">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-accent">
        Ambica Design System
      </p>
      <h1 className="text-display-sm">
        Chartreuse on charcoal, set in Geist.
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Both scales are sampled directly from the Ambica logo — brand-500 is
        the mark&apos;s green, ink-900 its charcoal. Use semantic tokens
        (background, foreground, primary, muted, border) in components;
        reach for raw scale steps only in decorative work.
      </p>

      <Section title="Brand — Ambica Chartreuse">
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-11">
          {brandScale.map(([step, hex]) => (
            <Swatch
              key={step}
              step={step}
              hex={hex}
              note={step === "500" ? "logo" : undefined}
            />
          ))}
        </div>
      </Section>

      <Section title="Ink — Warm Charcoal">
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-11">
          {inkScale.map(([step, hex]) => (
            <Swatch
              key={step}
              step={step}
              hex={hex}
              note={step === "900" ? "logo" : undefined}
            />
          ))}
        </div>
      </Section>

      <Section title="Typography — Geist">
        <div className="flex flex-col gap-10">
          <div>
            <p className="mb-2 font-mono text-xs text-muted">
              text-display-lg · clamp(2.5rem → 6.5rem) · -0.035em
            </p>
            <p className="text-display-lg">Woven to last</p>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs text-muted">
              text-display · clamp(2rem → 4.5rem) · -0.03em
            </p>
            <p className="text-display">A mark of quality</p>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs text-muted">
              text-display-sm · clamp(1.75rem → 3rem) · -0.02em
            </p>
            <p className="text-display-sm">Fabric, felt first</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-xs text-muted">
                Body · text-lg / leading-relaxed
              </p>
              <p className="max-w-md text-lg leading-relaxed">
                Three generations of weaving, finishing, and obsessing over
                the drape. Every bolt leaves the loom with a story.
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-xs text-muted">
                Mono · labels &amp; eyebrows
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
                Cotton · 240 GSM · Loom 7
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <button className="rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 ease-out-expo hover:bg-primary-hover hover:shadow-none">
            Primary — glow
          </button>
          <button className="rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">
            Primary
          </button>
          <button className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold transition-colors hover:border-brand-500 hover:text-brand-600">
            Secondary
          </button>
          <button className="px-2 py-3.5 text-sm font-semibold text-accent underline-offset-4 hover:underline">
            Tertiary link
          </button>
        </div>
      </Section>

      <Section title="Dark context (.dark)">
        <div className="dark rounded-2xl bg-background p-10 text-foreground">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Inverted section
          </p>
          <h3 className="text-display-sm">Same tokens, flipped roles.</h3>
          <p className="mt-3 max-w-lg leading-relaxed text-muted">
            Wrap any section in the <code className="font-mono">.dark</code>{" "}
            class and the semantic tokens — background, foreground, muted,
            border, accent — re-map automatically. The hero uses this.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover">
              Explore fabrics
            </button>
            <button className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-brand-500 hover:text-brand-400">
              Our craft
            </button>
          </div>
        </div>
      </Section>

      <Section title="Surfaces & effects">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <p className="font-mono text-xs text-muted">bg-surface</p>
            <p className="mt-2 text-sm">Quiet panels and section fills.</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-lift">
            <p className="font-mono text-xs text-muted">
              bg-surface-raised + shadow-lift
            </p>
            <p className="mt-2 text-sm">Cards that float above surfaces.</p>
          </div>
          <div className="rounded-2xl bg-ink-950 p-6 shadow-glow">
            <p className="font-mono text-xs text-ink-400">shadow-glow</p>
            <p className="mt-2 text-sm text-ink-50">
              Chartreuse halo for hero CTAs.
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
