"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Reason = "expensive" | "time" | "goals" | "technical" | "unexpected" | "other";
type Offer = "pause" | "discount" | "extend";
type Step = "survey" | "offer" | "confirm" | "confirmed";

const REASONS: { id: Reason; icon: string; label: string }[] = [
  { id: "expensive", icon: "💰", label: "Too expensive" },
  { id: "time", icon: "⏰", label: "Not enough time" },
  { id: "goals", icon: "🎯", label: "Already reached my goals" },
  { id: "technical", icon: "💻", label: "Technical issues" },
  { id: "unexpected", icon: "😕", label: "Not what I expected" },
  { id: "other", icon: "✏️", label: "Other" },
];

function getOffer(reason: Reason): { offer: Offer | null; headline: string; body: string; cta: string } {
  switch (reason) {
    case "expensive":
      return {
        offer: "pause",
        headline: "How about a free 30-day pause?",
        body: "Take a break without losing your progress, streak history, or community access. No charge. Resume whenever you're ready.",
        cta: "Pause my membership for free",
      };
    case "time":
      return {
        offer: "discount",
        headline: "50% off for 2 months — come back when you're ready",
        body: "Life gets busy. Stay in the club at half the price for 2 months, then decide. Use code COMEBACK50.",
        cta: "Apply 50% off discount",
      };
    case "goals":
      return {
        offer: null,
        headline: "You've come so far. Here's what you'd lose.",
        body: "Your streak, your badges, your community connections — gone the moment you cancel. BGSC members who stay hit bigger goals because the journey never really ends.",
        cta: "Keep my membership",
      };
    case "technical":
      return {
        offer: null,
        headline: "Let's fix it together",
        body: "Coach Stephie's team responds within 24 hours. Before you leave, let us make it right.",
        cta: "Email support",
      };
    case "unexpected":
      return {
        offer: "extend",
        headline: "7 more days on us — no charge",
        body: "Explore the full library, join a community challenge, and check in with Coach Stephie's weekly live. Give it one more real shot.",
        cta: "Activate my 7-day extension",
      };
    default:
      return {
        offer: "pause",
        headline: "We'd hate to see you go",
        body: "You can pause for 30 days free, get 50% off for 2 months, or take 7 more days to explore. What would help?",
        cta: "Pause my membership for free",
      };
  }
}

export default function CancelPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("survey");
  const [reason, setReason] = useState<Reason | null>(null);
  const [otherText, setOtherText] = useState("");
  const [loading, setLoading] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const offerConfig = reason ? getOffer(reason) : null;

  async function handleAcceptOffer() {
    if (!reason || !offerConfig?.offer) {
      if (reason === "technical") {
        window.location.href = "mailto:support@badgirlstrength.club?subject=Technical%20Issue";
        return;
      }
      router.push("/portal");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, offer: offerConfig.offer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setEffectiveDate(data.effectiveDate);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCancel() {
    if (!reason) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason === "other" ? otherText || "other" : reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setEffectiveDate(data.effectiveDate);
      setStep("confirmed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--near-black)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 16px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>

        {step === "survey" && (
          <>
            <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--crimson)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>
              Membership
            </p>
            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--soft-white)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>
              Before you go…
            </h1>
            <p style={{ fontSize: "14px", color: "var(--ash)", marginBottom: "32px", lineHeight: 1.6 }}>
              Help us understand why — we might be able to make it right.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {REASONS.map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => setReason(id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "14px 16px",
                    background: reason === id ? "rgba(143,0,0,0.15)" : "var(--surface-1)",
                    border: `1px solid ${reason === id ? "var(--crimson)" : "var(--border)"}`,
                    color: "var(--soft-white)", fontSize: "14px", textAlign: "left",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {reason === "other" && (
              <textarea
                placeholder="Tell us more…"
                value={otherText}
                onChange={e => setOtherText(e.target.value)}
                rows={3}
                style={{
                  width: "100%", padding: "12px", marginBottom: "16px",
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  color: "var(--soft-white)", fontSize: "14px", resize: "none",
                  fontFamily: "inherit",
                }}
              />
            )}

            <button
              onClick={() => reason && setStep("offer")}
              disabled={!reason}
              style={{
                width: "100%", padding: "14px",
                background: reason ? "var(--crimson)" : "var(--border)",
                color: reason ? "white" : "var(--ash)",
                fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase",
                fontFamily: "var(--font-display)", fontWeight: 900,
                border: "none", cursor: reason ? "pointer" : "not-allowed",
              }}
            >
              Continue
            </button>

            <button
              onClick={() => router.push("/portal")}
              style={{
                width: "100%", padding: "12px", marginTop: "8px",
                background: "transparent", border: "none",
                color: "var(--ash)", fontSize: "13px", cursor: "pointer",
              }}
            >
              Never mind, take me back
            </button>
          </>
        )}

        {step === "offer" && offerConfig && reason && (
          <>
            {reason === "goals" && (
              <div style={{ padding: "16px", background: "rgba(143,0,0,0.1)", border: "1px solid var(--crimson)", marginBottom: "24px" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--crimson)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>
                  What you'd lose
                </p>
                <ul style={{ color: "var(--ash)", fontSize: "13px", lineHeight: 2, paddingLeft: "16px", margin: 0 }}>
                  <li>Your workout streak history</li>
                  <li>All earned badges and XP</li>
                  <li>Access to your community</li>
                  <li>Coach Stephie's weekly challenges</li>
                </ul>
              </div>
            )}

            <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--crimson)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>
              A message from Coach Stephie
            </p>
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "var(--soft-white)", fontFamily: "var(--font-display)", marginBottom: "12px", lineHeight: 1.2 }}>
              {offerConfig.headline}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--ash)", marginBottom: "32px", lineHeight: 1.7 }}>
              {offerConfig.body}
            </p>

            {error && (
              <p style={{ color: "#e40000", fontSize: "13px", marginBottom: "16px" }}>{error}</p>
            )}

            <button
              onClick={handleAcceptOffer}
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: "var(--crimson)", color: "white",
                fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase",
                fontFamily: "var(--font-display)", fontWeight: 900,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Applying…" : offerConfig.cta}
            </button>

            <button
              onClick={() => setStep("confirm")}
              style={{
                width: "100%", padding: "12px", marginTop: "8px",
                background: "transparent", border: "none",
                color: "rgba(255,255,255,0.3)", fontSize: "12px", cursor: "pointer",
              }}
            >
              No thanks, I still want to cancel
            </button>
          </>
        )}

        {step === "confirm" && offerConfig?.offer && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "var(--soft-white)", fontFamily: "var(--font-display)", marginBottom: "12px" }}>
              {offerConfig.offer === "pause" && "Your membership is paused"}
              {offerConfig.offer === "discount" && "Discount applied!"}
              {offerConfig.offer === "extend" && "7 days added to your account"}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--ash)", marginBottom: "32px", lineHeight: 1.7 }}>
              {offerConfig.offer === "pause" && "You'll have full access again in 30 days — automatically, no action needed."}
              {offerConfig.offer === "discount" && "Your next 2 billing cycles are 50% off. We'll see you in the gym."}
              {offerConfig.offer === "extend" && "7 free days have been added. Explore everything, then decide."}
            </p>
            <button
              onClick={() => router.push("/portal")}
              style={{
                padding: "14px 32px", background: "var(--crimson)", color: "white",
                fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase",
                fontFamily: "var(--font-display)", fontWeight: 900,
                border: "none", cursor: "pointer",
              }}
            >
              Back to my portal
            </button>
          </div>
        )}

        {step === "confirm" && !offerConfig?.offer && (
          <>
            <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>
              Final step
            </p>
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "var(--soft-white)", fontFamily: "var(--font-display)", marginBottom: "12px" }}>
              Are you sure?
            </h2>
            <p style={{ fontSize: "14px", color: "var(--ash)", marginBottom: "12px", lineHeight: 1.7 }}>
              Coach Stephie will miss you. Once cancelled, your access ends at the close of your current billing period.
            </p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "32px" }}>
              You can resubscribe any time and pick up where you left off.
            </p>

            {error && (
              <p style={{ color: "#e40000", fontSize: "13px", marginBottom: "16px" }}>{error}</p>
            )}

            <button
              onClick={handleConfirmCancel}
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.4)",
                fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase",
                fontFamily: "var(--font-display)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                marginBottom: "8px",
              }}
            >
              {loading ? "Cancelling…" : "Yes, cancel my membership"}
            </button>

            <button
              onClick={() => router.push("/portal")}
              style={{
                width: "100%", padding: "14px",
                background: "var(--crimson)", color: "white",
                fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase",
                fontFamily: "var(--font-display)", fontWeight: 900,
                border: "none", cursor: "pointer",
              }}
            >
              Keep my membership
            </button>
          </>
        )}

        {step === "confirmed" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--ash)", fontFamily: "var(--font-display)", marginBottom: "24px" }}>
              Membership cancelled
            </p>
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "var(--soft-white)", fontFamily: "var(--font-display)", marginBottom: "12px" }}>
              We're sad to see you go
            </h2>
            {effectiveDate && (
              <p style={{ fontSize: "14px", color: "var(--ash)", marginBottom: "8px" }}>
                You have access until{" "}
                <strong style={{ color: "var(--soft-white)" }}>
                  {new Date(effectiveDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </strong>
                .
              </p>
            )}
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "32px" }}>
              Change your mind? Resubscribe any time — your history will be waiting.
            </p>
            <button
              onClick={() => router.push("/portal")}
              style={{
                padding: "14px 32px", background: "var(--surface-1)",
                border: "1px solid var(--border)", color: "var(--soft-white)",
                fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase",
                fontFamily: "var(--font-display)",
                cursor: "pointer",
              }}
            >
              Back to portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
