export default function OfflinePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ textAlign: "center", maxWidth: "380px" }}>
        <p style={{ fontSize: "48px", marginBottom: "16px" }}>📶</p>
        <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#F5F5F3", fontFamily: "var(--font-display)", marginBottom: "12px", letterSpacing: "-0.02em" }}>
          You&apos;re offline
        </h1>
        <p style={{ fontSize: "14px", color: "#BFBFBF", lineHeight: 1.7, margin: 0 }}>
          Check your connection to continue your workout. Your streak and progress will sync when you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
