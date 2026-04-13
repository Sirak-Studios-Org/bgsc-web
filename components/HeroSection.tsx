"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function HeroSection({ onCta }: { onCta: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const KEY = "bgsc-hero-animation";
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

    const now = Date.now();
    const lastSeen = localStorage.getItem(KEY);

    const shouldAnimate =
      !lastSeen || now - parseInt(lastSeen, 10) > ONE_WEEK;

    if (!shouldAnimate) {
      setStage(1);
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";

    const timer1 = setTimeout(() => {
      setStage(1);
    }, 2000);

    const timer2 = setTimeout(() => {
      document.body.style.overflow = "auto";
      localStorage.setItem(KEY, now.toString());
    }, 3500);

    return () => {
      document.body.style.overflow = "auto";
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex flex-col overflow-hidden bg-black">
      
      {/* Full-bleed background */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={stage >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/images/hero-bg.jpg"
          alt="Bad Girl Strength Club"
          fill
          priority
          className="object-cover object-center select-none pointer-events-none"
          style={{ filter: "brightness(0.6) contrast(1.1)" }}
        />
        {/* Main Vignette */}
        <div className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.85) 100%)"
          }} />
        {/* Bottom Blend Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent" />
      </motion.div>

      {/* Logo — Animate from center to top */}
      <div className="absolute inset-0 z-20 pointer-events-none flex justify-center">
        <motion.div
          initial={{ top: "50%", y: "-50%", scale: 1.2 }}
          animate={stage === 0 
            ? { top: "50%", y: "-50%", scale: 1.2 } 
            : { top: "0%", y: "2rem", scale: 1 }
          }
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute"
        >
          <Image
            src="/images/bgsc-logo.png"
            alt="BGSC Logo"
            width={640}
            height={216}
            className="w-32 md:w-56 brightness-100 select-none pointer-events-none"
            priority
          />
        </motion.div>
      </div>

      {/* Content — Reveal after logo moves */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 pt-20">
        <div className="max-w-4xl mx-auto mt-[25%] md:mt-[10%]">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={stage >= 1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="font-black uppercase leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-display, 'Poppins', sans-serif)",
              color: "#FFFFFF",
              fontSize: "clamp(3.2rem, 10vw, 5.5rem)",
            }}
          >
            You Were{" "}
            <span style={{ color: "var(--crimson)" }}>Never</span>
            <br />
            Meant to{" "}
            <span style={{ color: "var(--crimson)" }}>Stay Small.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={stage >= 1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
            className="text-sm md:text-base max-w-xs md:max-w-md mx-auto leading-relaxed mt-3 lg:mt-0 mb-6"
            style={{ color: "var(--ash)", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}
          >
            An invitation into a stronger standard. Not a workout plan but a behavioral code.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={stage >= 1 ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
            onClick={onCta}
            className="group relative inline-flex items-center h-[56px] pl-18 pr-9 overflow-hidden bg-soft-white text-near-black transition-all duration-300 cursor-pointer"
            style={{ borderRadius: "2px" }}
          >
            {/* Expanding Box */}
            <div className="absolute left-1 top-1 bottom-1 w-[44px] bg-near-black text-soft-white transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] group-hover:w-[calc(100%-8px)] z-20 flex items-center justify-center border border-white/5">
              <div className="absolute transition-all duration-300 ease-out flex items-center justify-center group-hover:opacity-0 group-hover:scale-50">
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 6V8H16V6H0ZM12 8V10H14V8H12ZM10 10V12H12V10H10ZM8 12V14H10V12H8ZM12 6V4H14V6H12Z" fill="currentColor"/>
                  <path d="M10 10V2H12V10H10ZM8 12V0H10V12H8Z" fill="currentColor"/>
                </svg>
              </div>
              
              <div className="absolute transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 flex items-center justify-center gap-3 uppercase font-black text-[10px] md:text-xs tracking-[0.3em] whitespace-nowrap">
                <span>Start Free</span>
              </div>
            </div>

            <span className="relative z-10 font-bold uppercase text-[11px] md:text-xs tracking-[0.25em] transition-opacity duration-300 group-hover:opacity-0 whitespace-nowrap">
              Done Playing Small
            </span>
          </motion.button>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        onClick={() => document.getElementById("video-section")?.scrollIntoView({ behavior: "smooth" })}
        className="relative z-10 flex flex-col items-center pb-5 md:pb-7 gap-1.5"
        initial={{ opacity: 0 }}
        animate={stage >= 1 ? { opacity: 0.5 } : {}}
        transition={{ delay: 1.8, duration: 1 }}
      >
        <span className="text-xs tracking-[0.4em] uppercase"
          style={{ color: "#FFFFFF", fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}>
          Watch
        </span>
        <motion.div
          animate={{ y: [0, 8, 0, 8, 0, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 3, 
            ease: "easeInOut",
            times: [0, 0.1, 0.2, 0.3, 0.4, 1]
          }}
        >
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
            <polyline points="1,1 9,9 17,1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </motion.div>

    </section>
  );
}
