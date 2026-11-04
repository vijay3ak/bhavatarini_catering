"use client";

import React from "react";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { BrandTopline } from "@/components/layout/brand-topline";
import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/sections/hero-section";
import { TrustStrip } from "@/components/sections/trust-strip";
import { ServicesSection } from "@/components/sections/services-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { MenuSection } from "@/components/sections/menu-section";
import { WhyUsSection } from "@/components/sections/why-us-section";
import { CtaBanner } from "@/components/sections/cta-banner";
import { ContactSection } from "@/components/sections/contact-section";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { useActiveSection } from "@/lib/hooks/use-active-section";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";

export default function HomePage() {
  const activeSection = useActiveSection();
  useScrollReveal();

  return (
    <div className="relative min-h-screen flex flex-col bg-brand-cream text-brand-ink selection:bg-brand-gold selection:text-brand-ink overflow-x-hidden">
      {/* 0. Signature Chef Logo Animated Loading Screen */}
      <LoadingScreen />

      {/* 1. Scroll Progress Bar */}
      <ScrollProgress />

      {/* 2. Sticky Brand Topline Tracker */}
      <BrandTopline activeSection={activeSection} />

      {/* 3. Sticky Navigation Header */}
      <Header activeSection={activeSection} />

      {/* Main Content Sections */}
      <main className="flex-1 w-full overflow-x-hidden">
        {/* 4. Hero Section */}
        <HeroSection />

        {/* 5. Trust Strip */}
        <TrustStrip />

        {/* 6. Four Enriched Service Cards */}
        <ServicesSection />

        {/* 7. The Bhavatarini Experience */}
        <ExperienceSection />

        {/* 8. Menu Section */}
        <MenuSection />

        {/* 9. Why Choose Bhavatarini */}
        <WhyUsSection />

        {/* 10. Pre-Contact CTA Banner */}
        <CtaBanner />

        {/* 11. Contact & Enquiry Form */}
        <ContactSection />
      </main>

      {/* 12. Footer */}
      <Footer />

      {/* 13. Floating Back-to-Top Button */}
      <BackToTop />
    </div>
  );
}
