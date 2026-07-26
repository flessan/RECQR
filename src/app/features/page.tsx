"use client";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Features from "@/components/sections/Features";
import BuiltForEveryone from "@/components/sections/BuiltForEveryone";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--color-on-surface)] mb-6">
            Features
          </h1>
          <p className="text-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
            Discover all the powerful features that make RECQR the best choice 
            for QR code management.
          </p>
        </div>
      </div>
      
      <Features />
      <BuiltForEveryone />
      
      <Footer />
    </main>
  );
}
