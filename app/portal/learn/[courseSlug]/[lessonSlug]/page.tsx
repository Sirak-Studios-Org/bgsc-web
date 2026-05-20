import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import LessonPlayer from "@/components/portal/LessonPlayer";

export default async function LessonPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  const session = await getMemberSession();
  if (!session) redirect("/portal/login");

  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug, isPublished: true, course: { slug: courseSlug } },
    include: {
      course: true,
      widgets: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!lesson) notFound();

  // Get current progress
  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.userId, lessonId: lesson.id } },
  });

  // Get next lesson
  const nextLesson = await prisma.lesson.findFirst({
    where: { courseId: lesson.courseId, isPublished: true, sortOrder: { gt: lesson.sortOrder } },
    orderBy: { sortOrder: "asc" },
  });

  // Get journal history for each textquestion widget
  const widgetIds = lesson.widgets.filter(w => w.type === "textquestion").map(w => w.id);
  const journalHistory = widgetIds.length > 0 ? await prisma.journalEntry.findMany({
    where: { userId: session.userId, widgetId: { in: widgetIds } },
    orderBy: { entryDate: "desc" },
  }) : [];

  const historyByWidget: Record<number, typeof journalHistory> = {};
  for (const entry of journalHistory) {
    if (!historyByWidget[entry.widgetId]) historyByWidget[entry.widgetId] = [];
    historyByWidget[entry.widgetId].push(entry);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:px-8">
      <Link href={`/portal/learn/${courseSlug}`}
        className="text-xs uppercase tracking-widest mb-4 block"
        style={{ color: "var(--ash)", fontFamily: "var(--font-display)" }}>
        ← {lesson.course.title}
      </Link>

      <h1 className="text-xl font-black mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
        {lesson.title}
      </h1>

      <LessonPlayer
        lesson={{ id: lesson.id, title: lesson.title, courseSlug, slug: lessonSlug }}
        widgets={lesson.widgets.map(w => ({ id: w.id, type: w.type, sortOrder: w.sortOrder, content: w.content }))}
        isCompleted={progress?.status === "completed"}
        nextLesson={nextLesson ? { title: nextLesson.title, slug: nextLesson.slug, courseSlug } : null}
        journalHistory={historyByWidget}
      />
    </div>
  );
}
