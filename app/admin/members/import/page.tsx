"use client";

import { useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

type ImportResult = { created: number; skipped: number; errors: string[] };

export default function MemberImportPage() {
  const [csv, setCsv] = useState("");
  const [trialDays, setTrialDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    const res = await fetch("/api/admin/members/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv, trialDays: parseInt(trialDays, 10) }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Import failed."); return; }
    setResult(data);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCsv(ev.target?.result as string ?? "");
    reader.readAsText(file);
  }

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/members"
            className="text-xs uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
            ← Members
          </Link>
          <p className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
            Import Members
          </p>
        </div>

        {/* Format guide */}
        <div className="mb-8 p-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>
            CSV Format
          </p>
          <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            Required column: <code style={{ color: "#fff" }}>email</code>.
            Optional: <code style={{ color: "#fff" }}>name</code>, <code style={{ color: "#fff" }}>trial_end</code> (YYYY-MM-DD),
            <code style={{ color: "#fff" }}> is_active</code> (true/false), <code style={{ color: "#fff" }}>password_hash</code>.
          </p>
          <pre className="text-xs p-3 overflow-x-auto" style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
{`email,name,trial_end,is_active
jane@example.com,Jane Doe,2025-12-31,true
sarah@example.com,Sarah Smith,,true`}
          </pre>
          <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            Members without a password will get a temporary password: <strong style={{ color: "#fff" }}>ChangeMe2024!</strong> — email them to reset.
          </p>
        </div>

        <form onSubmit={handleImport} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.4)" }}>
              Upload CSV File
            </label>
            <input type="file" accept=".csv,text/csv" onChange={handleFile}
              className="w-full text-sm" style={{ color: "rgba(255,255,255,0.6)" }} />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.4)" }}>
              Or Paste CSV
            </label>
            <textarea value={csv} onChange={e => setCsv(e.target.value)} rows={8}
              placeholder="email,name,trial_end&#10;jane@example.com,Jane Doe,2025-12-31"
              className="w-full px-3 py-2.5 text-sm bg-transparent border outline-none resize-y font-mono"
              style={{ borderColor: "var(--border)", color: "#fff" }} />
          </div>

          <div className="w-48">
            <label className="block text-xs uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.4)" }}>
              Default Trial Days (if no trial_end)
            </label>
            <input type="number" value={trialDays} onChange={e => setTrialDays(e.target.value)} min={1} max={3650}
              className="w-full px-3 py-2.5 text-sm bg-transparent border outline-none"
              style={{ borderColor: "var(--border)", color: "#fff" }} />
          </div>

          {error && (
            <p className="text-sm px-3 py-2" style={{ background: "rgba(143,0,0,0.15)", color: "var(--crimson)", border: "1px solid var(--crimson)" }}>
              {error}
            </p>
          )}

          {result && (
            <div className="p-4 space-y-2" style={{ background: "rgba(0,100,0,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
              <p className="text-sm font-bold" style={{ color: "#4ade80" }}>
                Import complete — {result.created} created / {result.skipped} skipped
              </p>
              {result.errors.length > 0 && (
                <ul className="text-xs space-y-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {result.errors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}
                  {result.errors.length > 20 && <li>…and {result.errors.length - 20} more</li>}
                </ul>
              )}
            </div>
          )}

          <button type="submit" disabled={loading || !csv.trim()}
            className="px-8 py-3 text-xs font-black uppercase tracking-[0.2em] transition-opacity disabled:opacity-40"
            style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}>
            {loading ? "Importing…" : "Import Members"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
