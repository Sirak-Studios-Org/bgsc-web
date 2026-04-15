"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Eyebrow, Display } from "./ui";

export default function StandardSection() {
  return (
    <section className="py-24 px-6 bg-near-black">
      <div className="max-w-5xl mx-auto">

        {/* Top */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-16">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} className="relative order-2 lg:order-1"
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <Display className="text-3xl sm:text-4xl md:text-5xl mb-4 leading-[1.05]">
              A Different<br />
              <span className="text-crimson">Standard.</span>
            </Display>
            <p className="text-sm md:text-base leading-relaxed mb-10 text-ash">
              Women do not lack motivation they lack a standard worth keeping.
              Bad Girl Strength Club is a behavioral identity system. You are not buying a workout program.
              You are stepping into a new behavioral code.
            </p>
            {/* Core method - Square tiles */}
            <div className="relative grid grid-cols-3 gap-3 max-w-sm ml-0">
              {[
                { text: "Eat Clean" },
                { text: "Lift Heavy" },
                { text: "Get Coached" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="group relative aspect-square border border-border flex flex-col items-center justify-center p-3 text-center cursor-default overflow-hidden bg-surface-1 transition-all duration-300 hover:bg-crimson/70 hover:border-crimson hover:scale-105"
                  initial={{ opacity: 0, scale: 1 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <span className="relative z-10 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-1 text-soft-white/70 group-hover:text-soft-white transition-colors">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            className="relative overflow-hidden order-1 lg:order-2"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)" }}
          >
            <div
              className="relative w-full aspect-square max-w-[500px] bg-border p-px"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)" }}
            >
              <div
                className="relative w-full h-full bg-near-black overflow-hidden"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)" }}
              >
                <Image
                  src="/images/standard-power.jpg"
                  alt="The stronger standard"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top select-none pointer-events-none"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="border border-border bg-[#1a1a1a]">

            {/* Header */}
            <div className="hidden md:grid md:grid-cols-[1fr_1.2fr_1.2fr]">
              <div className="p-6 bg-near-black border-b border-border flex items-center">
                <p className="text-xs font-black uppercase tracking-widest text-soft-white/80">
                  Metric
                </p>
              </div>

              <div className="p-6 bg-near-black border-b border-l border-border flex items-center justify-center">
                <p className="text-xs font-black uppercase tracking-widest text-soft-white/80">
                  The Old World
                </p>
              </div>

              <div className="p-6 bg-near-black border-b border-l border-border flex items-center justify-center">
                <p className="text-xs font-black uppercase tracking-widest text-soft-white/80">
                  The BGSC Standard
                </p>
              </div>

            </div>

            {/* Rows */}
            <div className="divide-y divide-border/60">
              {[
                {
                  label: "The Goal",
                  left: "Shrinking, becoming lighter",
                  right: "Expanding. Carrying yourself with authority.",
                },
                {
                  label: "The Aesthetic",
                  left: "Pastel, soft, cute wellness",
                  right: "High-contrast, cinematic, structured.",
                },
                {
                  label: "The Messaging",
                  left: "Passive wellness, approval-seeking",
                  right: "Disciplined self-respect. Unapologetic.",
                },
                {
                  label: "The Method",
                  left: "Toning, generic content",
                  right: "Eat clean. Lift heavy. Get coached.",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="group grid grid-cols-1 md:grid-cols-[1fr_1.2fr_1.2fr] transition-colors duration-500"
                >
                  {/* Label */}
                  <div className="p-4 md:p-8 bg-near-black flex items-center border-b md:border-b-0 border-border/30">
                    <p className="text-xs font-black uppercase tracking-widest text-soft-white/80 group-hover:text-soft-white transition-colors">
                      {row.label}
                    </p>
                  </div>

                  {/* Left (Old) */}
                  <div className="p-6 md:p-8 flex items-center bg-near-black/50 border-b md:border-b-0 border-border/30">
                    <p className="text-xs text-ash/30 line-through leading-relaxed decoration-crimson transition-all">
                      {row.left}
                    </p>
                  </div>

                  {/* Right (New / Highlighted) */}
                  <div className="p-6 md:p-8 flex items-center md:border-l border-border bg-surface-1/30 group-hover:bg-surface-1/50 transition-all">
                    <p className="text-xs md:text-sm font-semibold text-soft-white leading-relaxed tracking-tight">
                      {row.right}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
