"use client";

import { useState } from "react";
import Image from "next/image";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      // Hard navigation (not router.push): a soft nav preserves Next's client
      // Router Cache, which can hold a middleware auth-redirect fetched while
      // logged out; a full load wipes it so the new session is honored.
      window.location.assign("/admin/dashboard");
      return;
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--near-black)" }}>
      <div className="w-full max-w-sm">

        <div className="flex justify-center mb-10">
          <Image src="/logo.svg" alt="BGSC" width={200} height={68} className="w-48 h-auto" />
        </div>

        <p className="text-xs tracking-[0.3em] uppercase text-center mb-8"
          style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>
          Admin Access
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-display)" }}>
              Email
            </label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-transparent border outline-none"
              style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }}
              placeholder="admin@badgirlstrengthclub.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-display)" }}>
              Password
            </label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-transparent border outline-none"
              style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs py-3 px-4" style={{ background: "rgba(143,0,0,0.15)", color: "var(--crimson)", fontFamily: "var(--font-body)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}>
            {loading ? "Signing in..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
