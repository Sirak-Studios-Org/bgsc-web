"use client";

import HeroSection from "@/components/HeroSection";
import VideoSection from "@/components/VideoSection";
import ScrollReveal from "@/components/ScrollReveal";
import MarqueeBar from "@/components/MarqueeBar";
import ProblemSection from "@/components/ProblemSection";
import StandardSection from "@/components/StandardSection";
import MethodSection from "@/components/MethodSection";
import CultureSection from "@/components/CultureSection";
import Stats from "@/components/stats";
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
      <div className="h-20 md:h-45 bg-black" />
      <div className="bg-black"><MarqueeBar /></div>
      <VideoSection />
      <ScrollReveal className="bg-near-black">
        "you have spent years being subtly rewarded for being agreeable and low friction. at some point that starts to feel like confinement."
      </ScrollReveal>
      <div className="section-divider" />
      <ProblemSection />
      <div className="section-divider" />
      <StandardSection />
      <div className="section-divider" />
      <MethodSection />
      <div className="section-divider" />
      <CultureSection />
      <div className="section-divider" />
      <Stats />
      <div className="section-divider" />
      <ObjectionsSection />
      <div className="section-divider" />
      <CloseSection onCta={handleCta} />
    </main>
  );
}
