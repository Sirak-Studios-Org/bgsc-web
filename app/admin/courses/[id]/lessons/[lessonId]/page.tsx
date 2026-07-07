"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import MediaUploader from "@/components/admin/MediaUploader";

type Widget = { id: number; type: string; sortOrder: number; content: string };
type Lesson = {
  id: number;
  title: string;
  durationMinutes: number;
  dripDays: number;
  completionXp: number;
  isPublished: boolean;
  coverImageKey: string | null;
  widgets: Widget[];
  course: { id: number; title: string; slug: string };
};

const WIDGET_TYPES = [
  { value: "video", label: "Video" },
  { value: "text", label: "Text" },
  { value: "timer", label: "Timer" },
  { value: "question", label: "Journal Question" },
];

function parseContent(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw); } catch { return {}; }
}

const labelStyle = { color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" } as const;
const inputStyle = { borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)", background: "var(--surface-2)" } as const;

export default function LessonEditorPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = use(params);
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [newWidgetType, setNewWidgetType] = useState("video");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/lessons/${lessonId}`);
    if (!res.ok) { router.push(`/admin/courses/${id}`); return; }
    const data = await res.json();
    setLesson(data.lesson);
    setLoading(false);
  }, [lessonId, id, router]);

  useEffect(() => { load(); }, [load]);

  async function patchLesson(patch: Record<string, unknown>) {
    if (!lesson) return;
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setLesson((prev) => (prev ? { ...prev, ...patch } as Lesson : prev));
      setSaveMsg("Saved.");
      setTimeout(() => setSaveMsg(""), 1500);
    }
  }

  async function addWidget() {
    if (!lesson) return;
    const res = await fetch(`/api/admin/lessons/${lesson.id}/widgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: newWidgetType, content: {} }),
    });
    if (res.ok) {
      const data = await res.json();
      setLesson((prev) => (prev ? { ...prev, widgets: [...prev.widgets, data.widget] } : prev));
    }
  }

  async function patchWidget(widgetId: number, content: Record<string, unknown>) {
    const res = await fetch(`/api/admin/widgets/${widgetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setLesson((prev) =>
        prev
          ? { ...prev, widgets: prev.widgets.map((w) => (w.id === widgetId ? { ...w, content: JSON.stringify(content) } : w)) }
          : prev
      );
    }
  }

  async function deleteWidget(widgetId: number) {
    if (!confirm("Remove this content block?")) return;
    const res = await fetch(`/api/admin/widgets/${widgetId}`, { method: "DELETE" });
    if (res.ok) {
      setLesson((prev) => (prev ? { ...prev, widgets: prev.widgets.filter((w) => w.id !== widgetId) } : prev));
    }
  }

  async function moveWidget(widget: Widget, dir: -1 | 1) {
    if (!lesson) return;
    const sorted = [...lesson.widgets].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((w) => w.id === widget.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/admin/widgets/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/admin/widgets/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
    setLesson((prev) =>
      prev
        ? { ...prev, widgets: prev.widgets.map((w) => (w.id === a.id ? { ...w, sortOrder: b.sortOrder } : w.id === b.id ? { ...w, sortOrder: a.sortOrder } : w)) }
        : prev
    );
  }

  if (loading || !lesson) {
    return (
      <AdminShell>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p style={{ color: "rgba(255,255,255,0.3)" }}>Loading…</p>
        </div>
      </AdminShell>
    );
  }

  const sortedWidgets = [...lesson.widgets].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push(`/admin/courses/${id}`)}
            className="text-xs uppercase tracking-widest hover:opacity-70 transition-opacity" style={labelStyle}>
            ← {lesson.course.title}
          </button>
          <p className="text-xs uppercase tracking-[0.3em]" style={labelStyle}>Edit Lesson</p>
          {saveMsg && <span className="text-xs ml-auto" style={{ color: "#4caf50" }}>{saveMsg}</span>}
        </div>

        {/* Lesson meta */}
        <div className="mb-10 p-6 space-y-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={labelStyle}>Title</label>
            <input
              defaultValue={lesson.title}
              onBlur={(e) => e.target.value.trim() && e.target.value !== lesson.title && patchLesson({ title: e.target.value.trim() })}
              className="w-full px-3 py-2 text-sm bg-transparent border outline-none" style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={labelStyle}>Duration (min)</label>
              <input type="number" min={0} defaultValue={lesson.durationMinutes}
                onBlur={(e) => patchLesson({ durationMinutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-transparent border outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={labelStyle}>Drip (days after join)</label>
              <input type="number" min={0} defaultValue={lesson.dripDays}
                onBlur={(e) => patchLesson({ dripDays: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-transparent border outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2" style={labelStyle}>XP on complete</label>
              <input type="number" min={0} defaultValue={lesson.completionXp}
                onBlur={(e) => patchLesson({ completionXp: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-transparent border outline-none" style={inputStyle} />
            </div>
          </div>

          <MediaUploader
            kind="image"
            label="Cover thumbnail"
            value={lesson.coverImageKey}
            onChange={(key) => patchLesson({ coverImageKey: key })}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={lesson.isPublished} onChange={(e) => patchLesson({ isPublished: e.target.checked })}
              className="w-4 h-4" style={{ accentColor: "var(--crimson)" }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-display)" }}>
              Published
            </span>
          </label>
        </div>

        {/* Widgets */}
        <p className="text-xs uppercase tracking-[0.3em] mb-4" style={labelStyle}>
          Content blocks ({sortedWidgets.length})
        </p>

        <div className="space-y-3 mb-6">
          {sortedWidgets.map((widget, idx) => (
            <WidgetEditor
              key={widget.id}
              widget={widget}
              isFirst={idx === 0}
              isLast={idx === sortedWidgets.length - 1}
              onMove={(dir) => moveWidget(widget, dir)}
              onChange={(content) => patchWidget(widget.id, content)}
              onDelete={() => deleteWidget(widget.id)}
            />
          ))}
        </div>

        <div className="flex gap-2 items-center p-4" style={{ background: "var(--surface-1)", border: "1px dashed var(--border)" }}>
          <select value={newWidgetType} onChange={(e) => setNewWidgetType(e.target.value)}
            className="px-3 py-2 text-sm bg-transparent border outline-none" style={inputStyle}>
            {WIDGET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button onClick={addWidget}
            className="px-4 py-2 text-xs uppercase tracking-widest"
            style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}>
            + Add Block
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

function WidgetEditor({
  widget, isFirst, isLast, onMove, onChange, onDelete,
}: {
  widget: Widget;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
  onChange: (content: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const content = parseContent(widget.content);

  return (
    <div className="p-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col gap-0.5">
          <button onClick={() => onMove(-1)} disabled={isFirst}
            className="text-[10px] px-1 disabled:opacity-20 hover:opacity-60 transition-opacity" style={{ color: "var(--ash)" }}>▲</button>
          <button onClick={() => onMove(1)} disabled={isLast}
            className="text-[10px] px-1 disabled:opacity-20 hover:opacity-60 transition-opacity" style={{ color: "var(--ash)" }}>▼</button>
        </div>
        <span className="text-[10px] uppercase tracking-widest px-2 py-1"
          style={{ background: "var(--surface-2)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-display)" }}>
          {widget.type}
        </span>
        <button onClick={onDelete} className="text-xs ml-auto hover:opacity-70 transition-opacity" style={{ color: "rgba(255,255,255,0.25)" }}>
          Remove ×
        </button>
      </div>

      {widget.type === "video" && (
        <MediaUploader kind="video" value={(content.videoKey as string) ?? null}
          onChange={(key) => onChange({ ...content, videoKey: key })} />
      )}

      {widget.type === "text" && (
        <textarea
          defaultValue={(content.text as string) ?? ""}
          onBlur={(e) => onChange({ ...content, text: e.target.value })}
          rows={4}
          placeholder="Lesson copy…"
          className="w-full px-3 py-2 text-sm bg-transparent border outline-none resize-none" style={inputStyle}
        />
      )}

      {widget.type === "timer" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={labelStyle}>Seconds</label>
            <input type="number" min={5} defaultValue={(content.seconds as number) ?? 60}
              onBlur={(e) => onChange({ ...content, seconds: parseInt(e.target.value) || 60 })}
              className="w-full px-3 py-2 text-sm bg-transparent border outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={labelStyle}>Label</label>
            <input defaultValue={(content.label as string) ?? "Rest"}
              onBlur={(e) => onChange({ ...content, label: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-transparent border outline-none" style={inputStyle} />
          </div>
        </div>
      )}

      {widget.type === "question" && (
        <div className="space-y-3">
          <input defaultValue={(content.question as string) ?? ""}
            onBlur={(e) => onChange({ ...content, question: e.target.value })}
            placeholder="Question (e.g. Sets x Reps)"
            className="w-full px-3 py-2 text-sm bg-transparent border outline-none" style={inputStyle} />
          <div className="grid grid-cols-2 gap-3">
            <input defaultValue={(content.placeholder as string) ?? ""}
              onBlur={(e) => onChange({ ...content, placeholder: e.target.value })}
              placeholder="Placeholder text"
              className="w-full px-3 py-2 text-sm bg-transparent border outline-none" style={inputStyle} />
            <input defaultValue={(content.unit as string) ?? ""}
              onBlur={(e) => onChange({ ...content, unit: e.target.value })}
              placeholder="Unit (e.g. lbs)"
              className="w-full px-3 py-2 text-sm bg-transparent border outline-none" style={inputStyle} />
          </div>
        </div>
      )}
    </div>
  );
}
