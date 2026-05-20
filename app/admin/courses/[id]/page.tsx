"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

const PLAN_OPTIONS = ["club", "premium", "vip"];

type Lesson = {
  id: number;
  title: string;
  slug: string;
  isPublished: boolean;
  lessonType: string;
  durationMinutes: number;
  sortOrder: number;
};

type Course = {
  id: number;
  slug: string;
  title: string;
  description: string;
  planRequired: string[];
  isPublished: boolean;
  lessons: Lesson[];
};

export default function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [planRequired, setPlanRequired] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [addingLesson, setAddingLesson] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/courses/${id}`);
      if (!res.ok) { router.push("/admin/courses"); return; }
      const data = await res.json();
      const c: Course = data.course;
      setCourse(c);
      setTitle(c.title);
      setDescription(c.description);
      setPlanRequired(c.planRequired);
      setIsPublished(c.isPublished);
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!course || saving) return;
    setSaving(true);
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, planRequired, isPublished }),
    });
    if (res.ok) {
      setSaveMsg("Saved.");
      setTimeout(() => setSaveMsg(""), 2000);
    }
    setSaving(false);
  }

  async function toggleLessonPublish(lesson: Lesson) {
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !lesson.isPublished }),
    });
    if (res.ok) {
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              lessons: prev.lessons.map((l) =>
                l.id === lesson.id ? { ...l, isPublished: !l.isPublished } : l
              ),
            }
          : prev
      );
    }
  }

  async function moveLesson(lesson: Lesson, dir: -1 | 1) {
    if (!course) return;
    const sorted = [...course.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((l) => l.id === lesson.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];

    await Promise.all([
      fetch(`/api/admin/lessons/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      }),
      fetch(`/api/admin/lessons/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      }),
    ]);

    setCourse((prev) =>
      prev
        ? {
            ...prev,
            lessons: prev.lessons.map((l) => {
              if (l.id === a.id) return { ...l, sortOrder: b.sortOrder };
              if (l.id === b.id) return { ...l, sortOrder: a.sortOrder };
              return l;
            }),
          }
        : prev
    );
  }

  async function deleteLesson(lessonId: number) {
    if (!confirm("Delete this lesson?")) return;
    const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
    if (res.ok) {
      setCourse((prev) =>
        prev ? { ...prev, lessons: prev.lessons.filter((l) => l.id !== lessonId) } : prev
      );
    }
  }

  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    const lessonTitle = newLessonTitle.trim();
    if (!lessonTitle || addingLesson || !course) return;
    setAddingLesson(true);
    const res = await fetch(`/api/admin/courses/${course.id}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: lessonTitle }),
    });
    if (res.ok) {
      const data = await res.json();
      setCourse((prev) =>
        prev ? { ...prev, lessons: [...prev.lessons, data.lesson] } : prev
      );
      setNewLessonTitle("");
    }
    setAddingLesson(false);
  }

  function togglePlan(plan: string) {
    setPlanRequired((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]
    );
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p style={{ color: "rgba(255,255,255,0.3)" }}>Loading…</p>
        </div>
      </AdminShell>
    );
  }

  const sortedLessons = [...(course?.lessons ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">

        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push("/admin/courses")}
            className="text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "var(--ash)", fontFamily: "var(--font-display)" }}>
            ← Courses
          </button>
          <p className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
            Edit Course
          </p>
        </div>

        <form onSubmit={saveCourse} className="mb-10 p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-transparent border outline-none"
                style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)", background: "var(--surface-2)" }}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-transparent border outline-none resize-none"
                style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)", background: "var(--surface-2)" }}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
                Plan Required
              </label>
              <div className="flex gap-3 flex-wrap">
                {PLAN_OPTIONS.map((plan) => (
                  <label key={plan} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planRequired.includes(plan)}
                      onChange={() => togglePlan(plan)}
                      className="w-4 h-4"
                      style={{ accentColor: "var(--crimson)" }}
                    />
                    <span className="text-xs uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-display)" }}>
                      {plan}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: "var(--crimson)" }}
                />
                <span className="text-xs uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-display)" }}>
                  Published
                </span>
              </label>
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" disabled={saving}
                className="px-6 py-2 text-xs uppercase tracking-widest disabled:opacity-40"
                style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              {saveMsg && (
                <span className="text-xs" style={{ color: "#4caf50", fontFamily: "var(--font-display)" }}>
                  {saveMsg}
                </span>
              )}
            </div>
          </div>
        </form>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] mb-4"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
            Lessons ({sortedLessons.length})
          </p>

          {sortedLessons.length > 0 && (
            <div className="mb-4" style={{ border: "1px solid var(--border)" }}>
              {sortedLessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                  style={{
                    background: "var(--surface-1)",
                    borderBottom: idx < sortedLessons.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveLesson(lesson, -1)} disabled={idx === 0}
                      className="text-[10px] px-1 disabled:opacity-20 hover:opacity-60 transition-opacity"
                      style={{ color: "var(--ash)" }}>▲</button>
                    <button onClick={() => moveLesson(lesson, 1)} disabled={idx === sortedLessons.length - 1}
                      className="text-[10px] px-1 disabled:opacity-20 hover:opacity-60 transition-opacity"
                      style={{ color: "var(--ash)" }}>▼</button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "var(--soft-white)", fontFamily: "var(--font-body)" }}>
                      {lesson.title}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide mt-0.5"
                      style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-display)" }}>
                      {lesson.lessonType} · {lesson.durationMinutes > 0 ? `${lesson.durationMinutes}min` : "no duration"}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleLessonPublish(lesson)}
                    className="text-[10px] uppercase tracking-widest px-2 py-1 transition-opacity hover:opacity-80"
                    style={{
                      background: lesson.isPublished ? "rgba(0,160,0,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${lesson.isPublished ? "rgba(0,200,0,0.4)" : "var(--border)"}`,
                      color: lesson.isPublished ? "#4caf50" : "rgba(255,255,255,0.4)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {lesson.isPublished ? "Live" : "Draft"}
                  </button>
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="text-xs hover:opacity-70 transition-opacity"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={addLesson} className="flex gap-2">
            <input
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="New lesson title…"
              className="flex-1 px-3 py-2 text-sm bg-transparent border outline-none"
              style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)", background: "var(--surface-2)" }}
            />
            <button
              type="submit"
              disabled={!newLessonTitle.trim() || addingLesson}
              className="px-4 py-2 text-xs uppercase tracking-widest disabled:opacity-40"
              style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}
            >
              + Add Lesson
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
