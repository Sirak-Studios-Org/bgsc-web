"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Display, Eyebrow } from "./ui";

const PERKS = [
  "Full access to all 3 phases — unlocked day 1",
  "Video library: every movement, every standard",
  "Join the private community immediately",
  "Day 3 coach check-in included",
  "Cancel before day 7 — you pay nothing",
];

export default function CloseSection({ onCta }: { onCta: () => void }) {

  return (
    <section id="close" className="py-32 px-6" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-5xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Left: offer */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            {/* <Eyebrow>Final Close</Eyebrow> */}
            <Display className="text-3xl sm:text-4xl md:text-5xl mb-4 leading-[1.05]">
              Step Into a{" "} <span style={{ color: "var(--crimson)" }}>Stronger Standard.</span>
            </Display>
            <p className="text-sm md:text-base leading-relaxed mb-7"
              style={{ color: "var(--ash)", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}>
              You can keep doing what you&apos;ve been doing and stay exactly where you are.
              Or you can accept the invitation and find out what
              happens when you finally train like you mean it.
            </p>

            <ul className="space-y-3 mb-8">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3">

                  {/* Checkbox */}
                  <span className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center border border-border text-[11px] font-bold text-crimson">
                    ✓
                  </span>

                  {/* Text */}
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

                <div className="absolute transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 flex items-center justify-center gap-3 uppercase font-black text-[10px] md:text-xs tracking-[0.3em] whitespace-nowrap">
                  <span>Start Free</span>
                </div>
              </div>

              <span className="relative z-10 font-bold uppercase text-[11px] md:text-xs tracking-[0.25em] transition-opacity duration-300 group-hover:opacity-0 whitespace-nowrap">
                Accept Challenge
              </span>
            </motion.button>
          </motion.div>

          {/* Right: image */}
          <motion.div className="relative overflow-hidden hidden lg:block"
            style={{ height: 560 }}
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
            <Image src="/images/close-triumph.jpg" alt="Step into a stronger standard" fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top brightness-80 select-none pointer-events-none border border-border" />
          </motion.div>
        </div>

        {/* Pricing */}
        <motion.div
          className="max-w-5xl mx-auto text-center py-16 px-6 mb-16 border border-border bg-near-black"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Label */}
          <p className="text-[11px] tracking-[0.3em] uppercase mb-8 font-bold text-ash">
            After your 7-day trial
          </p>

          {/* Pricing */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-12">

            {/* BASIC */}
            <div className="group cursor-pointer rounded-[2px] border border-white/20 px-8 py-8 w-[240px] md:w-[260px] text-center transition-all duration-300 bg-crimson/80 hover:bg-crimson/10 hover:border-crimson hover:scale-105 flex flex-col justify-between h-[220px]">
              <p
                className="text-[30px] uppercase tracking-[0.2em] mb-4 text-soft-white font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Basic
              </p>

              <p className="text-5xl md:text-6xl font-black text-soft-white leading-none">
                $49<span className="text-lg font-normal ml-1"
                  style={{
                    fontFamily: "var(--font-display)"
                  }}>/mo</span>
              </p>

              <p className="text-sm mt-4 text-soft-white font-bold uppercase">
                Foundation & Build
              </p>
            </div>

            {/* VIP */}
            <div className="group cursor-pointer rounded-[2px] border border-white/20 px-8 py-8 w-[240px] md:w-[260px] text-center transition-all duration-300 bg-crimson/80 hover:bg-crimson/10 hover:border-crimson hover:scale-105 flex flex-col justify-between h-[220px]">
              <p
                className="text-[30px] uppercase tracking-[0.2em] mb-4 text-soft-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                VIP
              </p>

              <p className="text-5xl md:text-6xl font-black text-soft-white leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                $299<span className="text-lg font-normal ml-1">/mo</span>
              </p>

              <p className="text-sm mt-4 text-soft-white font-bold uppercase">
                Full System + Elite Coaching
              </p>
            </div>

          </div>

          {/* Guarantee */}
          <p className="text-sm text-ash max-w-md mx-auto leading-relaxed">
            Cancel anytime before day 7 and you won't be charged. No friction. No questions.
          </p>
        </motion.div>

        {/* Sign-off */}
        <motion.div className="text-center"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <p className="text-2xl md:text-3xl lg:text-4xl font-black uppercase mb-4 px-4"
            style={{ color: "var(--soft-white)", fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}>
            If you are ready to build something stronger, you are at the right place.
          </p>
          <p className="text-xs mt-8 text-ash">
            © {new Date().getFullYear()} Bad Girl Strength Club · All rights reserved
          </p>
        </motion.div>
      </div>
    </section>
  );
}
