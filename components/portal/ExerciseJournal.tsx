"use client";
import { useState } from "react";

interface HistoryEntry { id: number; widgetId: number; lessonId: number; value: string; isPr: boolean; entryDate: Date }
interface Props {
  widgetId: number;
  lessonId: number;
  question: string;
  placeholder: string;
  unit: string;
  history: HistoryEntry[];
}

export default function ExerciseJournal({ widgetId, lessonId, question, placeholder, unit, history }: Props) {
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPr, setIsPr] = useState(false);
  const [saving, setSaving] = useState(false);

  const lastEntry = history[0];
  const lastValueParsed = (() => {
    if (!lastEntry) return null;
    try { return JSON.parse(lastEntry.value); } catch { return null; }
  })();

  async function saveEntry() {
    if (!answer.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portal/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetId, lessonId, value: { text: answer } }),
      });
      const data = await res.json();
      setIsPr(data.isPr ?? false);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
      <p className="text-sm font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
        📝 {question}
      </p>

      {/* Last session */}
      {lastEntry && (
        <div className="mb-3 px-3 py-2 text-xs"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <p className="mb-1" style={{ color: "var(--ash)" }}>
            Last session ({new Date(lastEntry.entryDate).toLocaleDateString()}):
          </p>
          <p style={{ color: "var(--soft-white)" }}>
            {lastValueParsed?.text ?? (typeof lastValueParsed === "string" ? lastValueParsed : JSON.stringify(lastValueParsed))}
            {lastEntry.isPr && <span className="ml-2 text-yellow-400">🏆 PR</span>}
          </p>
        </div>
      )}

      {/* Input */}
      {!saved ? (
        <div className="flex gap-2">
          <textarea value={answer} onChange={e => setAnswer(e.target.value)}
            rows={2} placeholder={placeholder || `Enter your answer${unit ? ` (${unit})` : ""}...`}
            className="flex-1 px-3 py-2 text-sm resize-none outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--soft-white)" }} />
          <button onClick={saveEntry} disabled={saving || !answer.trim()}
            className="px-4 py-2 text-xs uppercase tracking-wider self-end"
            style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)", opacity: saving || !answer.trim() ? 0.5 : 1 }}>
            {saving ? "..." : "Save"}
          </button>
        </div>
      ) : (
        <div className="py-2">
          {isPr && (
            <div className="mb-2 p-2 text-center" style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)" }}>
              <p className="text-sm font-bold text-yellow-400">🏆 New Personal Record!</p>
            </div>
          )}
          <p className="text-sm" style={{ color: "var(--crimson)" }}>✓ Saved: {answer}</p>
        </div>
      )}
    </div>
  );
}
