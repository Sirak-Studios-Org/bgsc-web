"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

function BackfillButton() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function run() {
    setStatus("running");
    const res = await fetch("/api/admin/backfill-subscriptions", { method: "POST" });
    const data = await res.json();
    if (res.ok) { setStatus("done"); setMsg(data.message); }
    else { setStatus("error"); setMsg(data.error ?? "Failed."); }
  }

  return (
    <div className="p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
      <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>
        Backfill Member Subscriptions
      </p>
      <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
        Creates a "club" subscription for every member who has no subscription record (e.g. migrated or manually-added members).
      </p>
      <div className="flex items-center gap-4">
        <button onClick={run} disabled={status === "running" || status === "done"}
          className="px-5 py-2 text-xs uppercase tracking-widest font-black transition-opacity disabled:opacity-40"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-display)" }}>
          {status === "running" ? "Running…" : status === "done" ? "Done" : "Run Backfill"}
        </button>
        {msg && <span className="text-xs" style={{ color: status === "error" ? "var(--crimson)" : "#4ade80" }}>{msg}</span>}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [config, setConfig] = useState({ trial_days: "7", cta_url: "", posthog_key: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/config").then(r => r.json()).then(setConfig);
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setMsg(res.ok ? "Saved." : "Failed.");
    setSaving(false);
    setTimeout(() => setMsg(""), 2500);
  }

  function Field({ label, k, desc, type = "text" }: { label: string; k: keyof typeof config; desc?: string; type?: string }) {
    return (
      <div>
        <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>{label}</label>
        {desc && <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{desc}</p>}
        <input type={type} value={config[k]} onChange={e => setConfig(c => ({ ...c, [k]: e.target.value }))}
          className="w-full px-4 py-3 text-sm bg-transparent border outline-none"
          style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }} />
      </div>
    );
  }

  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <p className="text-xs uppercase tracking-[0.3em] mb-6" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Settings</p>
        <form onSubmit={save} className="space-y-6">
          <Field label="Trial Duration (days)" k="trial_days" desc="How many days the free trial lasts." />
          <Field label="CTA URL" k="cta_url" desc="External checkout URL (Kajabi, Thrivecart, etc). Leave blank to use the signup modal." />
          <Field label="PostHog API Key" k="posthog_key" desc="Add your PostHog project API key to enable session analytics and heatmaps." />

          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={saving}
              className="px-8 py-3 text-xs font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}>
              {saving ? "Saving…" : "Save Settings"}
            </button>
            {msg && <span className="text-xs" style={{ color: msg === "Saved." ? "#4ade80" : "var(--crimson)" }}>{msg}</span>}
          </div>
        </form>

        <hr className="my-10" style={{ borderColor: "var(--border)" }} />
        <p className="text-xs uppercase tracking-[0.3em] mb-6" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Maintenance</p>
        <div className="space-y-4">
          <BackfillButton />
        </div>
      </div>
    </AdminShell>
  );
}
