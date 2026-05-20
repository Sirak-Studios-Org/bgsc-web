import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const PLAN_REQUIRED: Record<string, string[]> = {
  "meal-planning":       ["club", "premium", "vip"],
  "lifting-academy":     ["club", "premium", "vip"],
  "get-coached":         ["premium", "vip"],
  "the-bad-girl-method": ["vip"],
  "my-workout":          ["club", "premium", "vip"],
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function widgetType(t: string) {
  const map: Record<string, string> = { Clip: "video", Text: "text", Timer: "timer", TextQuestions: "question" };
  return map[t] ?? "text";
}

function widgetContent(w: Record<string, unknown>): string {
  if (w.type === "Clip") {
    const asset = w.asset as Record<string, unknown> | undefined;
    return JSON.stringify({ videoUrl: asset?.url ?? "", videoKey: "" });
  }
  if (w.type === "Text") return JSON.stringify({ html: w.content ?? "" });
  if (w.type === "Timer") return JSON.stringify({ durationSeconds: w.duration_seconds ?? 0, label: w.label ?? "" });
  if (w.type === "TextQuestions") return JSON.stringify({ question: w.question ?? "" });
  return JSON.stringify({});
}

const BADGES = [
  { slug: "first-workout",     name: "First Workout",     description: "Completed your first lesson",      iconEmoji: "💪", criteria: '{"type":"lessons_complete","threshold":1}',  xpReward: 100, tier: 1 },
  { slug: "ten-lessons",       name: "Ten Lessons",       description: "Completed 10 lessons",             iconEmoji: "🔟", criteria: '{"type":"lessons_complete","threshold":10}', xpReward: 200, tier: 1 },
  { slug: "week-warrior",      name: "Week Warrior",      description: "7-day activity streak",            iconEmoji: "🔥", criteria: '{"type":"streak","threshold":7}',            xpReward: 300, tier: 2 },
  { slug: "month-of-gains",    name: "Month of Gains",    description: "30-day activity streak",           iconEmoji: "📅", criteria: '{"type":"streak","threshold":30}',           xpReward: 500, tier: 2 },
  { slug: "bad-girl-committed",name: "Bad Girl Committed",description: "Completed a full course",          iconEmoji: "🏆", criteria: '{"type":"course_complete","threshold":1}',   xpReward: 750, tier: 3 },
  { slug: "legend-status",     name: "Legend Status",     description: "Completed all published courses",  iconEmoji: "👑", criteria: '{"type":"all_courses","threshold":1}',        xpReward: 2000,tier: 3 },
  { slug: "course-complete",   name: "Course Complete",   description: "Earned a course certificate",      iconEmoji: "🎓", criteria: '{"type":"course_complete","threshold":1}',   xpReward: 500, tier: 2 },
  { slug: "squad-leader",      name: "Squad Leader",      description: "Leading your Bad Girl Squad",      iconEmoji: "⚡", criteria: '{"type":"squad_leader","threshold":1}',       xpReward: 400, tier: 2 },
];

const COMMUNITIES = [
  {
    name: "Bad Girls Forum", slug: "bad-girls-forum",
    description: "The main community for all BGSC members",
    planRequired: ["club", "premium", "vip"],
    canMessageEachOther: true, canMessageCreator: false, sortOrder: 0,
    channels: [
      { name: "General",              slug: "general",            description: "", sortOrder: 0 },
      { name: "Introductions",        slug: "introductions",      description: "", sortOrder: 1 },
      { name: "Progress Pics",        slug: "progress-pics",      description: "", sortOrder: 2 },
      { name: "Nutrition Chat",       slug: "nutrition-chat",     description: "", sortOrder: 3 },
      { name: "Workout Talk",         slug: "workout-talk",       description: "", sortOrder: 4 },
      { name: "Mindset & Motivation", slug: "mindset-motivation", description: "", sortOrder: 5 },
      { name: "Accountability",       slug: "accountability",     description: "", sortOrder: 6 },
      { name: "Wins & Celebrations",  slug: "wins-celebrations",  description: "", sortOrder: 7 },
    ],
  },
  {
    name: "VIPs Only", slug: "vips-only",
    description: "Exclusive space for VIP Coaching members",
    planRequired: ["vip"],
    canMessageEachOther: true, canMessageCreator: true, sortOrder: 1,
    channels: [
      { name: "VIP Lounge",       slug: "vip-lounge",        description: "", sortOrder: 0 },
      { name: "Ask Coach Stephie",slug: "ask-coach-stephie", description: "", sortOrder: 1 },
    ],
  },
];

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const dataDir = path.join(process.cwd(), "data");
  const courses: Record<string, unknown>[] = JSON.parse(fs.readFileSync(path.join(dataDir, "courses.json"), "utf8"));
  const lessonsMap: Record<string, { id: string; name: string; chapters: Record<string, unknown>[] }> =
    JSON.parse(fs.readFileSync(path.join(dataDir, "lessons.json"), "utf8"));

  const stats = { courses: 0, lessons: 0, widgets: 0, badges: 0, communities: 0, channels: 0 };

  // ── Courses + Lessons + Widgets ──────────────────────────────
  for (let ci = 0; ci < courses.length; ci++) {
    const c = courses[ci] as Record<string, unknown>;
    const courseSlug = slugify(c.name as string);
    const planRequired = PLAN_REQUIRED[courseSlug] ?? ["club", "premium", "vip"];

    const planRequiredJson = JSON.stringify(planRequired);
    const course = await prisma.course.upsert({
      where: { slug: courseSlug },
      update: { title: c.name as string, isPublished: true, planRequired: planRequiredJson, sortOrder: ci },
      create: {
        title: c.name as string,
        slug: courseSlug,
        description: (c.summary as string) ?? "",
        isPublished: true,
        planRequired: planRequiredJson,
        sortOrder: ci,
      },
    });
    stats.courses++;

    const lessonData = lessonsMap[c.id as string];
    if (!lessonData) continue;

    const chapters = lessonData.chapters as Record<string, unknown>[];
    for (let li = 0; li < chapters.length; li++) {
      const ch = chapters[li] as Record<string, unknown>;
      const lessonSlug = `${ci + 1}-${slugify(ch.name as string)}`.slice(0, 80);

      const lesson = await prisma.lesson.upsert({
        where: { courseId_slug: { courseId: course.id, slug: lessonSlug } },
        update: { title: ch.name as string, sortOrder: li, isPublished: true },
        create: {
          courseId: course.id,
          title: ch.name as string,
          slug: lessonSlug,
          lessonType: "video",
          sortOrder: li,
          isPublished: true,
          durationMinutes: 10,
        },
      });
      stats.lessons++;

      const chContent = ch.content as Record<string, unknown> | null;
      const widgetList = (chContent?.lessonWidgetsWithSigningUrls ?? []) as Record<string, unknown>[];
      const existingWidgets = await prisma.widget.count({ where: { lessonId: lesson.id } });
      if (existingWidgets === 0 && widgetList.length > 0) {
        await prisma.widget.createMany({
          data: widgetList.map((w, idx) => ({
            lessonId: lesson.id,
            type: widgetType(w.type as string),
            content: widgetContent(w),
            sortOrder: idx,
          })),
        });
        stats.widgets += widgetList.length;
      }
    }
  }

  // ── Badges ──────────────────────────────────────────────────
  for (const b of BADGES) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    stats.badges++;
  }

  // ── Communities + Channels ───────────────────────────────────
  for (const comm of COMMUNITIES) {
    const { channels, ...commData } = comm;
    const commJson = { ...commData, planRequired: JSON.stringify(commData.planRequired) };
    const community = await prisma.community.upsert({
      where: { slug: commData.slug },
      update: commJson,
      create: commJson,
    });
    stats.communities++;

    for (const ch of channels) {
      await prisma.channel.upsert({
        where: { communityId_slug: { communityId: community.id, slug: ch.slug } },
        update: ch,
        create: { ...ch, communityId: community.id },
      });
      stats.channels++;
    }
  }

  return NextResponse.json({ success: true, stats });
}
