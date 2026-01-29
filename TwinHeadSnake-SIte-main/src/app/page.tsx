import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PositionsTable from "@/components/PositionsTable";
import TopCoinsTable from "@/components/TopCoinsTable";
import HowItWorks from "@/components/HowItWorks";
import AboutSection from "@/components/AboutSection";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ClientWrapper from "@/components/ClientWrapper";
import { SocialAlert } from "@/components/ui/social-alert";

export default function Home() {
  return (
    <ClientWrapper>
      <main>
        <Navbar currentPage="home" />
        <HeroSection />
        <PositionsTable />
        <TopCoinsTable />
        <HowItWorks />
        <AboutSection />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTASection />
        <Footer />
        <SocialAlert />
      </main>
    </ClientWrapper>
  );
}
