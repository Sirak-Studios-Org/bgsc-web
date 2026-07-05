"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, color: "var(--soft-white, #fff)" }}>
        Something broke.
      </h1>
      <p style={{ color: "var(--ash, #999)", maxWidth: 420, fontSize: 14 }}>
        This one’s on us, not you. Try again — if it keeps happening, reach out to support.
      </p>
      <button
        onClick={reset}
        style={{ marginTop: 8, padding: "12px 28px", fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 900, background: "var(--crimson, #8F0000)", color: "#fff", border: "none", cursor: "pointer" }}
      >
        Try Again
      </button>
    </div>
  );
}
