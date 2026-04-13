"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Eyebrow, Display } from "./ui";

const OBJECTIONS = [
  {
    q: "I've tried programs before and they didn't work.",
    a: "Because they weren't built for you. Most programs are calorie-deficient, cardio-heavy, and treat women like smaller versions of men. BGSC is a different architecture entirely — built around a behavioral identity system, not a generic content vault.",
  },
  {
    q: "Will I get bulky?",
    a: "No. Women have a fraction of the testosterone required to build bulk the way men do. What you'll build is shape, definition, and structural strength. The 'bulky' myth was designed to keep women out of the weight room. Muscle and discipline do not make a woman less feminine — they make her more fully expressed.",
  },
  {
    q: "I'm a beginner. Is this too advanced for me?",
    a: "Phase 1 was engineered specifically for beginners. We start where you are, not where we assume you should be. The system builds with you — methodically, progressively, without ego.",
  },
  {
    q: "I don't have a gym or much equipment.",
    a: "We have a home-based track built into Phase 1. Dumbbells and bodyweight are enough to start. The program meets you where you are and grows with your setup.",
  },
  {
    q: "What happens after the free 7 days?",
    a: "After your trial, continue at $47/month or lock in the annual rate at $297 (that's $25/month — saving 47%). Cancel any time before day 7 and you pay absolutely nothing. No friction, no questions.",
  },
  {
    q: "What if it doesn't work for me?",
    a: "Do the work, follow the system for 30 days, and if you don't feel stronger — physically and mentally — we refund you in full. Less than 1% of members have ever asked. That's not a boast. It's a standard.",
  },
];

export default function ObjectionsSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--near-black)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <Eyebrow>Objection Handling</Eyebrow>
          <Display className="text-4xl md:text-5xl">
            If You&apos;ve{" "}
            <span style={{ color: "var(--crimson)" }}>Tried Before...</span>
          </Display>
        </motion.div>

        <Accordion.Root type="single" collapsible className="space-y-2">
          {OBJECTIONS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Accordion.Item
                value={`item-${i}`}
                className="border border-border overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-5 text-left group bg-surface-1 cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* Index */}
                      {/* <span className="text-xs font-bold text-white/40 mt-[2px]">
                        {String(i + 1).padStart(2, "0")}
                      </span> */}

                      {/* Question */}
                      <span className="text-sm font-bold text-white pr-4">
                        {item.q}
                      </span>
                    </div>

                    <ChevronDown
                      size={16}
                      className="text-white transition-transform duration-300 group-data-[state=open]:rotate-180"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>

                <Accordion.Content asChild>
                  <motion.div
                    initial={false}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden bg-surface-1"
                  >
                    <div className="px-6 pb-5">
                      <p className="text-sm leading-relaxed text-white/80">
                        {item.a}
                      </p>
                    </div>
                  </motion.div>
                </Accordion.Content>
              </Accordion.Item>
            </motion.div>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}