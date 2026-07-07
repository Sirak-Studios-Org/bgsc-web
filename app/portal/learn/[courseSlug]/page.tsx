import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { publicUrl } from "@/lib/r2";
import { canAccess } from "@/lib/plans";
import { isDripLocked, daysUntilUnlock } from "@/lib/drip";
import { CheckCircle, PlayCircle, Lock } from "lucide-react";

export default async function CourseDetail({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const session = await getMemberSession();
  if (!session) redirect("/portal/login");

  const [course, user] = await Promise.all([
    prisma.course.findUnique({
      where: { slug: courseSlug, isPublished: true },
      include: { lessons: { where: { isPublished: true }, orderBy: { sortOrder: "asc" } } },
    }),
    prisma.user.findUnique({ where: { id: session.userId }, select: { trialStart: true } }),
  ]);
  if (!course) notFound();
  const joinedAt = user?.trialStart ?? new Date(0);

  // Enforce plan gating server-side.
  if (!canAccess(session.plan, course.planRequired)) {
    redirect(`/portal/learn?locked=${encodeURIComponent(courseSlug)}`);
  }

  const lessonIds = new Set(course.lessons.map(l => l.id));
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.userId, lessonId: { in: [...lessonIds] } },
    select: { lessonId: true, status: true },
  });
  const progressMap = new Map(progress.map(p => [p.lessonId, p.status]));

  const completedCount = progress.filter(p => p.status === "completed").length;
  const pct = course.lessons.length > 0 ? Math.round((completedCount / course.lessons.length) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8">
      {/* Back */}
      <Link href="/portal/learn" className="text-xs uppercase tracking-widest mb-6 block"
        style={{ color: "var(--ash)", fontFamily: "var(--font-display)" }}>
        ← All Courses
      </Link>

      {/* Cover */}
      <div className="relative h-40 mb-6 overflow-hidden" style={{ background: "var(--surface-2)" }}>
        {course.coverImageKey && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={publicUrl(course.coverImageKey)} alt={course.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4"
          style={{ background: "linear-gradient(transparent, rgba(13,13,13,0.95))" }}>
          <h1 className="text-xl font-black" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
            {course.title}
          </h1>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 p-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", color: "var(--ash)" }}>
            Progress
          </span>
          <span className="text-xs font-bold" style={{ color: pct === 100 ? "var(--crimson)" : "var(--soft-white)" }}>
            {completedCount} / {course.lessons.length} · {pct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--crimson)" }} />
        </div>
      </div>

      {/* Chapter list */}
      <div className="space-y-2">
        {course.lessons.map((lesson, idx) => {
          const status = progressMap.get(lesson.id) ?? "not_started";
          const isCompleted = status === "completed";
          const dripped = isDripLocked(joinedAt, lesson.dripDays);

          const inner = (
            <>
              {lesson.coverImageKey && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicUrl(lesson.coverImageKey)} alt=""
                  className="w-14 h-14 object-cover shrink-0"
                  style={{ opacity: dripped ? 0.4 : 1 }} />
              )}
              <div className="shrink-0">
                {dripped ? (
                  <Lock size={20} style={{ color: "rgba(255,255,255,0.25)" }} />
                ) : isCompleted ? (
                  <CheckCircle size={20} style={{ color: "var(--crimson)" }} />
                ) : (
                  <PlayCircle size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate"
                  style={{ color: dripped ? "rgba(255,255,255,0.35)" : isCompleted ? "var(--ash)" : "var(--soft-white)", fontFamily: "var(--font-display)" }}>
                  {idx + 1}. {lesson.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {dripped
                    ? `Unlocks in ${daysUntilUnlock(joinedAt, lesson.dripDays)} day${daysUntilUnlock(joinedAt, lesson.dripDays) === 1 ? "" : "s"}`
                    : lesson.durationMinutes > 0 ? `${lesson.durationMinutes} min` : null}
                </p>
              </div>
            </>
          );

          if (dripped) {
            return (
              <div key={lesson.id} className="flex items-center gap-4 p-4 cursor-not-allowed"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border)", opacity: 0.75 }}>
                {inner}
              </div>
            );
          }

          return (
            <Link key={lesson.id}
              href={`/portal/learn/${courseSlug}/${lesson.slug}`}
              className="flex items-center gap-4 p-4 transition-colors hover:opacity-80"
              style={{ background: "var(--surface-1)", border: `1px solid ${isCompleted ? "rgba(143,0,0,0.3)" : "var(--border)"}` }}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
