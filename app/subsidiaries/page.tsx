import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CtaConsultation from "@/components/CtaConsultation";
import Footer from "@/components/Footer";
import SubsidiariesContent from "@/components/SubsidiariesContent";

export const metadata: Metadata = {
  title: "Our Subsidiaries | Ambica",
  description:
    "The Ambica group of companies: Nirbhay Textile Mill and Dharun Textile Mill, specialising across shirting, suiting, dyeing and fancy fabrics.",
};

const subsidiaries = [
  {
    logo: "/ntm-final.png",
    name: "Nirbhay Textile Mill",
    short: "NTM",
    tagline: "Fabrics of Lifestyle",
    description:
      "Specialises in Shirting & Suiting, including digital, rayon, polyester and a broad range of everyday-to-premium qualities woven for modern lifestyles.",
    image: "/ntm-hero.jpeg",
    imageAlt:
      "Nirbhay Textile Mill team reviewing a floral printed shirt at an Ambica showroom",
    accent: "#8a1f2b",
  },
  {
    logo: "/dtm-final.png",
    name: "Dharun Textile Mill",
    short: "DTM",
    tagline: "The Symbol of Quality",
    description:
      "Specialises in plain dyeing and a wide variety of fancy shirting qualities, bringing depth of colour and finish to every bolt with a relentless focus on consistency.",
    image: "/dtm-hero.jpeg",
    imageAlt:
      "Dharun Textile Mill team presenting striped shirting fabric at a textile exhibition",
    accent: "#3b3392",
  },
];

export default function SubsidiariesPage() {
  return (
    <main className="flex-1">
      <PageHero
        title={
          <>
            Our <span className="text-brand-400">Subsidiaries</span>
          </>
        }
        image="/subsidiaries-hero.jpeg"
        imageAlt="Aerial view of the Ambica group textile manufacturing complex at golden hour"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Our Subsidiaries" },
        ]}
      />
      <div className="relative z-10 rounded-t-3xl bg-surface lg:rounded-t-[3rem]">
        <SubsidiariesContent subsidiaries={subsidiaries} />
        <CtaConsultation />
        <Footer />
      </div>
    </main>
  );
}
