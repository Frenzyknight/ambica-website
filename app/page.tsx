import Hero from "@/components/Hero";
import About from "@/components/About";
import FabricUsps from "@/components/FabricUsps";
import Showcase from "@/components/Showcase";
import VideoParallax from "@/components/VideoParallax";
import Testimonials from "@/components/Testimonials";
import CtaConsultation from "@/components/CtaConsultation";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <About />
      <Showcase />
      <FabricUsps />
      <VideoParallax />
      <Testimonials />
      <CtaConsultation />
      <Footer />
    </main>
  );
}
