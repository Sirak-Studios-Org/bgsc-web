"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Display } from "./ui";

const PILLARS = [
  {
    label: "Nourish",
    img: "/images/eat-clean.jpg",
    blurb:
      "Fuel the work. Macro awareness, real food, intentional intake — the foundation that makes the training translate.",
  },
  {
    label: "Train",
    img: "/images/lift-heavy.jpg",
    blurb:
      "Disciplined resistance, structured repetition, mind-muscle connection. Heavy lifting done with intent — not random programming.",
  },
  {
    label: "Connect",
    img: "/images/get-coached.jpg",
    blurb:
      "Stay connected to your body, your coach, and the women training beside you. Strength is held by a standard and a circle.",
  },
];

export default function MethodSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <Display className="text-3xl sm:text-4xl md:text-5xl mb-4 leading-[1.05]">
            The Bad Girl{" "}
            <span style={{ color: "var(--crimson)" }}>Method.</span>
          </Display>
          <p
            className="text-base md:text-lg leading-relaxed mt-6"
            style={{ color: "var(--ash)", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}
          >
            Three pillars. One standard. Nourish. Train. Connect.
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.label}
              className="relative overflow-hidden border border-border bg-[#0e0e0ea2] flex flex-col"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="relative aspect-[3/4] sm:h-[28rem] overflow-hidden">
                <Image
                  src={p.img}
                  alt={p.label}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center select-none pointer-events-none"
                  style={{ filter: "brightness(0.55) contrast(1.15)" }}
                />

                {/* Overlay label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none">
                  <h3
                    className={`text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest drop-shadow-xl ${i === 1 ? "text-crimson" : "text-soft-white"}`}
                    style={{ textShadow: "0 4px 12px rgba(0,0,0,0.8)" }}
                  >
                    {p.label}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <div className="px-6 py-6 border-t border-border">
                <p
                  className="text-sm leading-relaxed text-soft-white/85"
                  style={{ fontFamily: "var(--font-body, 'Inter', sans-serif)" }}
                >
                  {p.blurb}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
