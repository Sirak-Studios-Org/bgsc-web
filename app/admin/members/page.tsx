"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";

type PortalStats = {
  plan: string;
  lessonsCompleted: number;
  currentStreak: number;
  totalXp: number;
  lastActive: string | null;
};

type Member = {
  id: number; name: string; email: string;
  trial_start: string; trial_end: string;
  is_active: number; created_at: string;
  portal_stats?: PortalStats;
};

function trialStatus(end: string) {
  const now = Date.now();
  const endMs = new Date(end + "Z").getTime();
  const diff = endMs - now;
  if (diff <= 0) return { label: "Expired", color: "rgba(255,255,255,0.25)" };
  const days = Math.ceil(diff / 86400000);
  if (days <= 2) return { label: `${days}d left`, color: "#8F0000" };
  return { label: `${days}d left`, color: "rgba(255,255,255,0.7)" };
}

export default function AdminMembers() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ filter, ...(search ? { q: search } : {}) });
    const res = await fetch(`/api/admin/members?${params}`);
    if (!res.ok) { router.push("/admin"); return; }
    const data = await res.json();
    setMembers(data.members);
    setLoading(false);
  }, [filter, search, router]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--near-black)", color: "#fff" }}>
      <AdminNav />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="px-4 py-2 text-sm bg-transparent border outline-none w-64"
            style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }}
          />
          {["all", "active", "expired"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 text-xs uppercase tracking-widest transition-opacity"
              style={{
                fontFamily: "var(--font-display)",
                background: filter === f ? "var(--crimson)" : "transparent",
                color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
                border: filter === f ? "none" : "1px solid var(--border)",
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>
            Loading members...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>
            No members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Name", "Email", "Joined", "Trial End", "Status", "Plan", "Lessons", "Streak", "XP"].map(h => (
                    <th key={h} className="text-left py-3 pr-6 text-xs uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const status = trialStatus(m.trial_end);
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid var(--border)" }}
                      className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pr-6" style={{ fontFamily: "var(--font-body)" }}>{m.name}</td>
                      <td className="py-4 pr-6" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>{m.email}</td>
                      <td className="py-4 pr-6" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                        {new Date(m.created_at + "Z").toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-6" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                        {new Date(m.trial_end + "Z").toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-6">
                        <span className="text-xs font-bold uppercase tracking-wide"
                          style={{ color: status.color, fontFamily: "var(--font-display)" }}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <span className="text-xs uppercase tracking-wide"
                          style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-display)" }}>
                          {m.portal_stats?.plan ?? "—"}
                        </span>
                      </td>
                      <td className="py-4 pr-6" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                        {m.portal_stats?.lessonsCompleted ?? "—"}
                      </td>
                      <td className="py-4 pr-6" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                        {m.portal_stats != null ? `🔥 ${m.portal_stats.currentStreak}` : "—"}
                      </td>
                      <td className="py-4 pr-6" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                        {m.portal_stats?.totalXp ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>
              {members.length} record{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
