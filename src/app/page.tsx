import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import CryptoTicker from "@/components/sections/CryptoTicker";
import AboutUs from "@/components/sections/AboutUs";
import InvestmentPlans from "@/components/sections/InvestmentPlans";
import HowItWorks from "@/components/sections/HowItWorks";
import CopyTradingFeature from "@/components/sections/CopyTradingFeature";
import Testimonials from "@/components/sections/Testimonials";
import Statistics from "@/components/sections/Statistics";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <CryptoTicker />
        <AboutUs />
        <InvestmentPlans />
        <HowItWorks />
        <CopyTradingFeature />
        <Testimonials />
        <Statistics />
      </main>
      <Footer />
    </>
  );
}
