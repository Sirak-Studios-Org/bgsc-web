"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProfileData = {
  user: { id: number; name: string; email: string };
  plan: string;
  streak: { totalXp: number };
};

const PLAN_LABELS: Record<string, string> = {
  club: "Club Member",
  premium: "Premium Member",
  vip: "VIP Member",
  trial: "Trial — 14 Days",
  free: "Free",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "0.3em",
      color: "rgba(255,255,255,0.35)",
      fontFamily: "var(--font-display)",
      marginBottom: 14,
      marginTop: 32,
    }}>
      {children}
    </p>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: checked ? "var(--crimson)" : "var(--surface-2)",
        border: `1px solid ${checked ? "var(--crimson)" : "var(--border)"}`,
        position: "relative",
        cursor: "pointer",
        padding: 0,
        transition: "background 0.15s",
        flexShrink: 0,
      }}
      aria-pressed={checked}
    >
      <span style={{
        position: "absolute",
        top: 3,
        left: checked ? 20 : 3,
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.15s",
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  const [notifyLessons, setNotifyLessons] = useState(true);
  const [notifyStreak, setNotifyStreak] = useState(true);
  const [notifyCommunity, setNotifyCommunity] = useState(false);

  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/portal/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.user?.name ?? "");
        setLoading(false);
      });
  }, []);

  async function saveName() {
    if (!name.trim()) { setNameError("Name cannot be empty"); return; }
    setNameSaving(true);
    setNameError("");
    const res = await fetch("/api/portal/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile((prev) => prev ? { ...prev, user: data.user } : prev);
      setNameEditing(false);
    } else {
      setNameError("Failed to save");
    }
    setNameSaving(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwNew !== pwConfirm) { setPwMessage("Passwords do not match"); return; }
    if (pwNew.length < 8) { setPwMessage("Password must be at least 8 characters"); return; }
    setPwSaving(true);
    setPwMessage("");
    const res = await fetch("/api/portal/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
    });
    if (res.ok) {
      setPwMessage("Password updated successfully.");
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } else {
      const data = await res.json().catch(() => ({}));
      setPwMessage(data.error ?? "Failed to update password");
    }
    setPwSaving(false);
  }

  async function openStripePortal() {
    setPortalLoading(true);
    const res = await fetch("/api/portal/subscription/portal", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      window.location.href = data.url;
    } else {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px" }}>
        <p style={{ color: "var(--ash)", fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Link href="/portal/profile" style={{ color: "var(--ash)", fontSize: 20, textDecoration: "none" }}>←</Link>
        <h1 style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
          Settings
        </h1>
      </div>

      <SectionTitle>Account</SectionTitle>
      <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", padding: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ash)", fontFamily: "var(--font-display)", marginBottom: 6 }}>
            Name
          </p>
          {nameEditing ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setNameEditing(false); }}
                autoFocus
                style={{
                  flex: 1,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--soft-white)",
                  padding: "7px 10px",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                onClick={saveName}
                disabled={nameSaving}
                style={{
                  background: "var(--crimson)",
                  border: "none",
                  color: "#fff",
                  padding: "7px 14px",
                  fontFamily: "var(--font-display)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  opacity: nameSaving ? 0.6 : 1,
                }}
              >
                Save
              </button>
              <button
                onClick={() => { setNameEditing(false); setName(profile?.user.name ?? ""); }}
                style={{ background: "none", border: "1px solid var(--border)", color: "var(--ash)", padding: "7px 12px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: "var(--soft-white)" }}>{profile?.user.name}</span>
              <button
                onClick={() => setNameEditing(true)}
                style={{ background: "none", border: "none", color: "var(--crimson)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                Edit
              </button>
            </div>
          )}
          {nameError && <p style={{ fontSize: 11, color: "var(--crimson)", marginTop: 4 }}>{nameError}</p>}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ash)", fontFamily: "var(--font-display)", marginBottom: 6 }}>
            Email
          </p>
          <span style={{ fontSize: 14, color: "var(--ash)" }}>{profile?.user.email}</span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>Email cannot be changed here. Contact support.</p>
        </div>
      </div>

      <SectionTitle>Change Password</SectionTitle>
      <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", padding: 16 }}>
        <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Current Password", value: pwCurrent, onChange: setPwCurrent },
            { label: "New Password", value: pwNew, onChange: setPwNew },
            { label: "Confirm New Password", value: pwConfirm, onChange: setPwConfirm },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ash)", fontFamily: "var(--font-display)", marginBottom: 5 }}>
                {label}
              </label>
              <input
                type="password"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--soft-white)",
                  padding: "8px 10px",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          ))}
          {pwMessage && (
            <p style={{ fontSize: 12, color: pwMessage.includes("success") ? "var(--ash)" : "var(--crimson)" }}>
              {pwMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
            style={{
              padding: "9px 0",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--soft-white)",
              fontFamily: "var(--font-display)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: "pointer",
              opacity: pwSaving || !pwCurrent || !pwNew || !pwConfirm ? 0.5 : 1,
            }}
          >
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <SectionTitle>Subscription</SectionTitle>
      <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 14, color: "var(--soft-white)", fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {PLAN_LABELS[profile?.plan ?? "free"] ?? profile?.plan}
            </p>
            <p style={{ fontSize: 11, color: "var(--ash)", marginTop: 3 }}>
              Active membership
            </p>
          </div>
          <span style={{
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            padding: "3px 8px",
            background: "rgba(143,0,0,0.15)",
            color: "var(--crimson)",
            border: "1px solid var(--crimson)",
            fontFamily: "var(--font-display)",
          }}>
            Active
          </span>
        </div>
        <button
          onClick={openStripePortal}
          disabled={portalLoading}
          style={{
            width: "100%",
            padding: "10px 0",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--soft-white)",
            fontFamily: "var(--font-display)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            cursor: "pointer",
            opacity: portalLoading ? 0.6 : 1,
          }}
        >
          {portalLoading ? "Opening..." : "Manage Subscription →"}
        </button>
      </div>

      <SectionTitle>Notifications</SectionTitle>
      <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        {[
          { label: "New lessons available", sub: "Get notified when new content drops", value: notifyLessons, onChange: setNotifyLessons },
          { label: "Streak reminders", sub: "Daily nudge to keep your streak alive", value: notifyStreak, onChange: setNotifyStreak },
          { label: "Community activity", sub: "Replies and reactions to your posts", value: notifyCommunity, onChange: setNotifyCommunity },
        ].map(({ label, sub, value, onChange }, i) => (
          <div key={label} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: i < 2 ? "1px solid var(--border)" : "none",
          }}>
            <div>
              <p style={{ fontSize: 13, color: "var(--soft-white)" }}>{label}</p>
              <p style={{ fontSize: 11, color: "var(--ash)", marginTop: 2 }}>{sub}</p>
            </div>
            <Toggle checked={value} onChange={onChange} />
          </div>
        ))}
      </div>

      <SectionTitle>Danger Zone</SectionTitle>
      <div style={{ background: "var(--surface-1)", border: "1px solid rgba(143,0,0,0.3)", padding: 16 }}>
        <p style={{ fontSize: 13, color: "var(--ash)", marginBottom: 14 }}>
          Cancelling your membership will stop future charges. You&apos;ll retain access until the end of your billing period.
        </p>
        <Link
          href="/portal/cancel"
          style={{
            display: "block",
            textAlign: "center",
            padding: "10px 0",
            border: "1px solid rgba(143,0,0,0.5)",
            color: "var(--crimson)",
            fontFamily: "var(--font-display)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            textDecoration: "none",
          }}
        >
          Cancel Membership
        </Link>
      </div>
    </div>
  );
}
