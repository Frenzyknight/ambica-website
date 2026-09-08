import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import FabricCatalog from "@/components/FabricCatalog";
import CtaConsultation from "@/components/CtaConsultation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Fabrics — Ambica",
  description:
    "200+ fabric qualities across apparel, shirting, suiting, prints, dyes, and custom development.",
};

export default function FabricsPage() {
  return (
    <main className="flex-1">
      <PageHero
        title={
          <>
            Our <span className="text-brand-400">Fabrics</span>
          </>
        }
        image="/cotton.webp"
        imageAlt="Folded plaid and striped cotton fabrics stacked on a table"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Fabrics" }]}
      />
      <div className="relative z-10">
        <FabricCatalog />
        <CtaConsultation />
        <Footer />
      </div>
    </main>
  );
}
