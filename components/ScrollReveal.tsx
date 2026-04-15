"use client";

import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface ScrollRevealProps {
  children: string;
  className?: string;
}

function Word({ children, progress, range, isHighlighted }: { children: string; progress: any; range: [number, number]; isHighlighted?: boolean }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const blur = useTransform(progress, range, ["blur(4px)", "blur(0px)"]);

  return (
    <span className="relative inline-block mr-[0.25em]">
      <motion.span
        style={{
          opacity,
          filter: blur,
          color: isHighlighted ? "var(--color-crimson)" : "inherit"
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function ScrollReveal({ children, className = "" }: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "end 0.7"],
  });

  const words = useMemo(() => children.split(" "), [children]);

  return (
    <section ref={containerRef} className={`relative py-40 px-6 flex items-center justify-center ${className}`}>
      <div className="relative max-w-4xl mx-auto">
        <motion.div
          style={{
            rotateX: useTransform(scrollYProgress, [0, 1], [5, 0]),
            transformOrigin: "center center"
          }}
          className="text-[clamp(1.5rem,4vw,3.2rem)] font-black uppercase leading-[1.2] tracking-tight text-center"
        >
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + (1 / words.length);

            // Highlight specific words (cleaning punctuation for matching)
            const cleanWord = word.replace(/[.,"]/g, "").toLowerCase();
            const highlights = ["rewarded", "agreeable", "low", "friction", "confinement"];
            const isHighlighted = highlights.includes(cleanWord);

            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]} isHighlighted={isHighlighted}>
                {word}
              </Word>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
