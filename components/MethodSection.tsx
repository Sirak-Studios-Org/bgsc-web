"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Eyebrow, Display } from "./ui";

const PHASES = [
  {
    phase: "Phase 1", name: "Foundation", weeks: "Weeks 1-4", img: "/images/phase1-foundation.jpg",
    desc: "Movement patterns, structural integrity, joint prep. You learn how your body actually works then you learn to demand more from it."
  },
  {
    phase: "Phase 2", name: "Build", weeks: "Weeks 5-10", img: "/images/phase2-build.jpg",
    desc: "Progressive overload done right. You'll lift numbers you didn't think were possible. This is where the identity shift happens."
  },
  {
    phase: "Phase 3", name: "Power", weeks: "Weeks 11-16", img: "/images/phase3-power.jpg",
    desc: "Strength meets speed meets presence. You don't just look different you move differently. You enter rooms differently."
  },
];

const INCLUDED = [
  "12-week progressive training system",
  "Full video demonstration library",
  "Nutrition guidance built around performance",
  "Weekly coach check-ins",
  "Private community of strong women",
  "Lifetime access to all program updates",
  "Mobile app for session logging",
  "Monthly live Q&A with Steph",
];

export default function MethodSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl mb-16">
          {/* <Eyebrow>The Method</Eyebrow> */}
          <Display className="text-3xl sm:text-4xl md:text-5xl mb-4 leading-[1.05]">
            Eat Clean.{" "}
            <span style={{ color: "var(--crimson)" }}>Lift Heavy.</span>
            {" "}Get Coached.
          </Display>
          <p className="text-sm md:text-base leading-relaxed"
            style={{ color: "var(--ash)", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}>
            A structured 12-week
            system built around three pillars that actually move the needle clean nutrition,
            heavy progressive lifting, and real coaching accountability.
          </p>
        </motion.div>

        {/* Phases */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {PHASES.map((p, i) => (
            <motion.div key={p.phase}
              className="relative overflow-hidden transition-all duration-300 border border-border bg-[#0e0e0ea2]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="relative h-44 overflow-hidden">
                <Image src={p.img} alt={p.name} fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center select-none pointer-events-none"
                  style={{ filter: "brightness(0.8) contrast(1.15)" }} />
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(to bottom, transparent 40%, #0e0e0e 100%)"
                }} />
                {/* <span className="absolute top-3 right-4 text-6xl font-black opacity-[0.12] leading-none select-none"
                  style={{ fontFamily: "var(--font-display, 'Poppins', sans-serif)", color: "#FFFFFF" }}>
                  {String(i + 1).padStart(2, "0")}
                </span> */}
              </div>
              <div className="p-6">
                {/* <p className="text-xs font-bold uppercase tracking-widest mb-1"
                   style={{ color: "var(--crimson)", fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}>
                  {p.phase} · {p.weeks}
                </p> */}
                <h3 className="text-2xl font-black uppercase mb-3"
                  style={{ fontFamily: "var(--font-display, 'Poppins', sans-serif)", color: "#FFFFFF" }}>
                  {p.name}
                </h3>
                <p className="text-sm leading-relaxed"
                  style={{ color: "var(--ash)", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}>{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* What's included */}
        <motion.div
          className="px-6 py-10 border border-border bg-[#0e0e0ea2]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-10">
            <Display className="text-3xl sm:text-4xl md:text-5xl mb-4 leading-[1.05]">
              Everything Included
              <span style={{ color: "var(--crimson)" }}> in <br /> free trial</span>
            </Display>
            <p className="text-sm text-ash max-w-md">
              Everything you need to execute the system properly not guess your way through it.
            </p>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-x-12">
            {[0, 1].map((col) => (
              <div key={col} className="divide-y divide-border/60">
                {INCLUDED
                  .filter((_, i) => i % 2 === col)
                  .map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-4 py-4 group"
                    >
                      {/* Checkbox */}
                      <span className="shrink-0 mt-1 w-5 h-5 flex items-center justify-center border border-border text-sm font-bold text-crimson">
                        ✓
                      </span>

                      {/* Text */}
                      <p className="text-sm text-soft-white leading-relaxed group-hover:translate-x-1 transition-transform duration-200">
                        {item}
                      </p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
