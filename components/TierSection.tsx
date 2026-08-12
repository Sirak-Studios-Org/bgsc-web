"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Display } from "./ui";

/*
 * TEMPORARY DUMMY LINKS
 *
 * Replace these later with Steph's real URLs.
 */
const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";

const FITBUDD_URL =
  process.env.NEXT_PUBLIC_FITBUDD_URL ?? "";
  
export default function TierSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleJoinSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    /*
     * TEMPORARY:
     * This currently only shows a success state.
     *
     * Later, connect this form to the real lead/application
     * endpoint so Steph receives the name + email.
     */
    console.log("BGSC Join the Club lead:", {
      name,
      email,
    });

    setSubmitted(true);
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
            Three ways to step into the BGSC standard. Start where you are,
            talk to Steph, or enroll when you&apos;re ready.
          </p>
        </motion.div>

        {/* Three action cards */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ========================================================= */}
          {/* 1. JOIN THE CLUB */}
          {/* ========================================================= */}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col border border-border bg-near-black p-8"
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-3"
              style={{
                color: "var(--crimson)",
                fontFamily:
                  "var(--font-display, 'Poppins', sans-serif)",
              }}
            >
              Stay Connected
            </p>

            <h3
              className="text-3xl md:text-4xl font-black uppercase tracking-tight text-soft-white mb-4"
              style={{
                fontFamily:
                  "var(--font-display, 'Poppins', sans-serif)",
              }}
            >
              Join the Club
            </h3>

            <p className="text-sm md:text-base font-bold text-soft-white leading-snug mb-4">
              Get closer to the BGSC standard.
            </p>

            <p className="text-sm text-ash leading-relaxed mb-8">
              Leave your details and Steph&apos;s team can follow up with you
              directly.
            </p>

            {submitted ? (
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
                  Thanks for joining. Steph&apos;s team will be in touch.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleJoinSubmit}
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-[50px] px-4 bg-transparent border border-border text-soft-white placeholder:text-ash/50 outline-none focus:border-crimson transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-[52px] flex items-center justify-center uppercase font-bold text-[11px] md:text-xs tracking-[0.25em] bg-soft-white text-near-black hover:bg-ash transition-all duration-300 cursor-pointer"
                  style={{ borderRadius: "2px" }}
                >
                  Join the Club
                </button>
              </form>
            )}
          </motion.div>

          {/* ========================================================= */}
          {/* 2. TALK TO STEPH */}
          {/* ========================================================= */}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex flex-col border border-crimson lg:scale-[1.02] bg-near-black p-8"
          >
            {/* Highlight */}
            <p className="absolute top-0 left-0 right-0 -translate-y-1/2 mx-auto w-fit px-4 py-1 bg-crimson text-soft-white text-[10px] font-bold uppercase tracking-[0.3em]">
              Before You Enroll
            </p>

            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-3"
              style={{
                color: "var(--crimson)",
                fontFamily:
                  "var(--font-display, 'Poppins', sans-serif)",
              }}
            >
              Have Questions?
            </p>

            <h3
              className="text-3xl md:text-4xl font-black uppercase tracking-tight text-soft-white mb-4"
              style={{
                fontFamily:
                  "var(--font-display, 'Poppins', sans-serif)",
              }}
            >
              Talk to Steph
            </h3>

            <p className="text-sm md:text-base font-bold text-soft-white leading-snug mb-4">
              Know if BGSC is right for you.
            </p>

            <p className="text-sm text-ash leading-relaxed mb-8">
              Book a pre-enrollment call with Steph. Get your questions
              answered and figure out the right next step.
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

          {/* ========================================================= */}
          {/* 3. ENROLL NOW */}
          {/* ========================================================= */}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex flex-col border border-border bg-near-black p-8"
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-3"
              style={{
                color: "var(--crimson)",
                fontFamily:
                  "var(--font-display, 'Poppins', sans-serif)",
              }}
            >
              Ready?
            </p>

            <h3
              className="text-3xl md:text-4xl font-black uppercase tracking-tight text-soft-white mb-4"
              style={{
                fontFamily:
                  "var(--font-display, 'Poppins', sans-serif)",
              }}
            >
              Enroll Now
            </h3>

            <p className="text-sm md:text-base font-bold text-soft-white leading-snug mb-4">
              Step into the standard.
            </p>

            <p className="text-sm text-ash leading-relaxed mb-8">
              Ready to get started? Continue your enrollment through the BGSC
              FitBudd platform.
            </p>

            <div className="mt-auto">
              <a
                href={FITBUDD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-[52px] flex items-center justify-center uppercase font-bold text-[11px] md:text-xs tracking-[0.25em] bg-soft-white text-near-black hover:bg-ash transition-all duration-300"
                style={{ borderRadius: "2px" }}
              >
                Enroll Now
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