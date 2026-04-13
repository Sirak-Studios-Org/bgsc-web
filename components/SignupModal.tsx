"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "form" | "success";

export default function SignupModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setStep("form");
    setName(""); setEmail(""); setPassword(""); setError("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep("success");
      // Redirect after brief success moment
      setTimeout(() => {
        window.location.href = data.redirect;
      }, 2200);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={step === "form" ? reset : undefined}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="w-full max-w-md p-8 md:p-10 relative"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>

              {/* Close */}
              {step === "form" && (
                <button onClick={reset}
                  className="absolute top-4 right-5 text-lg leading-none hover:opacity-60 transition-opacity cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.4)" }}>✕</button>
              )}

              <AnimatePresence mode="wait">
                {step === "form" && (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                    <div className="flex justify-center mb-7">
                      <Image src="/images/bgsc-logo.png" alt="BGSC" width={140} height={48} className="w-28 h-auto select-none pointer-events-none" />
                    </div>

                    <h2 className="text-xl md:text-2xl font-black uppercase leading-tight text-center mb-2"
                      style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
                      Start Your <span style={{ color: "var(--crimson)" }}>7-Day Trial</span>
                    </h2>
                    <p className="text-xs text-center mb-7"
                      style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)" }}>
                      No credit card required &nbsp;·&nbsp; Cancel anytime
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest mb-1.5"
                          style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>Full Name *</label>
                        <input type="text" required value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-transparent border outline-none"
                          style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }}
                          placeholder="Your name" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest mb-1.5"
                          style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>Email *</label>
                        <input type="email" required value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-transparent border outline-none"
                          style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }}
                          placeholder="you@email.com" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest mb-1.5"
                          style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>Password *</label>
                        <input type="password" required value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-transparent border outline-none"
                          style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }}
                          placeholder="Min. 6 characters" minLength={6} />
                      </div>

                      {error && (
                        <p className="text-xs px-4 py-3"
                          style={{ background: "rgba(143,0,0,0.15)", color: "var(--crimson)", fontFamily: "var(--font-body)" }}>
                          {error}
                        </p>
                      )}

                      <button type="submit" disabled={loading}
                        className="w-full py-4 text-xs font-bold uppercase cursor-pointer bg-soft-white text-black hover:bg-soft-white/90 transition-all duration-300">
                        {loading ? "Creating Account..." : "Start Free Trial"}
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div key="success"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="py-8 text-center">
                    <div className="flex justify-center mb-6">
                      <Image src="/images/bgsc-logo.png" alt="BGSC" width={140} height={48} className="w-28 h-auto" />
                    </div>
                    <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center"
                      style={{ background: "var(--crimson)" }}>
                      <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h2 className="text-2xl font-black uppercase mb-3"
                      style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
                      You&apos;re In.
                    </h2>
                    <p className="text-sm mb-2"
                      style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>
                      Welcome to the standard, {name.split(" ")[0]}.
                    </p>
                    <p className="text-xs"
                      style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>
                      Taking you to the app...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
