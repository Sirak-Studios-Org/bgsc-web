"use client";

import { useEffect, useState, useCallback } from "react";

type CheckIn = {
  id: number;
  goalId: number;
  userId: number;
  checkinDate: string;
  numericValue: number | null;
  boolValue: boolean | null;
  photoKey: string | null;
  notes: string | null;
  createdAt: string;
};

type Goal = {
  id: number;
  userId: number;
  name: string;
  type: "numeric" | "boolean" | "photo";
  unit: string;
  cadence: "daily" | "weekly";
  isCoachVisible: boolean;
  sortOrder: number;
  createdAt: string;
  checkIns: CheckIn[];
};

const TYPE_LABELS: Record<string, string> = {
  numeric: "Numeric",
  boolean: "Done / Not Done",
  photo: "Progress Photo",
};

const SUGGESTED_GOALS = [
  { name: "Strength Sessions", type: "numeric" as const, unit: "sessions", cadence: "weekly" as const },
  { name: "Water Intake", type: "numeric" as const, unit: "glasses", cadence: "daily" as const },
  { name: "Protein Goal", type: "boolean" as const, unit: "", cadence: "daily" as const },
];

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getLast8Days() {
  const days: Date[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function CheckInDots({ goal }: { goal: Goal }) {
  const days = getLast8Days();
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
      {days.map((day, i) => {
        const checkin = goal.checkIns.find((c) => isSameDay(new Date(c.checkinDate), day));
        const hasValue = checkin && (
          checkin.numericValue !== null ||
          checkin.boolValue !== null
        );
        const dayLabel = day.toLocaleDateString("en-US", { weekday: "narrow" });
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: hasValue ? "var(--crimson)" : "var(--surface-2)",
              border: `1px solid ${hasValue ? "var(--crimson)" : "var(--border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: hasValue ? "#fff" : "var(--ash)",
            }}>
              {hasValue && goal.type === "numeric" ? checkin?.numericValue : hasValue ? "✓" : ""}
            </div>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{dayLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

function GoalCard({
  goal,
  onCheckin,
  onDelete,
}: {
  goal: Goal;
  onCheckin: (goalId: number, value: { numericValue?: number; boolValue?: boolean }) => void;
  onDelete: (goalId: number) => void;
}) {
  const [numInput, setNumInput] = useState("");
  const [checking, setChecking] = useState(false);

  const weekStart = getWeekStart();
  const weekCheckins = goal.checkIns.filter((c) => new Date(c.checkinDate) >= weekStart);
  const weekTotal = goal.type === "numeric"
    ? weekCheckins.reduce((s, c) => s + (c.numericValue ?? 0), 0)
    : weekCheckins.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCheckin = goal.checkIns.find((c) => isSameDay(new Date(c.checkinDate), today));

  async function handleNumericCheckin() {
    const val = parseFloat(numInput);
    if (isNaN(val)) return;
    setChecking(true);
    await onCheckin(goal.id, { numericValue: val });
    setNumInput("");
    setChecking(false);
  }

  async function handleBoolCheckin(val: boolean) {
    setChecking(true);
    await onCheckin(goal.id, { boolValue: val });
    setChecking(false);
  }

  return (
    <div style={{
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      padding: 16,
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "var(--soft-white)", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 15 }}>
            {goal.name}
          </p>
          <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
            <span style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "2px 6px",
              background: "var(--surface-2)",
              color: "var(--ash)",
              border: "1px solid var(--border)",
            }}>
              {TYPE_LABELS[goal.type]}
            </span>
            <span style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "2px 6px",
              background: "var(--surface-2)",
              color: "var(--ash)",
              border: "1px solid var(--border)",
            }}>
              {goal.cadence}
            </span>
            {goal.unit && (
              <span style={{ fontSize: 10, color: "var(--ash)" }}>{goal.unit}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 16, padding: 4 }}
          aria-label="Delete goal"
        >
          ×
        </button>
      </div>

      {goal.cadence === "weekly" && goal.type === "numeric" && (
        <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: weekTotal > 0 ? "var(--crimson)" : "var(--ash)", fontFamily: "var(--font-display)" }}>
            {weekTotal}
          </span>
          <span style={{ fontSize: 11, color: "var(--ash)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            this week
          </span>
        </div>
      )}

      <CheckInDots goal={goal} />

      <div style={{ marginTop: 12 }}>
        {goal.type === "numeric" ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              placeholder={`Log ${goal.unit || "value"}...`}
              value={numInput}
              onChange={(e) => setNumInput(e.target.value)}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--soft-white)",
                padding: "6px 10px",
                fontSize: 13,
                flex: 1,
                outline: "none",
              }}
            />
            <button
              onClick={handleNumericCheckin}
              disabled={checking || !numInput}
              style={{
                background: "var(--crimson)",
                border: "none",
                color: "#fff",
                padding: "6px 14px",
                fontFamily: "var(--font-display)",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                opacity: checking || !numInput ? 0.5 : 1,
              }}
            >
              Log
            </button>
          </div>
        ) : goal.type === "boolean" ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => handleBoolCheckin(true)}
              disabled={checking || !!todayCheckin}
              style={{
                flex: 1,
                padding: "8px 0",
                background: todayCheckin?.boolValue === true ? "var(--crimson)" : "var(--surface-2)",
                border: `1px solid ${todayCheckin?.boolValue === true ? "var(--crimson)" : "var(--border)"}`,
                color: "var(--soft-white)",
                fontFamily: "var(--font-display)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                opacity: checking ? 0.5 : 1,
              }}
            >
              {todayCheckin?.boolValue === true ? "✓ Done" : "Mark Done"}
            </button>
            <button
              onClick={() => handleBoolCheckin(false)}
              disabled={checking || !!todayCheckin}
              style={{
                flex: 1,
                padding: "8px 0",
                background: todayCheckin?.boolValue === false ? "rgba(143,0,0,0.3)" : "var(--surface-2)",
                border: `1px solid ${todayCheckin?.boolValue === false ? "var(--crimson)" : "var(--border)"}`,
                color: "var(--ash)",
                fontFamily: "var(--font-display)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                opacity: checking ? 0.5 : 1,
              }}
            >
              Skipped
            </button>
          </div>
        ) : (
          <button
            disabled
            style={{
              width: "100%",
              padding: "8px 0",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--ash)",
              fontFamily: "var(--font-display)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "not-allowed",
            }}
          >
            Photo upload coming soon
          </button>
        )}
      </div>
    </div>
  );
}

function AddGoalModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (goal: Goal) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"numeric" | "boolean" | "photo">("numeric");
  const [unit, setUnit] = useState("");
  const [cadence, setCadence] = useState<"daily" | "weekly">("weekly");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Goal name is required"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/portal/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), type, unit, cadence }),
    });
    if (res.ok) {
      const data = await res.json();
      onAdd(data.goal);
      onClose();
    } else {
      setError("Failed to create goal");
    }
    setSaving(false);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 480,
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderBottom: "none",
        padding: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ color: "var(--soft-white)", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 900 }}>
            Add Tracking Goal
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--ash)", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--ash)", marginBottom: 6, fontFamily: "var(--font-display)" }}>
              Goal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Strength Sessions"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--soft-white)",
                padding: "9px 12px",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--ash)", marginBottom: 6, fontFamily: "var(--font-display)" }}>
              Type
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {(["numeric", "boolean", "photo"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  style={{
                    padding: "8px 4px",
                    background: type === t ? "var(--crimson)" : "var(--surface-2)",
                    border: `1px solid ${type === t ? "var(--crimson)" : "var(--border)"}`,
                    color: type === t ? "#fff" : "var(--ash)",
                    fontFamily: "var(--font-display)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                  }}
                >
                  {t === "numeric" ? "Reps / Sets" : t === "boolean" ? "Done / Not Done" : "Progress Photo"}
                </button>
              ))}
            </div>
          </div>

          {type === "numeric" && (
            <div>
              <label style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--ash)", marginBottom: 6, fontFamily: "var(--font-display)" }}>
                Unit (optional)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. sessions, glasses, km"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--soft-white)",
                  padding: "9px 12px",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--ash)", marginBottom: 6, fontFamily: "var(--font-display)" }}>
              Cadence
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["daily", "weekly"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCadence(c)}
                  style={{
                    padding: "8px 0",
                    background: cadence === c ? "var(--crimson)" : "var(--surface-2)",
                    border: `1px solid ${cadence === c ? "var(--crimson)" : "var(--border)"}`,
                    color: cadence === c ? "#fff" : "var(--ash)",
                    fontFamily: "var(--font-display)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: "var(--crimson)", fontSize: 12 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 0",
              background: "var(--crimson)",
              border: "none",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              cursor: "pointer",
              opacity: saving ? 0.6 : 1,
              marginTop: 4,
            }}
          >
            {saving ? "Adding..." : "Add Goal"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/portal/tracking");
    if (res.ok) {
      const data = await res.json();
      setGoals(data.goals);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const weekStart = getWeekStart();
  const strengthGoal = goals.find((g) =>
    g.name.toLowerCase().includes("strength") ||
    (g.type === "numeric" && g.cadence === "weekly")
  );
  const weekSessions = strengthGoal
    ? strengthGoal.checkIns
      .filter((c) => new Date(c.checkinDate) >= weekStart)
      .reduce((s, c) => s + (c.numericValue ?? 1), 0)
    : null;

  async function handleCheckin(goalId: number, value: { numericValue?: number; boolValue?: boolean }) {
    const res = await fetch(`/api/portal/tracking/${goalId}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (res.ok) {
      const data = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === goalId ? data.goal : g)));
    }
  }

  async function handleDelete(goalId: number) {
    if (!confirm("Delete this goal and all its check-ins?")) return;
    const res = await fetch(`/api/portal/tracking/${goalId}`, { method: "DELETE" });
    if (res.ok) {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    }
  }

  async function handleSuggestedAdd(suggested: typeof SUGGESTED_GOALS[0]) {
    const res = await fetch("/api/portal/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suggested),
    });
    if (res.ok) {
      const data = await res.json();
      setGoals((prev) => [...prev, data.goal]);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: "var(--crimson)", fontFamily: "var(--font-display)", marginBottom: 4 }}>
            Your Progress
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
            Tracking
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "var(--crimson)",
            border: "none",
            color: "#fff",
            padding: "8px 16px",
            fontFamily: "var(--font-display)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            cursor: "pointer",
          }}
        >
          + Add Goal
        </button>
      </div>

      {weekSessions !== null && (
        <div style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 36, fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--crimson)", lineHeight: 1 }}>
              {weekSessions}
            </p>
            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--ash)", fontFamily: "var(--font-display)", marginTop: 4 }}>
              Strength Sessions This Week
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--ash)", fontSize: 13 }}>Loading...</p>
      ) : goals.length === 0 ? (
        <div style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          padding: 24,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📊</p>
          <p style={{ color: "var(--soft-white)", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
            Start tracking your progress
          </p>
          <p style={{ color: "var(--ash)", fontSize: 13, marginBottom: 20 }}>
            Pick a goal to start logging your consistency.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SUGGESTED_GOALS.map((sg) => (
              <button
                key={sg.name}
                onClick={() => handleSuggestedAdd(sg)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--soft-white)",
                  fontFamily: "var(--font-display)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{sg.name}</span>
                <span style={{ color: "var(--crimson)" }}>+ Add</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onCheckin={handleCheckin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddGoalModal
          onClose={() => setShowModal(false)}
          onAdd={(goal) => setGoals((prev) => [...prev, goal])}
        />
      )}
    </div>
  );
}
