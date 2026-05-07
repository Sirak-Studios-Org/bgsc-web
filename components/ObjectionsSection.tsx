"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Eyebrow, Display } from "./ui";

const OBJECTIONS = [
  {
    q: "Will lifting heavy weights make me bulky?",
    a: "Strength enhances shape; it doesn't remove femininity. Heavy training builds structure, definition, and the way you carry yourself — the 'bulky' story is a myth designed to keep women out of the weight room.",
  },
  {
    q: "I always fall off. Why would this be different?",
    a: "That's a support problem, not a discipline problem. If you've fallen off before, you didn't have the right structure or the right circle. Choose Supported or Immersed — the standard is held with you, not just handed to you.",
  },
  {
    q: "I'm a complete beginner. Will I be lost?",
    a: "No. The method starts with movement patterns and structural integrity, then progresses you methodically. You don't need experience — you need a standard, and that's what you step into.",
  },
  {
    q: "I don't have access to a real gym. Does this still work?",
    a: "Yes. Independent and Supported are built to translate from minimal equipment all the way up to full barbell work. The standard travels with you. Immersed adds in-person coaching at the Boca HQ.",
  },
  {
    q: "What's the difference between Independent, Supported, and Immersed?",
    a: "Independent solves the time problem — flexible, on-demand training. Supported solves the consistency problem — live coaching, weekly check-ins, accountability. Immersed solves the certainty problem — in-person coaching at Boca HQ.",
  },
  {
    q: "What happens if I want to stop?",
    a: "You leave. No friction, no questions. The standard is an invitation, not a trap.",
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
          {/* <Eyebrow>Objection Handling</Eyebrow> */}
          <Display className="text-4xl md:text-5xl uppercase tracking-tighter">
            FA<span style={{ color: "var(--crimson)" }}>Q<span className="lowercase">s</span></span>
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

                <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp bg-surface-1">
                  <div className="px-6 pb-5">
                    <p className="text-sm leading-relaxed text-white/80">
                      {item.a}
                    </p>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </motion.div>
          ))}
        </Accordion.Root>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { height: 0; opacity: 0; }
          to { height: var(--radix-accordion-content-height); opacity: 1; }
        }
        @keyframes slideUp {
          from { height: var(--radix-accordion-content-height); opacity: 1; }
          to { height: 0; opacity: 0; }
        }
        .animate-slideDown {
          animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1);
        }
        .animate-slideUp {
          animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1);
        }
      `}</style>
    </section>
  );
}