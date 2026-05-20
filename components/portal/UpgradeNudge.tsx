"use client";

import { useState, useEffect } from "react";

const DISMISS_KEY = "bgsc_upgrade_nudge_dismissed";
const DISMISS_DAYS = 7;

interface UpgradeNudgeProps {
  memberSince: string;
}

export default function UpgradeNudge({ memberSince }: UpgradeNudgeProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const daysSinceJoin = (Date.now() - new Date(memberSince).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceJoin < 45) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }

    setVisible(true);
  }, [memberSince]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  async function upgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/subscription/upgrade-annual", { method: "POST" });
      if (res.ok) {
        setDone(true);
        setTimeout(() => setVisible(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!visible) return null;

  if (done) {
    return (
      <div style={{
        padding: "14px 16px",
        background: "rgba(143,0,0,0.15)",
        border: "1px solid var(--crimson)",
        display: "flex", alignItems: "center", gap: "12px",
        marginBottom: "16px",
      }}>
        <span style={{ fontSize: "18px" }}>✅</span>
        <span style={{ fontSize: "13px", color: "var(--soft-white)" }}>
          Switched to annual billing — you&apos;re saving 2 months!
        </span>
      </div>
    );
  }

  return (
    <div style={{
      padding: "14px 16px",
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
      marginBottom: "16px", flexWrap: "wrap",
    }}>
      <p style={{ margin: 0, fontSize: "13px", color: "var(--soft-white)", flex: 1 }}>
        🎉 Switch to annual billing and <strong>save 2 months free</strong>
      </p>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          onClick={upgrade}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "var(--crimson)", color: "white",
            fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
            fontFamily: "var(--font-display)", fontWeight: 900,
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "…" : "Switch to Annual"}
        </button>
        <button
          onClick={dismiss}
          style={{
            padding: "8px 10px",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--ash)", fontSize: "12px", cursor: "pointer",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
