"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function StickyCtaBar({ onCta }: { onCta: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" as const }}
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "var(--near-black)",
            borderTop: "1px solid var(--crimson)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="max-w-5xl mx-auto px-6 py-4 items-center justify-center sm:justify-between gap-6 flex">
            
            {/* Left Side */}
            <div className="hidden sm:flex items-center gap-4">
              {/* Bigger Logo */}
              <Image
                src="/images/bgsc-logo.png"
                alt="BGSC logo"
                width={120}
                height={40}
                className="object-contain select-none pointer-events-none"
              />

              {/* Divider */}
              <div className="h-6 w-px bg-border" />

              {/* Text */}
              <p className="text-sm leading-tight text-white/70 max-w-[220px]">
                7-day free trial. No card required.
              </p>
            </div>

            {/* Button (unchanged) */}
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onClick={onCta}
              className="group relative inline-flex items-center h-[56px] pl-18 pr-9 overflow-hidden bg-soft-white text-near-black transition-all duration-300 cursor-pointer"
              style={{ borderRadius: "2px" }}
            >
              {/* Expanding Box */}
              <div className="absolute left-1 top-1 bottom-1 w-[44px] bg-near-black text-soft-white transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] group-hover:w-[calc(100%-8px)] z-20 flex items-center justify-center border border-white/5">
                <div className="absolute transition-all duration-300 ease-out flex items-center justify-center group-hover:opacity-0 group-hover:scale-50">
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <path d="M0 6V8H16V6H0ZM12 8V10H14V8H12ZM10 10V12H12V10H10ZM8 12V14H10V12H8ZM12 6V4H14V6H12Z" fill="currentColor"/>
                    <path d="M10 10V2H12V10H10ZM8 12V0H10V12H8Z" fill="currentColor"/>
                  </svg>
                </div>

                <div className="absolute transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 flex items-center justify-center gap-3 uppercase font-black text-[10px] md:text-xs tracking-[0.3em] whitespace-nowrap">
                  <span>BGSC</span>
                </div>
              </div>

              <span className="relative z-10 font-bold uppercase text-[11px] md:text-xs tracking-[0.25em] transition-opacity duration-300 group-hover:opacity-0 whitespace-nowrap">
                Start Free Trial
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
