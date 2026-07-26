import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import BuiltForEveryone from "@/components/sections/BuiltForEveryone";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import CTASection from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Navigation />
      
      <Hero />
      
      <Features />
      
      <BuiltForEveryone />
      
      <WhyChooseUs />
      
      <CTASection />
      
      <Footer />
    </main>
  );
}
