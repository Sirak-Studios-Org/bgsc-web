"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Display } from "./ui";

type Billing = "monthly" | "annual";

type TierSlug = "independent" | "supported" | "immersed";

type Tier = {
  slug: TierSlug;
  name: string;
  positioning: string;
  problem: string;
  outcome: string;
  inclusions: string[];
  // TODO[bgsc]: replace placeholder pricing once tier pricing is finalized
  monthly: string | null;
  annualPerMonth: string | null;
  annualTotal: string | null;
  applyOnly?: boolean;
  cta: string;
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    slug: "independent",
    name: "Independent",
    positioning: "You don't need more time. You need the right system.",
    problem: "Solves the time problem.",
    outcome: "Flexible, on-demand training built around the standard. You move when you can — the structure stays the same.",
    inclusions: [
      "Full video training library",
      "Self-paced programming",
      "Private community access",
    ],
    monthly: "$49",
    annualPerMonth: "$39",
    annualTotal: "$468 billed yearly",
    cta: "Start Independent",
  },
  {
    slug: "supported",
    name: "Supported",
    positioning: "You don't need more motivation. You need accountability.",
    problem: "Solves the consistency problem.",
    outcome: "Live remote classes, weekly check-ins, macro guidance — the structure plus a coach holding the line with you.",
    inclusions: [
      "Everything in Independent",
      "Live remote training sessions",
      "Macro guidance + weekly check-ins",
    ],
    monthly: "$199",
    annualPerMonth: "$159",
    annualTotal: "$1,908 billed yearly",
    cta: "Choose Supported",
    highlighted: true,
  },
  {
    slug: "immersed",
    name: "Immersed",
    positioning: "You don't need more information. You need guidance.",
    problem: "Solves the certainty problem.",
    outcome: "In-person coaching at the Boca Raton HQ. The full standard, taught and held by Steph and the BGSC team.",
    inclusions: [
      "Everything in Supported",
      "In-person coaching at Boca HQ",
      "Premium accountability + member rhythm",
    ],
    monthly: null,
    annualPerMonth: null,
    annualTotal: null,
    applyOnly: true,
    cta: "Apply for Immersed",
  },
];

export default function TierSection() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="tiers" className="py-24 px-6" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <motion.div
          className="max-w-3xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Display className="text-3xl sm:text-4xl md:text-5xl mb-6 leading-[1.05]">
            Choose Your{" "}
            <span style={{ color: "var(--crimson)" }}>Immersion Level.</span>
          </Display>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "var(--ash)", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}
          >
            Three ways into The New Standard. Each one solves a different problem. Pick the level of support that matches where you are.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative grid grid-cols-2 border border-border bg-near-black p-1 w-[280px] md:w-[320px]"
              role="tablist"
              aria-label="Billing period"
            >
              {/* Sliding pill */}
              <motion.div
                aria-hidden
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] bg-soft-white"
                animate={{ x: billing === "monthly" ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                style={{ borderRadius: "2px" }}
              />

              <button
                role="tab"
                aria-selected={billing === "monthly"}
                onClick={() => setBilling("monthly")}
                className={`relative z-10 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] transition-colors duration-300 cursor-pointer text-center ${
                  billing === "monthly" ? "text-near-black" : "text-soft-white/60 hover:text-soft-white"
                }`}
              >
                Monthly
              </button>
              <button
                role="tab"
                aria-selected={billing === "annual"}
                onClick={() => setBilling("annual")}
                className={`relative z-10 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] transition-colors duration-300 cursor-pointer text-center ${
                  billing === "annual" ? "text-near-black" : "text-soft-white/60 hover:text-soft-white"
                }`}
              >
                Annual
              </button>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-crimson">
              Save 20% with annual
            </p>
          </div>
        </motion.div>

        {/* Tier cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col border bg-near-black p-8 ${tier.highlighted ? "border-crimson lg:scale-[1.02]" : "border-border"}`}
            >
              {tier.highlighted && (
                <p className="absolute top-0 left-0 right-0 -translate-y-1/2 mx-auto w-fit px-4 py-1 bg-crimson text-soft-white text-[10px] font-bold uppercase tracking-[0.3em]">
                  Most Chosen
                </p>
              )}

              {/* Name */}
              <p
                className="text-xs font-bold uppercase tracking-[0.35em] mb-3"
                style={{ color: "var(--crimson)", fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}
              >
                {tier.problem}
              </p>
              <h3
                className="text-3xl md:text-4xl font-black uppercase tracking-tight text-soft-white mb-4"
                style={{ fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}
              >
                {tier.name}
              </h3>

              {/* Positioning */}
              <p className="text-sm md:text-base font-bold text-soft-white leading-snug mb-4">
                {tier.positioning}
              </p>

              {/* Outcome */}
              <p className="text-sm text-ash leading-relaxed mb-6">
                {tier.outcome}
              </p>

              {/* Inclusions */}
              <ul className="space-y-2 mb-8">
                {tier.inclusions.map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center border border-border text-[10px] font-bold text-crimson">
                      ✓
                    </span>
                    <span className="text-xs text-soft-white/85 leading-relaxed">{line}</span>
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="mt-auto pt-6 border-t border-border">
                {tier.applyOnly ? (
                  <div className="mb-6">
                    <p
                      className="text-4xl md:text-5xl font-black text-soft-white leading-none mb-2"
                      style={{ fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}
                    >
                      Apply
                    </p>
                    <p className="text-xs text-ash leading-relaxed">
                      By application — pricing shared after review.
                    </p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p
                      className="text-4xl md:text-5xl font-black text-soft-white leading-none mb-2"
                      style={{ fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}
                    >
                      {billing === "monthly" ? tier.monthly : tier.annualPerMonth}
                      <span className="text-base font-normal text-ash ml-1">/mo</span>
                    </p>
                    <p className="text-[11px] text-ash leading-relaxed">
                      {billing === "monthly" ? "Billed monthly" : tier.annualTotal}
                    </p>
                  </div>
                )}

                <Link
                  href={`/step-in?tier=${tier.slug}`}
                  className={`w-full h-[52px] flex items-center justify-center uppercase font-bold text-[11px] md:text-xs tracking-[0.25em] transition-all duration-300 cursor-pointer ${
                    tier.highlighted
                      ? "bg-crimson text-soft-white hover:bg-crimson/85"
                      : "bg-soft-white text-near-black hover:bg-ash"
                  }`}
                  style={{ borderRadius: "2px" }}
                >
                  {tier.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trial line */}
        <motion.p
          className="text-center text-xs md:text-sm uppercase tracking-[0.3em] text-ash mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Experience your first week of The New Standard — free.
        </motion.p>
      </div>
    </section>
  );
}
