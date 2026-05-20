"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const STEPS = [
  {
    question: "What's your #1 goal right now?",
    field: "goal",
    options: [
      { value: "lose_fat",     label: "🔥 Lose fat + get lean" },
      { value: "build_muscle", label: "💪 Build muscle" },
      { value: "get_stronger", label: "🏋️ Get stronger" },
      { value: "all",          label: "⚡ ALL of the above" },
    ],
  },
  {
    question: "What's your lifting experience?",
    field: "experienceLevel",
    options: [
      { value: "beginner", label: "🌱 Never lifted before" },
      { value: "some",     label: "📈 Some experience" },
      { value: "advanced", label: "🦾 I know what I'm doing" },
    ],
  },
  {
    question: "How many days/week can you train?",
    field: "daysPerWeek",
    options: [
      { value: "2_3", label: "2–3 days" },
      { value: "4_5", label: "4–5 days" },
      { value: "6_7", label: "6–7 days" },
    ],
  },
  {
    question: "What equipment do you have?",
    field: "equipment",
    options: [
      { value: "none",     label: "🏠 No equipment" },
      { value: "basic",    label: "🏋️ Dumbbells + bands" },
      { value: "full_gym", label: "🏟️ Full gym access" },
    ],
  },
  {
    question: "What's your biggest challenge?",
    field: "challenge",
    options: [
      { value: "motivation",  label: "😴 Staying motivated" },
      { value: "consistency", label: "📅 Staying consistent" },
      { value: "knowledge",   label: "🧠 Not sure what to do" },
      { value: "nutrition",   label: "🥗 Nutrition & eating" },
    ],
  },
];

function getRecommendedCourse(answers: Record<string, string>): string {
  if (answers.experienceLevel === "beginner" && answers.goal === "lose_fat") return "meal-planning";
  return "lifting-academy";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[step];

  function selectOption(value: string) {
    const newAnswers = { ...answers, [currentStep.field]: value };
    setAnswers(newAnswers);
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 300);
    } else {
      finishOnboarding(newAnswers);
    }
  }

  async function finishOnboarding(finalAnswers: Record<string, string>) {
    setLoading(true);
    const recommended = getRecommendedCourse(finalAnswers);
    await fetch("/api/portal/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...finalAnswers, recommendedCourse: recommended }),
    });
    setDone(true);
    setLoading(false);
  }

  if (done) {
    const recommended = getRecommendedCourse(answers);
    const courseLabel = recommended === "meal-planning" ? "The Clean Eating Mindset" : "Lifting Academy: Introduction";
    const courseHref = recommended === "meal-planning"
      ? "/portal/learn/meal-planning"
      : "/portal/learn/lifting-academy";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "var(--near-black)" }}>
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">🔥</div>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
            You&apos;re all set!
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--ash)" }}>
            Based on your goals, here&apos;s where we recommend starting:
          </p>
          <div className="p-5 mb-6 text-left" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>
              Start Here
            </p>
            <p className="text-base font-bold mb-3" style={{ color: "var(--soft-white)", fontFamily: "var(--font-display)" }}>
              {courseLabel}
            </p>
            <button onClick={() => router.push(courseHref)}
              className="w-full py-3 text-sm uppercase tracking-widest font-black"
              style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}>
              Start Now →
            </button>
          </div>
          <button onClick={() => router.push("/portal")} className="text-xs"
            style={{ color: "var(--ash)" }}>
            Skip for now, explore the portal
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--near-black)" }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--crimson)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--near-black)" }}>
      <div className="w-full max-w-md">
        <Image src="/images/primary-logo.svg" alt="BGSC" width={100} height={32} className="mx-auto mb-8 h-8 w-auto" />

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-colors"
              style={{ background: i === step ? "var(--crimson)" : i < step ? "rgba(143,0,0,0.4)" : "var(--border)" }} />
          ))}
        </div>

        <p className="text-xs uppercase tracking-widest mb-3 text-center"
          style={{ color: "var(--ash)", fontFamily: "var(--font-display)" }}>
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="text-xl font-black text-center mb-8"
          style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
          {currentStep.question}
        </h2>

        <div className="space-y-3">
          {currentStep.options.map(opt => (
            <button key={opt.value} onClick={() => selectOption(opt.value)}
              className="w-full px-5 py-4 text-sm text-left transition-all"
              style={{
                background: answers[currentStep.field] === opt.value ? "rgba(143,0,0,0.2)" : "var(--surface-1)",
                border: `1px solid ${answers[currentStep.field] === opt.value ? "var(--crimson)" : "var(--border)"}`,
                color: "var(--soft-white)",
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
