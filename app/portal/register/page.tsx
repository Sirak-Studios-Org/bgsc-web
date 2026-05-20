"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function RegisterHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) { setStatus("error"); return; }

    fetch("/api/portal/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) router.push("/portal/onboarding");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [params, router]);

  return (
    <>
      {status === "loading" ? (
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full mx-auto mb-4 animate-spin"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--crimson)" }} />
          <p style={{ color: "var(--ash)" }}>Setting up your membership...</p>
        </div>
      ) : (
        <div className="text-center max-w-sm">
          <p className="text-lg mb-4" style={{ color: "var(--soft-white)" }}>Something went wrong.</p>
          <p className="text-sm mb-6" style={{ color: "var(--ash)" }}>Please contact support at stephanie.a.bruno@gmail.com</p>
          <a href="/" style={{ color: "var(--crimson)" }} className="text-sm uppercase tracking-widest">← Back to home</a>
        </div>
      )}
    </>
  );
}

export default function PortalRegister() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--near-black)" }}>
      <Image src="/images/primary-logo.svg" alt="BGSC" width={120} height={40} className="mx-auto mb-8 h-10 w-auto" />
      <Suspense fallback={
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full mx-auto mb-4 animate-spin"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--crimson)" }} />
          <p style={{ color: "var(--ash)" }}>Setting up your membership...</p>
        </div>
      }>
        <RegisterHandler />
      </Suspense>
    </div>
  );
}
