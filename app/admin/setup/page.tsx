"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminSetup() {
  const router = useRouter();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/setup")
      .then(r => r.json())
      .then(d => setNeedsSetup(d.needsSetup));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, secret }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Setup failed."); return; }
    router.push("/admin");
  }

  if (needsSetup === null) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--near-black)", color: "#fff" }}>
      <Image src="/images/primary-logo.svg" alt="BGSC" width={100} height={34} className="mx-auto mb-8 h-9 w-auto" />

      {!needsSetup ? (
        <div className="text-center max-w-sm">
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            Admin account is already configured.
          </p>
          <a href="/admin" className="text-xs uppercase tracking-widest" style={{ color: "var(--crimson)" }}>
            Go to login →
          </a>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-black mb-2 text-center" style={{ fontFamily: "var(--font-display)" }}>
            Admin Setup
          </h1>
          <p className="text-xs text-center mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
            Create the first admin account. This page is only available once.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.4)" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 text-sm rounded-none outline-none"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border)", color: "#fff" }} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.4)" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                className="w-full px-4 py-3 text-sm rounded-none outline-none"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border)", color: "#fff" }}
                placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.4)" }}>
                Setup Secret <span style={{ color: "rgba(255,255,255,0.25)" }}>(from ADMIN_SETUP_SECRET env var)</span>
              </label>
              <input type="password" value={secret} onChange={e => setSecret(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-none outline-none"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border)", color: "#fff" }}
                placeholder="Leave blank if not configured" />
            </div>

            {error && (
              <p className="text-sm px-3 py-2" style={{ background: "rgba(143,0,0,0.15)", color: "var(--crimson)", border: "1px solid var(--crimson)" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 text-sm uppercase tracking-widest font-black transition-opacity"
              style={{ fontFamily: "var(--font-display)", background: "var(--crimson)", color: "#fff", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Creating…" : "Create Admin Account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
