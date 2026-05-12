"use client";

import { motion } from "framer-motion";
import { Display } from "./ui";

export default function StandardSection() {
  return (
    <section className="py-24 px-6 bg-near-black">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-16">
          <Display className="text-3xl sm:text-4xl md:text-5xl leading-[1.05]">
            A New<br />
            <span className="text-crimson">Standard.</span>
          </Display>
        </motion.div>

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
                  right: "Nourish. Train. Connect.",
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
