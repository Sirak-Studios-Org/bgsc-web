import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getDashboardData(userId: number) {
  const [streak, recentProgress, trackingGoals] = await Promise.all([
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.lessonProgress.findMany({
      where: { userId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: { lesson: { include: { course: true } } },
    }),
    prisma.trackingGoal.findMany({ where: { userId }, take: 2 }),
  ]);

  // Find the next lesson to continue
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    include: { lessons: { where: { isPublished: true }, orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const completedIds = new Set(recentProgress.map(p => p.lessonId));
  let nextLesson = null;
  for (const course of courses) {
    const allLessons = await prisma.lesson.findMany({
      where: { courseId: course.id, isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
    const next = allLessons.find(l => !completedIds.has(l.id));
    if (next) { nextLesson = { ...next, course }; break; }
  }

  const totalCompleted = await prisma.lessonProgress.count({ where: { userId, status: "completed" } });
  const badges = await prisma.userBadge.count({ where: { userId } });

  return { streak, nextLesson, recentProgress, totalCompleted, badges, trackingGoals };
}

export default async function PortalHome() {
  const session = await getMemberSession();
  if (!session) redirect("/portal/login");

  const data = await getDashboardData(session.userId);
  const { streak, nextLesson, recentProgress, totalCompleted, badges } = data;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>
          Welcome back
        </p>
        <h1 className="text-2xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
          {session.name.split(" ")[0]} 🔥
        </h1>
      </div>

      {/* Streak Banner */}
      <div className="flex items-center justify-between p-4 mb-6"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div>
          <p className="text-3xl font-black" style={{ fontFamily: "var(--font-display)", color: streak?.currentStreak ? "var(--crimson)" : "var(--ash)" }}>
            🔥 {streak?.currentStreak ?? 0}
          </p>
          <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "var(--ash)", fontFamily: "var(--font-display)" }}>
            Day Streak
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--ash)" }}>
            ❄️ {streak?.freezesAvailable ?? 1} freeze{streak?.freezesAvailable !== 1 ? "s" : ""} available
          </p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Best: {streak?.longestStreak ?? 0} days
          </p>
        </div>
      </div>

      {/* Continue pill */}
      {nextLesson ? (
        <div className="mb-6 p-4" style={{ background: "rgba(143,0,0,0.1)", border: "1px solid var(--crimson)" }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>
            Continue →
          </p>
          <Link href={`/portal/learn/${nextLesson.course.slug}/${nextLesson.slug}`}
            className="text-base font-bold hover:opacity-80 transition-opacity"
            style={{ color: "var(--soft-white)", fontFamily: "var(--font-display)" }}>
            {nextLesson.title}
          </Link>
          <p className="text-xs mt-1" style={{ color: "var(--ash)" }}>
            {nextLesson.course.title} · {nextLesson.durationMinutes > 0 ? `${nextLesson.durationMinutes} min` : ""}
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--ash)" }}>You&apos;re all caught up! 🎉</p>
          <Link href="/portal/learn" className="text-xs uppercase tracking-widest mt-2 block"
            style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>Browse all courses →</Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Lessons done", value: totalCompleted },
          { label: "XP earned", value: streak?.totalXp ?? 0 },
          { label: "Badges", value: badges },
        ].map(({ label, value }) => (
          <div key={label} className="p-4 text-center" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-2xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
              {value}
            </p>
            <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--ash)", fontFamily: "var(--font-display)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/portal/learn"
          className="p-4 flex flex-col gap-2 hover:opacity-80 transition-opacity"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <span className="text-xl">📚</span>
          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
            My Courses
          </span>
        </Link>
        <Link href="/portal/community"
          className="p-4 flex flex-col gap-2 hover:opacity-80 transition-opacity"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <span className="text-xl">👊</span>
          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
            Community
          </span>
        </Link>
        <Link href="/portal/tracking"
          className="p-4 flex flex-col gap-2 hover:opacity-80 transition-opacity"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <span className="text-xl">📊</span>
          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
            Tracking
          </span>
        </Link>
        <Link href="/portal/profile"
          className="p-4 flex flex-col gap-2 hover:opacity-80 transition-opacity"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <span className="text-xl">⚡</span>
          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
            Profile
          </span>
        </Link>
      </div>

      {/* Recent activity */}
      {recentProgress.length > 0 && (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.3em] mb-4"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
            Recent Activity
          </p>
          <div className="space-y-2">
            {recentProgress.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="text-xs" style={{ color: "var(--soft-white)" }}>{p.lesson.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--ash)" }}>{p.lesson.course.title}</p>
                </div>
                <span className="text-xs" style={{ color: "var(--crimson)" }}>✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
