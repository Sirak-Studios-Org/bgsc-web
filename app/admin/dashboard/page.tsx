"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import AdminShell from "@/components/admin/AdminShell";

type Analytics = {
  members: { total: number; active: number; expired: number; today: number };
  events7d: { pageviews: number; ctaClicks: number; videoPlays: number; signups: number; conversionRate: string };
  dailyViews: { day: string; views: number }[];
  eventBreakdown: { type: string; n: number }[];
  topReferrers: { referrer: string; n: number }[];
};

function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
      <p className="text-3xl font-black mb-1" style={{ fontFamily: "var(--font-display)", color: accent ? "var(--crimson)" : "#fff" }}>
        {value}
      </p>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-display)" }}>
        {label}
      </p>
      {sub && <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError(true));
  }, [router]);

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {error && (
          <div className="mb-8 px-4 py-3 text-sm" style={{ background: "rgba(143,0,0,0.15)", color: "var(--crimson)", border: "1px solid var(--crimson)" }}>
            Could not load analytics. Please refresh, or check the database connection.
          </div>
        )}

        {/* Members row */}
        <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Members</p>
        <div className="grid grid-cols-2 gap-3 mb-10">
          <Stat label="Total Signups" value={data?.members.total ?? "—"} />
          <Stat label="Active Trials" value={data?.members.active ?? "—"} accent />
          <Stat label="Expired" value={data?.members.expired ?? "—"} />
          <Stat label="Joined Today" value={data?.members.today ?? "—"} accent />
        </div>

        {/* Events row (7d) */}
        <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Last 7 Days</p>
        <div className="grid grid-cols-2 gap-3 mb-10">
          <Stat label="Page Views" value={data?.events7d.pageviews ?? "—"} />
          <Stat label="CTA Clicks" value={data?.events7d.ctaClicks ?? "—"} accent />
          <Stat label="Video Plays" value={data?.events7d.videoPlays ?? "—"} />
          <Stat label="Conversion Rate" value={data ? `${data.events7d.conversionRate}%` : "—"} accent />
        </div>

        {/* Chart */}
        <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Page Views — Last 30 Days</p>
        <div className="mb-10 p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          {data?.dailyViews && data.dailyViews.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.dailyViews}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 12 }} />
                <Line type="monotone" dataKey="views" stroke="#C40000" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>No pageview data yet. Add the tracking snippet to your site.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Top referrers */}
          <div className="p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-[0.3em] mb-5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Top Referrers (30d)</p>
            {data?.topReferrers && data.topReferrers.length > 0 ? (
              <div className="space-y-3">
                {data.topReferrers.map(r => (
                  <div key={r.referrer} className="flex justify-between items-center">
                    <span className="text-xs truncate max-w-[70%]" style={{ color: "rgba(255,255,255,0.7)" }}>{r.referrer}</span>
                    <span className="text-xs font-bold" style={{ color: "var(--crimson)" }}>{r.n}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>No referrer data yet.</p>
            )}
          </div>

          {/* Event breakdown */}
          <div className="p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-[0.3em] mb-5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Events by Type (30d)</p>
            {data?.eventBreakdown && data.eventBreakdown.length > 0 ? (
              <div className="space-y-3">
                {data.eventBreakdown.map(e => (
                  <div key={e.type} className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>{e.type.replace(/_/g, " ")}</span>
                    <span className="text-xs font-bold" style={{ color: "var(--crimson)" }}>{e.n}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>No events tracked yet.</p>
            )}
          </div>
        </div>

        {/* PostHog embed placeholder */}
        <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>PostHog Analytics</p>
        <div className="p-8 text-center" style={{ background: "var(--surface-1)", border: "1px dashed var(--border)" }}>
          <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Add your PostHog key in Settings to enable full session analytics.</p>
          <a href="https://app.posthog.com" target="_blank" rel="noopener noreferrer"
            className="text-xs uppercase tracking-widest" style={{ color: "var(--crimson)" }}>
            Open PostHog →
          </a>
        </div>
      </div>
    </AdminShell>
  );
}
