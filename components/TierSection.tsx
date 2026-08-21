"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Display } from "./ui";
import {
  ASSESSMENT_ANCHOR_ID,
  CALENDLY_URL,
  METABOLIC_ASSESSMENT_URL,
} from "@/lib/links";

/** Time the confirmation state holds before the assessment loads. */
const REDIRECT_DELAY_MS = 2500;

export default function TierSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "confirmed">("idle");
  const [error, setError] = useState<string | null>(null);
  const redirectRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectRef.current !== null) {
        window.clearTimeout(redirectRef.current);
      }
    };
  }, []);

  async function handleAssessmentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: "metabolic-assessment",
          name,
          email,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error ?? "Something went wrong. Please try again."
        );
      }
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      return;
    }

    setStatus("confirmed");
    redirectRef.current = window.setTimeout(() => {
      window.location.assign(METABOLIC_ASSESSMENT_URL);
    }, REDIRECT_DELAY_MS);
  }

  return (
    <section
      id="tiers"
      className="py-24 px-6"
      style={{ background: "var(--surface-1)" }}
    >
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
            <span style={{ color: "var(--crimson)" }}>
              Next Step.
            </span>
          </Display>

          <p
            className="text-base md:text-lg leading-relaxed"
            style={{
              color: "var(--ash)",
              fontFamily: "var(--font-body, 'Inter', sans-serif)",
            }}
          >
            Two ways to step into the BGSC standard. Start with your free
            metabolic assessment, or talk to a coach first.
          </p>
        </motion.div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">

          {/* ========================================================= */}
          {/* 1. METABOLIC ASSESSMENT */}
          {/* ========================================================= */}

          <motion.div
            id={ASSESSMENT_ANCHOR_ID}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col border border-border bg-near-black p-8 scroll-mt-24"
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-3"
              style={{
                color: "var(--crimson)",
                fontFamily:
                  "var(--font-display, 'Poppins', sans-serif)",
              }}
            >
              Free Trial
            </p>

            <h3
              className="text-3xl md:text-4xl font-black uppercase tracking-tight text-soft-white mb-4"
              style={{
                fontFamily:
                  "var(--font-display, 'Poppins', sans-serif)",
              }}
            >
              Metabolic Assessment
            </h3>

            <p className="text-sm md:text-base font-bold text-soft-white leading-snug mb-4">
              Get your free metabolic assessment.
            </p>

            <p className="text-sm text-ash leading-relaxed mb-8">
              Leave your name and email, answer a few questions about where
              you are today, and your results arrive by email.
            </p>

            {status === "confirmed" ? (
              <div className="mt-auto border border-crimson/50 p-6">
                <p
                  className="text-sm uppercase tracking-[0.2em] font-bold text-soft-white"
                  style={{
                    fontFamily:
                      "var(--font-display, 'Poppins', sans-serif)",
                  }}
                >
                  You&apos;re In.
                </p>

                <p className="text-sm text-ash mt-3 leading-relaxed">
                  Your assessment is loading now. It takes about two minutes,
                  and Steph sends your results straight to your inbox.
                </p>

                <a
                  href={METABOLIC_ASSESSMENT_URL}
                  className="inline-block text-xs uppercase tracking-[0.2em] font-bold text-crimson mt-4 underline underline-offset-4"
                >
                  Open the assessment
                </a>
              </div>
            ) : (
              <form
                onSubmit={handleAssessmentSubmit}
                className="mt-auto space-y-4"
              >
                <div>
                  <label
                    htmlFor="bgsc-name"
                    className="block text-[10px] uppercase tracking-[0.25em] font-bold text-ash mb-2"
                  >
                    Name
                  </label>

                  <input
                    id="bgsc-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-[50px] px-4 bg-transparent border border-border text-soft-white placeholder:text-ash/50 outline-none focus:border-crimson transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bgsc-email"
                    className="block text-[10px] uppercase tracking-[0.25em] font-bold text-ash mb-2"
                  >
                    Email
                  </label>

                  <input
                    id="bgsc-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-[50px] px-4 bg-transparent border border-border text-soft-white placeholder:text-ash/50 outline-none focus:border-crimson transition-colors"
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="text-xs text-crimson leading-relaxed"
                  >
                    {error}{" "}
                    <a
                      href={METABOLIC_ASSESSMENT_URL}
                      className="underline underline-offset-4"
                    >
                      Continue to the assessment
                    </a>
                    .
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full h-[52px] flex items-center justify-center uppercase font-bold text-[11px] md:text-xs tracking-[0.25em] bg-soft-white text-near-black hover:bg-ash transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  style={{ borderRadius: "2px" }}
                >
                  {status === "sending"
                    ? "Sending"
                    : "Start My Assessment"}
                </button>
              </form>
            )}
          </motion.div>

          {/* ========================================================= */}
          {/* 2. TALK TO A COACH */}
          {/* ========================================================= */}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex flex-col border border-crimson md:scale-[1.02] bg-near-black p-8"
          >
            {/* Highlight */}
            <p className="absolute top-0 left-0 right-0 -translate-y-1/2 mx-auto w-fit px-4 py-1 bg-crimson text-soft-white text-[10px] font-bold uppercase tracking-[0.3em]">
              Before You Start
            </p>

            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-3"
              style={{
                color: "var(--crimson)",
                fontFamily:
                  "var(--font-display, 'Poppins', sans-serif)",
              }}
            >
              Still Deciding
            </p>

            <h3
              className="text-3xl md:text-4xl font-black uppercase tracking-tight text-soft-white mb-4"
              style={{
                fontFamily:
                  "var(--font-display, 'Poppins', sans-serif)",
              }}
            >
              Talk to a Coach
            </h3>

            <p className="text-sm md:text-base font-bold text-soft-white leading-snug mb-4">
              Know if BGSC is right for you.
            </p>

            <p className="text-sm text-ash leading-relaxed mb-8">
              Book a pre-enrollment call. Get your questions answered and
              figure out the next step.
            </p>

            <div className="mt-auto">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-[52px] flex items-center justify-center uppercase font-bold text-[11px] md:text-xs tracking-[0.25em] bg-crimson text-soft-white hover:bg-crimson/85 transition-all duration-300"
                style={{ borderRadius: "2px" }}
              >
                Book a Call
              </a>
            </div>
          </motion.div>

        </div>

        {/* Bottom statement */}
        <motion.p
          className="text-center text-xs md:text-sm uppercase tracking-[0.3em] text-ash mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          The New Standard starts with your next decision.
        </motion.p>
      </div>
    </section>
  );
}
