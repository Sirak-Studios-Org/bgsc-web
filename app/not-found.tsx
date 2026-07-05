import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 900, color: "var(--crimson, #8F0000)", lineHeight: 1 }}>404</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900, color: "var(--soft-white, #fff)" }}>
        This page doesn’t exist.
      </h1>
      <p style={{ color: "var(--ash, #999)", maxWidth: 380, fontSize: 14 }}>
        The link may be broken or the page may have moved.
      </p>
      <Link
        href="/"
        style={{ marginTop: 8, padding: "12px 28px", fontFamily: "var(--font-display)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 900, background: "var(--crimson, #8F0000)", color: "#fff", textDecoration: "none" }}
      >
        Back Home
      </Link>
    </div>
  );
}
