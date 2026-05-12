"use client";

import { useRouter } from "next/navigation";
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

export default function VSLPage() {
  const router = useRouter();

  const goToStepIn = () => router.push("/step-in");
  const goToPassion = () => {
    window.location.href = PASSION_URL;
  };

  return (
    <main className="relative overflow-x-hidden">
      <StickyCtaBar onCta={goToStepIn} />
      <HeroSection />
      <div className="h-8 md:h-20 bg-black" />
      <VideoSection />
      <div className="bg-black"><MarqueeBar /></div>
      <ScrollReveal className="bg-near-black">
        "you were not built to shrink. strength is a standard, not a mood. the standard does not bend to how you feel today."
      </ScrollReveal>
      <div className="section-divider" />
      <ProblemSection />
      <div className="section-divider" />
      <StandardSection />
      <div className="section-divider" />
      <MethodSection />
      <div className="section-divider" />
      <TierSection />
      <div className="section-divider" />
      <CultureSection />
      <div className="section-divider" />
      <BocaHqSection onCta={goToPassion} />
      <div className="section-divider" />
      <ObjectionsSection />
      <div className="section-divider" />
      <CloseSection onCta={goToStepIn} />
    </main>
  );
}
