"use client";

import HeroSection from "@/components/HeroSection";
import VideoSection from "@/components/VideoSection";
import MarqueeBar from "@/components/MarqueeBar";
import ProblemSection from "@/components/ProblemSection";
import StandardSection from "@/components/StandardSection";
import MethodSection from "@/components/MethodSection";
import CultureSection from "@/components/CultureSection";
import ObjectionsSection from "@/components/ObjectionsSection";
import CloseSection from "@/components/CloseSection";
import StickyCtaBar from "@/components/StickyCtaBar";

const PASSION_URL = "https://badgirlstrengthclub.passion.io/";

function handleCta() {
  window.location.href = PASSION_URL;
}

export default function VSLPage() {
  return (
    <main className="relative overflow-x-hidden">
      <StickyCtaBar onCta={handleCta} />
      <HeroSection onCta={handleCta} />
      <MarqueeBar />
      <VideoSection />
      <div className="section-divider" />
      <ProblemSection />
      <div className="section-divider" />
      <StandardSection />
      <div className="section-divider" />
      <MethodSection />
      <div className="section-divider" />
      <CultureSection />
      <div className="section-divider" />
      <ObjectionsSection />
      <div className="section-divider" />
      <CloseSection onCta={handleCta} />
    </main>
  );
}
