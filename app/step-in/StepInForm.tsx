"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type TierKey = "independent" | "supported" | "immersed" | null;

type TierMeta = {
  eyebrow: string;
  title: React.ReactNode;
  blurb: string;
  cta: string;
  mode: "trial" | "application";
};

function tierMeta(tier: TierKey): TierMeta {
  switch (tier) {
    case "independent":
      return {
        eyebrow: "For the Independent Tier",
        title: (
          <>
            Begin Your <span style={{ color: "var(--crimson)" }}>First Week.</span>
          </>
        ),
        blurb:
          "Flexible, on-demand training built around the standard. Your first week is free.",
        cta: "Begin First Week",
        mode: "trial",
      };
    case "supported":
      return {
        eyebrow: "For the Supported Tier",
        title: (
          <>
            Begin Your <span style={{ color: "var(--crimson)" }}>First Week.</span>
          </>
        ),
        blurb:
          "Live remote training, weekly check-ins, macro guidance. Your first week is free.",
        cta: "Begin First Week",
        mode: "trial",
      };
    case "immersed":
      return {
        eyebrow: "Apply for Immersed",
        title: (
          <>
            Apply to <span style={{ color: "var(--crimson)" }}>Immersed.</span>
          </>
        ),
        blurb:
          "In-person coaching at Boca HQ. By application — we review every submission and follow up directly.",
        cta: "Submit Application",
        mode: "application",
      };
    default:
      return {
        eyebrow: "First Week Free",
        title: (
          <>
            Step Into <span style={{ color: "var(--crimson)" }}>The Standard.</span>
          </>
        ),
        blurb:
          "Start your first week of The New Standard. No credit card required.",
        cta: "Begin First Week",
        mode: "trial",
      };
  }
}

const inputClass =
  "w-full px-4 py-3 text-sm bg-transparent border outline-none transition-colors focus:border-soft-white/60";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.3em] mb-2";

export default function StepInForm({ tier }: { tier: TierKey }) {
  const meta = tierMeta(tier);
  const isApplication = meta.mode === "application";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [trainingHistory, setTrainingHistory] = useState("");
  const [goals, setGoals] = useState("");
  const [whyNow, setWhyNow] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isApplication) {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: "immersed",
            name,
            email,
            phone,
            location,
            training_history: trainingHistory,
            goals,
            why_now: whyNow,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }
        setSuccess(true);
      } else {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }
        setSuccess(true);
        setTimeout(() => {
          window.location.href = data.redirect;
        }, 2000);
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col bg-near-black text-soft-white">
      {/* Subtle backdrop wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(143,0,0,0.10) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <Link
          href="/"
          aria-label="Back to home"
          className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-soft-white/50 hover:text-soft-white transition-colors"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-1">
            ←
          </span>
          <span className="hidden sm:inline">Back</span>
        </Link>
        <Link href="/" aria-label="Bad Girl Strength Club">
          <Image
            src="/images/primary-logo.svg"
            alt="BGSC"
            width={160}
            height={48}
            className="h-9 md:h-10 w-auto select-none"
            priority
          />
        </Link>
        <div className="w-[60px]" aria-hidden />
      </header>

      {/* Content */}
      <section className="relative z-10 flex-1 flex items-start md:items-center justify-center px-5 pb-20 md:py-16">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Header */}
                <p
                  className="text-[10px] md:text-xs font-bold uppercase tracking-[0.35em] text-crimson mb-4"
                  style={{ fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}
                >
                  {meta.eyebrow}
                </p>
                <h1
                  className="font-black uppercase leading-[1.05] tracking-tight mb-4"
                  style={{
                    fontFamily: "var(--font-display, 'Poppins', sans-serif)",
                    fontSize: "clamp(2rem, 5vw, 3rem)",
                  }}
                >
                  {meta.title}
                </h1>
                <p className="text-sm md:text-base text-ash leading-relaxed mb-8">
                  {meta.blurb}
                </p>

                {/* Form card */}
                <form
                  onSubmit={handleSubmit}
                  className="p-6 md:p-8 space-y-5"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      style={{ borderColor: "var(--border)" }}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      style={{ borderColor: "var(--border)" }}
                      placeholder="you@email.com"
                    />
                  </div>

                  {!isApplication && (
                    <div>
                      <label htmlFor="password" className={labelClass}>
                        Password *
                      </label>
                      <input
                        id="password"
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                        style={{ borderColor: "var(--border)" }}
                        placeholder="Min. 6 characters"
                      />
                    </div>
                  )}

                  {isApplication && (
                    <>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="phone" className={labelClass}>
                            Phone
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={inputClass}
                            style={{ borderColor: "var(--border)" }}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label htmlFor="location" className={labelClass}>
                            Location
                          </label>
                          <input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={inputClass}
                            style={{ borderColor: "var(--border)" }}
                            placeholder="City, State"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="training" className={labelClass}>
                          Training Background
                        </label>
                        <textarea
                          id="training"
                          rows={3}
                          value={trainingHistory}
                          onChange={(e) => setTrainingHistory(e.target.value)}
                          className={`${inputClass} resize-none`}
                          style={{ borderColor: "var(--border)" }}
                          placeholder="What does your training look like today?"
                        />
                      </div>

                      <div>
                        <label htmlFor="goals" className={labelClass}>
                          Goals
                        </label>
                        <textarea
                          id="goals"
                          rows={3}
                          value={goals}
                          onChange={(e) => setGoals(e.target.value)}
                          className={`${inputClass} resize-none`}
                          style={{ borderColor: "var(--border)" }}
                          placeholder="What are you training for?"
                        />
                      </div>

                      <div>
                        <label htmlFor="why" className={labelClass}>
                          Why Now
                        </label>
                        <textarea
                          id="why"
                          rows={3}
                          value={whyNow}
                          onChange={(e) => setWhyNow(e.target.value)}
                          className={`${inputClass} resize-none`}
                          style={{ borderColor: "var(--border)" }}
                          placeholder="Why are you stepping in now?"
                        />
                      </div>
                    </>
                  )}

                  {error && (
                    <p
                      className="text-xs px-4 py-3"
                      style={{
                        background: "rgba(143,0,0,0.15)",
                        color: "var(--crimson)",
                      }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] uppercase font-bold text-[11px] md:text-xs tracking-[0.25em] bg-soft-white text-near-black hover:bg-ash transition-colors duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ borderRadius: "2px" }}
                  >
                    {loading
                      ? isApplication
                        ? "Submitting…"
                        : "Creating Account…"
                      : meta.cta}
                  </button>

                  <p className="text-[10px] uppercase tracking-[0.3em] text-soft-white/40 text-center pt-1">
                    {isApplication
                      ? "We review every application — expect a reply within a few days."
                      : "No credit card · Cancel anytime"}
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="p-8 md:p-10 text-center"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-12 h-12 mx-auto mb-6 flex items-center justify-center"
                  style={{ background: "var(--crimson)" }}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden>
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="white"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3"
                  style={{ fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}
                >
                  {isApplication ? "Application In." : "You're In."}
                </h2>
                <p className="text-sm text-soft-white/70 leading-relaxed mb-2">
                  {isApplication
                    ? `Thank you, ${name.split(" ")[0] || "athlete"}. We'll review and follow up at ${email}.`
                    : `Welcome to the standard, ${name.split(" ")[0] || "athlete"}.`}
                </p>
                {!isApplication && (
                  <p className="text-xs uppercase tracking-[0.3em] text-soft-white/40">
                    Taking you to the app…
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
