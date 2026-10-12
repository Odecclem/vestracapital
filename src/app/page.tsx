import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import CryptoTicker from "@/components/sections/CryptoTicker";
import LiveActivityTicker from "@/components/sections/LiveActivityTicker";
import AboutUs from "@/components/sections/AboutUs";
import InvestmentPlans from "@/components/sections/InvestmentPlans";
import ProfitCalculator from "@/components/sections/ProfitCalculator";
import HowItWorks from "@/components/sections/HowItWorks";
import CopyTradingFeature from "@/components/sections/CopyTradingFeature";
import Testimonials from "@/components/sections/Testimonials";
import Statistics from "@/components/sections/Statistics";
import FAQSection from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <CryptoTicker />
        <LiveActivityTicker />
        <AboutUs />
        <InvestmentPlans />
        <ProfitCalculator />
        <HowItWorks />
        <CopyTradingFeature />
        <Testimonials />
        <Statistics />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
