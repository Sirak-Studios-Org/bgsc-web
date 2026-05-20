"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

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

type EditState = {
  memberId: number;
  trialEnd: string;
  isActive: boolean;
  newPassword: string;
  saving: boolean;
  msg: string;
};

export default function AdminMembers() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);

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

  function openEdit(m: Member) {
    if (expanded === m.id) { setExpanded(null); setEdit(null); return; }
    setExpanded(m.id);
    const end = m.trial_end ? new Date(m.trial_end + "Z") : new Date();
    setEdit({
      memberId: m.id,
      trialEnd: end.toISOString().slice(0, 10),
      isActive: m.is_active === 1,
      newPassword: "",
      saving: false,
      msg: "",
    });
  }

  async function saveEdit() {
    if (!edit) return;
    setEdit(e => e ? { ...e, saving: true, msg: "" } : e);
    const body: Record<string, unknown> = {
      trialEnd: edit.trialEnd,
      isActive: edit.isActive,
    };
    if (edit.newPassword) body.password = edit.newPassword;
    const res = await fetch(`/api/admin/members/${edit.memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setMembers(prev => prev.map(m => m.id === edit.memberId
        ? { ...m, trial_end: edit.trialEnd, is_active: edit.isActive ? 1 : 0 }
        : m
      ));
      setEdit(e => e ? { ...e, saving: false, msg: "Saved.", newPassword: "" } : e);
    } else {
      setEdit(e => e ? { ...e, saving: false, msg: data.error ?? "Failed." } : e);
    }
  }

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">

        <div className="flex items-center justify-between mb-6">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Members</p>
          <Link href="/admin/members/import"
            className="px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-display)" }}>
            + Import CSV
          </Link>
        </div>

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
                  {["Name", "Email", "Joined", "Trial End", "Status", "Plan", "Lessons", "Streak", "XP", ""].map(h => (
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
                    <React.Fragment key={m.id}>
                    <tr style={{ borderBottom: expanded === m.id ? "none" : "1px solid var(--border)" }}
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
                      <td className="py-4">
                        <button onClick={() => openEdit(m)}
                          className="text-xs px-2 py-1 uppercase tracking-widest transition-opacity hover:opacity-80"
                          style={{
                            fontFamily: "var(--font-display)",
                            background: expanded === m.id ? "rgba(143,0,0,0.2)" : "var(--surface-2)",
                            border: `1px solid ${expanded === m.id ? "var(--crimson)" : "var(--border)"}`,
                            color: expanded === m.id ? "var(--crimson)" : "rgba(255,255,255,0.4)",
                          }}>
                          {expanded === m.id ? "Close" : "Edit"}
                        </button>
                      </td>
                    </tr>
                    {expanded === m.id && edit && (
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <td colSpan={10} className="pb-4 px-0">
                          <div className="p-4 mx-0" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <label className="block text-xs uppercase tracking-widest mb-1.5"
                                  style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
                                  Trial End Date
                                </label>
                                <input type="date" value={edit.trialEnd}
                                  onChange={e => setEdit(ed => ed ? { ...ed, trialEnd: e.target.value } : ed)}
                                  className="w-full px-3 py-2 text-sm bg-transparent border outline-none"
                                  style={{ borderColor: "var(--border)", color: "#fff" }} />
                              </div>
                              <div>
                                <label className="block text-xs uppercase tracking-widest mb-1.5"
                                  style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
                                  Status
                                </label>
                                <select value={edit.isActive ? "active" : "inactive"}
                                  onChange={e => setEdit(ed => ed ? { ...ed, isActive: e.target.value === "active" } : ed)}
                                  className="w-full px-3 py-2 text-sm border outline-none"
                                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "#fff" }}>
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs uppercase tracking-widest mb-1.5"
                                  style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
                                  Reset Password (leave blank to keep)
                                </label>
                                <input type="password" value={edit.newPassword} placeholder="New password…"
                                  onChange={e => setEdit(ed => ed ? { ...ed, newPassword: e.target.value } : ed)}
                                  className="w-full px-3 py-2 text-sm bg-transparent border outline-none"
                                  style={{ borderColor: "var(--border)", color: "#fff" }} />
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <button onClick={saveEdit} disabled={edit.saving}
                                className="px-5 py-2 text-xs uppercase tracking-widest font-black transition-opacity disabled:opacity-40"
                                style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}>
                                {edit.saving ? "Saving…" : "Save Changes"}
                              </button>
                              {edit.msg && (
                                <span className="text-xs" style={{ color: edit.msg === "Saved." ? "#4ade80" : "var(--crimson)" }}>
                                  {edit.msg}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
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
    </AdminShell>
  );
}
