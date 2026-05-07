"use client";

import HeroSection from "@/components/HeroSection";
import VideoSection from "@/components/VideoSection";
import ScrollReveal from "@/components/ScrollReveal";
import MarqueeBar from "@/components/MarqueeBar";
import ProblemSection from "@/components/ProblemSection";
import StandardSection from "@/components/StandardSection";
import MethodSection from "@/components/MethodSection";
import TierSection from "@/components/TierSection";
import CultureSection from "@/components/CultureSection";
import BocaHqSection from "@/components/BocaHqSection";
import ObjectionsSection from "@/components/ObjectionsSection";
import CloseSection from "@/components/CloseSection";
import StickyCtaBar from "@/components/StickyCtaBar";

const PASSION_URL = "https://badgirlstrengthclub.passion.io/";

function handleCta() {
  window.location.href = PASSION_URL;
}

function scrollToTiers() {
  document.getElementById("tiers")?.scrollIntoView({ behavior: "smooth" });
}

export default function VSLPage() {
  return (
    <main className="relative overflow-x-hidden">
      <StickyCtaBar onCta={scrollToTiers} />
      <HeroSection />
      <div className="h-8 md:h-20 bg-black" />
      <VideoSection />
      <div className="bg-black"><MarqueeBar /></div>
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
      <TierSection onCta={handleCta} />
      <div className="section-divider" />
      <CultureSection />
      <div className="section-divider" />
      <BocaHqSection onCta={handleCta} />
      <div className="section-divider" />
      <ObjectionsSection />
      <div className="section-divider" />
      <CloseSection onCta={scrollToTiers} />
    </main>
  );
}
