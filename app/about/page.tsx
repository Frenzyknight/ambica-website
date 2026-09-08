import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Production from "@/components/Production";
import Team from "@/components/Team";
import Timeline from "@/components/Timeline";
import CtaConsultation from "@/components/CtaConsultation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us — Ambica",
  description:
    "Three generations of weaving, finishing, and obsessing over the drape. Learn the story behind Ambica synfab.",
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <PageHero
        title={
          <>
            About <span className="text-brand-400">Us</span>
          </>
        }
        image="/hero-about.webp"
        imageAlt="Close-up of a hand weaving indigo threads on a traditional wooden loom"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />
      {/* Content curtain — slides up over the sticky banner. No `overflow`
          here so the sticky heading inside <Production> keeps working; the
          rounded reveal lives on the first section instead. */}
      <div className="relative z-10">
        <Production className="rounded-t-3xl lg:rounded-t-[3rem]" />
        <Team />
        <Timeline />
        <CtaConsultation />
        <Footer />
      </div>
    </main>
  );
}
