"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import VideoPlayer from "./VideoPlayer";
import ExerciseJournal from "./ExerciseJournal";

type Widget = { id: number; type: string; sortOrder: number; content: string };
type JournalEntry = { id: number; widgetId: number; lessonId: number; value: string; isPr: boolean; entryDate: string | Date };

interface Props {
  lesson: { id: number; title: string; courseSlug: string; slug: string };
  widgets: Widget[];
  isCompleted: boolean;
  nextLesson: { title: string; slug: string; courseSlug: string } | null;
  journalHistory: Record<number, JournalEntry[]>;
}

export default function LessonPlayer({ lesson, widgets, isCompleted, nextLesson, journalHistory }: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(isCompleted);
  const [marking, setMarking] = useState(false);
  const [showNextCard, setShowNextCard] = useState(false);

  async function markComplete() {
    if (completed || marking) return;
    setMarking(true);
    try {
      await fetch(`/api/portal/lessons/${lesson.id}/complete`, { method: "POST" });
      setCompleted(true);
      setShowNextCard(true);
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="space-y-6">
      {widgets.map(widget => {
        const content = (() => { try { return JSON.parse(widget.content); } catch { return {}; } })();
        // Normalize widget types across seed sources: the DB holds "video"/"question"
        // (migrated content) while older code used "clip"/"textquestion".
        const type = widget.type;

        if (type === "video" || type === "clip") {
          // DB stores the source as content.videoUrl; older widgets used videoKey.
          const src = content.videoUrl ?? content.videoKey ?? "";
          return (
            <div key={widget.id}>
              <VideoPlayer videoKey={src} chapters={content.chapters ?? []} onEnd={markComplete} />
            </div>
          );
        }

        if (type === "text") {
          return (
            <div key={widget.id} className="prose max-w-none text-sm leading-relaxed"
              style={{ color: "var(--soft-white)" }}
              dangerouslySetInnerHTML={{ __html: content.html ?? content.text ?? "" }} />
          );
        }

        if (type === "timer") {
          return <TimerWidget key={widget.id} seconds={content.durationSeconds ?? content.seconds ?? 60} label={content.label ?? "Rest"} />;
        }

        if (type === "question" || type === "textquestion") {
          return (
            <ExerciseJournal
              key={widget.id}
              widgetId={widget.id}
              lessonId={lesson.id}
              question={content.question ?? ""}
              placeholder={content.placeholder ?? ""}
              unit={content.unit ?? ""}
              history={(journalHistory[widget.id] ?? []).map(e => ({ ...e, entryDate: new Date(e.entryDate) }))}
            />
          );
        }

        return null;
      })}

      {/* Mark complete */}
      {!completed ? (
        <button onClick={markComplete} disabled={marking}
          className="w-full py-4 text-sm uppercase tracking-widest font-black mt-8 transition-opacity"
          style={{ fontFamily: "var(--font-display)", background: "var(--crimson)", color: "#fff", opacity: marking ? 0.6 : 1 }}>
          {marking ? "Saving..." : "Mark as Complete ✓"}
        </button>
      ) : (
        <div className="p-4 text-center mt-8" style={{ background: "rgba(143,0,0,0.1)", border: "1px solid var(--crimson)" }}>
          <p className="text-sm font-bold" style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>
            ✓ Lesson Complete!
          </p>
        </div>
      )}

      {/* Next lesson card */}
      {(completed || showNextCard) && nextLesson && (
        <div className="p-4 mt-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--ash)", fontFamily: "var(--font-display)" }}>
            Up Next
          </p>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--soft-white)", fontFamily: "var(--font-display)" }}>
            {nextLesson.title}
          </p>
          <button onClick={() => router.push(`/portal/learn/${nextLesson.courseSlug}/${nextLesson.slug}`)}
            className="w-full py-3 text-xs uppercase tracking-widest font-black"
            style={{ fontFamily: "var(--font-display)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--soft-white)" }}>
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

// Timer widget component
function TimerWidget({ seconds, label }: { seconds: number; label: string }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  function start() {
    if (running || done) return;
    setRunning(true);
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function reset() {
    setRemaining(seconds);
    setRunning(false);
    setDone(false);
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="p-4 text-center" style={{ background: "var(--surface-1)", border: `1px solid ${done ? "var(--crimson)" : "var(--border)"}` }}>
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--ash)", fontFamily: "var(--font-display)" }}>
        ⏱ {label}
      </p>
      <p className="text-4xl font-black mb-4" style={{ fontFamily: "var(--font-display)", color: done ? "var(--crimson)" : "var(--soft-white)" }}>
        {mins}:{String(secs).padStart(2, "0")}
      </p>
      {!done ? (
        <button onClick={start} disabled={running}
          className="px-8 py-2 text-xs uppercase tracking-widest"
          style={{ background: running ? "var(--surface-2)" : "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)", opacity: running ? 0.6 : 1 }}>
          {running ? "Running..." : "Start"}
        </button>
      ) : (
        <div className="flex gap-2 justify-center">
          <p className="text-sm" style={{ color: "var(--crimson)" }}>✓ Done!</p>
          <button onClick={reset} className="text-xs" style={{ color: "var(--ash)" }}>Reset</button>
        </div>
      )}
    </div>
  );
}
