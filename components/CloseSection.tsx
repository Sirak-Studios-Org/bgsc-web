"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Display } from "./ui";

const PERKS = [
  "Three immersion levels — Independent, Supported, Immersed",
  "Coached method, structured repetition, real progression",
  "Active community channel — not a course, a club",
  "Boca Raton HQ for in-person training",
  "Step out anytime. The standard is an invitation.",
];

export default function CloseSection({ onCta }: { onCta: () => void }) {
  return (
    <section id="close" className="py-32 px-6" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-5xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Left: offer */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Display className="text-3xl sm:text-4xl md:text-5xl mb-4 leading-[1.05]">
              Step Into{" "}
              <span style={{ color: "var(--crimson)" }}>The New Standard.</span>
            </Display>
            <ul className="space-y-3 mb-8 mt-6">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center border border-border text-[11px] font-bold text-crimson">
                    ✓
                  </span>
                  <span
                    className="text-sm text-soft-white leading-relaxed"
                    style={{ fontFamily: "var(--font-body, 'Inter', sans-serif)" }}
                  >
                    {perk}
                  </span>
                </li>
              ))}
            </ul>

            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onClick={onCta}
              className="group relative inline-flex items-center h-[56px] pl-18 pr-9 overflow-hidden bg-soft-white text-near-black transition-all duration-300 cursor-pointer mx-auto lg:mx-0 block"
              style={{ borderRadius: "2px" }}
            >
              {/* Expanding Box */}
              <div className="absolute left-1 top-1 bottom-1 w-[44px] bg-near-black text-soft-white transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] group-hover:w-[calc(100%-8px)] z-20 flex items-center justify-center border border-white/5">
                <div className="absolute transition-all duration-300 ease-out flex items-center justify-center group-hover:opacity-0 group-hover:scale-50">
                  <svg width="20" height="20" viewBox="-5 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 12.781v6.719c0 0.813 0.594 1.406 1.438 1.406h7.813v5.375c0 0.5 0.219 0.813 0.688 1.031 0.125 0.031 0.281 0.063 0.406 0.063 0.313 0 0.563-0.094 0.781-0.313l10.094-10.156c0.438-0.375 0.438-1.125 0-1.563l-10.094-10.063c-0.625-0.688-1.875-0.25-1.875 0.781v5.344h-7.813c-0.844 0-1.438 0.563-1.438 1.375z" fill="currentColor" />
                  </svg>
                </div>

                <div className="absolute transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 flex items-center justify-center gap-3 uppercase font-black text-[10px] md:text-xs tracking-[0.3em] whitespace-nowrap">
                  <span>Start</span>
                </div>
              </div>

              <span className="relative z-10 font-bold uppercase text-[11px] md:text-xs tracking-[0.25em] transition-opacity duration-300 group-hover:opacity-0 whitespace-nowrap">
                Choose Your Level
              </span>
            </motion.button>
          </motion.div>

          {/* Right: image */}
          <motion.div
            className="relative overflow-hidden h-[380px] sm:h-[460px] lg:h-[560px]"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <Image
              src="/images/close-triumph.jpg"
              alt="Step into the new standard"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top brightness-80 select-none pointer-events-none border border-border"
            />
          </motion.div>
        </div>

        {/* Trial mention — single, understated */}
        <motion.div
          className="text-center max-w-2xl mx-auto py-12 mb-8 border-t border-b border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] tracking-[0.3em] uppercase mb-3 font-bold text-crimson">
            Trial Invitation
          </p>
          <p className="text-lg md:text-xl font-bold uppercase tracking-tight text-soft-white leading-snug">
            Experience your first week of The New Standard — free.
          </p>
          <p className="text-xs text-ash mt-4 leading-relaxed">
            Step out anytime in the first seven days. No friction. No questions.
          </p>
        </motion.div>

        {/* Sign-off */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p
            className="text-2xl md:text-3xl lg:text-4xl font-black uppercase mb-4 px-4"
            style={{ color: "var(--soft-white)", fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}
          >
            If you are ready to build something stronger, you are in the right place.
          </p>
          <p className="text-xs mt-8 text-ash">
            © {new Date().getFullYear()} Bad Girl Strength Club · All rights reserved
          </p>
        </motion.div>
      </div>
    </section>
  );
}
