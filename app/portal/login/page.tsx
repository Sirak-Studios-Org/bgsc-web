"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/portal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed"); return; }
      // Only allow same-site relative paths (block //evil.com and absolute URLs).
      const raw = params.get("next") ?? "/portal";
      const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/portal";
      const dest = data.onboardingComplete === false ? "/portal/onboarding" : next;
      // Hard navigation (not router.push): a soft nav preserves Next's client
      // Router Cache, which can hold a middleware auth-redirect fetched while
      // logged out — replaying it would bounce every tab back to login. A full
      // load wipes that cache so post-login navigation carries the session.
      window.location.assign(dest);
      return;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Image src="/images/primary-logo.svg" alt="BGSC" width={120} height={40} className="mx-auto mb-6 h-10 w-auto" />
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
          Members Login
        </h1>
        <p className="text-sm" style={{ color: "var(--ash)" }}>Welcome back, Bad Girl 🔥</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--ash)" }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-3 text-sm rounded-none outline-none"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)", color: "var(--soft-white)" }}
            placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--ash)" }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full px-4 py-3 text-sm rounded-none outline-none"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)", color: "var(--soft-white)" }}
            placeholder="••••••••" />
        </div>

        {error && (
          <p className="text-sm px-3 py-2" style={{ background: "rgba(143,0,0,0.15)", color: "var(--crimson)", border: "1px solid var(--crimson)" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-4 text-sm uppercase tracking-widest font-black transition-opacity"
          style={{ fontFamily: "var(--font-display)", background: "var(--crimson)", color: "#fff", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-xs mt-8" style={{ color: "var(--ash)" }}>
        Not a member yet?{" "}
        <Link href="/#pricing" className="underline" style={{ color: "var(--soft-white)" }}>Join BGSC</Link>
      </p>
    </div>
  );
}

export default function PortalLogin() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--near-black)" }}>
      <Suspense fallback={
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--crimson)" }} />
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
