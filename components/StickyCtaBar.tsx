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
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

            {/* Left: Logo */}
            <div className="flex-1 flex justify-start">
              <Image
                src="/images/primary-logo.svg"
                alt="BGSC logo"
                width={180}
                height={56}
                className="h-[44px] w-auto object-contain select-none pointer-events-none"
                style={{ height: "44px", width: "auto" }}
              />
            </div>

            {/* Center: Text */}
            <div className="hidden md:flex flex-1 justify-center">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-white/40 whitespace-nowrap">
                7-day free trial
              </p>
            </div>

            {/* Right: Button */}
            <div className="flex-1 flex justify-end">
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
                    <svg width="20" height="20" viewBox="-5 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 12.781v6.719c0 0.813 0.594 1.406 1.438 1.406h7.813v5.375c0 0.5 0.219 0.813 0.688 1.031 0.125 0.031 0.281 0.063 0.406 0.063 0.313 0 0.563-0.094 0.781-0.313l10.094-10.156c0.438-0.375 0.438-1.125 0-1.563l-10.094-10.063c-0.625-0.688-1.875-0.25-1.875 0.781v5.344h-7.813c-0.844 0-1.438 0.563-1.438 1.375z" fill="currentColor" />
                    </svg>
                  </div>

                  <div className="absolute transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 flex items-center justify-center">
                    <Image src="/images/logo-notext.svg" alt="BGSC" width={80} height={20} className="w-20 md:w-24 h-auto brightness-100 select-none" />
                  </div>
                </div>

                <span className="relative z-10 font-bold uppercase text-[11px] md:text-xs tracking-[0.25em] transition-opacity duration-300 group-hover:opacity-0 whitespace-nowrap">
                  Free Trial
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
