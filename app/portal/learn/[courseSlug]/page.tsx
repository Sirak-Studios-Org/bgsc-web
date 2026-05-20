import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { publicUrl } from "@/lib/r2";
import { CheckCircle, PlayCircle } from "lucide-react";

export default async function CourseDetail({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const session = await getMemberSession();
  if (!session) redirect("/portal/login");

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug, isPublished: true },
    include: { lessons: { where: { isPublished: true }, orderBy: { sortOrder: "asc" } } },
  });
  if (!course) notFound();

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.userId },
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
          return (
            <Link key={lesson.id}
              href={`/portal/learn/${courseSlug}/${lesson.slug}`}
              className="flex items-center gap-4 p-4 transition-colors hover:opacity-80"
              style={{ background: "var(--surface-1)", border: `1px solid ${isCompleted ? "rgba(143,0,0,0.3)" : "var(--border)"}` }}>
              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle size={20} style={{ color: "var(--crimson)" }} />
                ) : (
                  <PlayCircle size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate"
                  style={{ color: isCompleted ? "var(--ash)" : "var(--soft-white)", fontFamily: "var(--font-display)" }}>
                  {idx + 1}. {lesson.title}
                </p>
                {lesson.durationMinutes > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {lesson.durationMinutes} min
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
