"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

type Course = {
  id: number;
  title: string;
  slug: string;
  planRequired: string[];
  isPublished: boolean;
  lessonCount: number;
};

export default function AdminCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/courses");
    if (!res.ok) { router.push("/admin"); return; }
    const data = await res.json();
    setCourses(data.courses);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function togglePublish(course: Course) {
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    if (res.ok) {
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isPublished: !c.isPublished } : c))
      );
    }
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setCreating(true);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/courses/${data.course.id}`);
    }
    setCreating(false);
  }

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">

        <div className="flex items-center justify-between mb-8">
          <p className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
            Courses
          </p>
          <form onSubmit={createCourse} className="flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New course title…"
              className="px-3 py-2 text-sm bg-transparent border outline-none"
              style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)", width: 220 }}
            />
            <button
              type="submit"
              disabled={!newTitle.trim() || creating}
              className="px-4 py-2 text-xs uppercase tracking-widest disabled:opacity-40"
              style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}
            >
              + Create
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>
            Loading courses…
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>
            No courses yet. Create one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Title", "Lessons", "Plan Required", "Published", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 pr-6 text-xs uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-6" style={{ fontFamily: "var(--font-body)" }}>{c.title}</td>
                    <td className="py-4 pr-6" style={{ color: "rgba(255,255,255,0.5)" }}>{c.lessonCount}</td>
                    <td className="py-4 pr-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {c.planRequired.length > 0 ? c.planRequired.join(", ") : "free"}
                    </td>
                    <td className="py-4 pr-6">
                      <button
                        onClick={() => togglePublish(c)}
                        className="text-xs uppercase tracking-widest px-3 py-1 transition-opacity hover:opacity-80"
                        style={{
                          background: c.isPublished ? "rgba(0,160,0,0.15)" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${c.isPublished ? "rgba(0,200,0,0.4)" : "var(--border)"}`,
                          color: c.isPublished ? "#4caf50" : "rgba(255,255,255,0.4)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {c.isPublished ? "Live" : "Draft"}
                      </button>
                    </td>
                    <td className="py-4 pr-6">
                      <Link
                        href={`/admin/courses/${c.id}`}
                        className="text-xs uppercase tracking-widest px-3 py-1 transition-opacity hover:opacity-80"
                        style={{
                          background: "var(--surface-1)",
                          border: "1px solid var(--border)",
                          color: "rgba(255,255,255,0.6)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>
              {courses.length} course{courses.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
