import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { publicUrl } from "@/lib/r2";

export default async function LearnPage() {
  const session = await getMemberSession();
  if (!session) redirect("/portal/login");

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    include: {
      lessons: {
        where: { isPublished: true },
        select: { id: true },
      },
    },
  });

  const completedByLesson = await prisma.lessonProgress.findMany({
    where: { userId: session.userId, status: "completed" },
    select: { lessonId: true },
  });
  const completedSet = new Set(completedByLesson.map(p => p.lessonId));

  const planRequired = (planJson: string) => {
    try { return JSON.parse(planJson) as string[]; } catch { return []; }
  };

  const planOrder: Record<string, number> = { trial: 0, club: 1, premium: 2, vip: 3 };
  const userPlanLevel = planOrder[session.plan] ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-black mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
        My Courses
      </h1>

      <div className="space-y-4">
        {courses.map(course => {
          const required = planRequired(course.planRequired);
          const isLocked = required.length > 0 && !required.some(p => planOrder[p] <= userPlanLevel);
          const totalLessons = course.lessons.length;
          const completedCount = course.lessons.filter(l => completedSet.has(l.id)).length;
          const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

          return (
            <Link key={course.id}
              href={isLocked ? "/portal/profile" : `/portal/learn/${course.slug}`}
              className="block overflow-hidden transition-opacity hover:opacity-90"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
              {/* Cover */}
              <div className="relative h-32 overflow-hidden" style={{ background: "var(--surface-2)" }}>
                {course.coverImageKey && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={publicUrl(course.coverImageKey)} alt={course.title}
                    className="w-full h-full object-cover" />
                )}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(13,13,13,0.7)" }}>
                    <span className="text-2xl">🔒</span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-sm font-bold" style={{ fontFamily: "var(--font-display)", color: isLocked ? "var(--ash)" : "var(--soft-white)" }}>
                    {course.title}
                  </h2>
                  {isLocked && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 ml-2 shrink-0"
                      style={{ background: "rgba(143,0,0,0.15)", color: "var(--crimson)", border: "1px solid var(--crimson)" }}>
                      Upgrade
                    </span>
                  )}
                </div>
                {!isLocked && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: "var(--ash)" }}>
                        {completedCount} / {totalLessons} lessons
                      </span>
                      <span className="text-xs font-bold" style={{ color: pct === 100 ? "var(--crimson)" : "var(--ash)" }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: "var(--crimson)" }} />
                    </div>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
