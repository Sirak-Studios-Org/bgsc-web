import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import * as fs from "fs";
import { prisma } from "../lib/db";

const MANIFEST_PATH = path.join(__dirname, "..", "content", "manifest.json");

const PLAN_REQUIRED: Record<string, string[]> = {
  "meal-planning": ["club", "premium", "vip"],
  "lifting-academy": ["club", "premium", "vip"],
  "get-coached": ["premium", "vip"],
  "the-bad-girl-method": ["vip"],
  "my-workout": ["club", "premium", "vip"],
};

const BADGES = [
  { slug: "first-workout", name: "First Workout", description: "Completed your first lesson", iconEmoji: "💪", criteria: '{"type":"lessons_complete","threshold":1}', xpReward: 100, tier: 1 },
  { slug: "ten-lessons", name: "Ten Lessons", description: "Completed 10 lessons", iconEmoji: "🔟", criteria: '{"type":"lessons_complete","threshold":10}', xpReward: 200, tier: 1 },
  { slug: "week-warrior", name: "Week Warrior", description: "7-day activity streak", iconEmoji: "🔥", criteria: '{"type":"streak","threshold":7}', xpReward: 300, tier: 2 },
  { slug: "month-of-gains", name: "Month of Gains", description: "30-day activity streak", iconEmoji: "📅", criteria: '{"type":"streak","threshold":30}', xpReward: 500, tier: 2 },
  { slug: "bad-girl-committed", name: "Bad Girl Committed", description: "Completed a full course", iconEmoji: "🏆", criteria: '{"type":"course_complete","threshold":1}', xpReward: 750, tier: 3 },
  { slug: "legend-status", name: "Legend Status", description: "Completed all published courses", iconEmoji: "👑", criteria: '{"type":"all_courses","threshold":1}', xpReward: 2000, tier: 3 },
  { slug: "course-complete", name: "Course Complete", description: "Earned a course certificate", iconEmoji: "🎓", criteria: '{"type":"course_complete","threshold":1}', xpReward: 500, tier: 2 },
  { slug: "squad-leader", name: "Squad Leader", description: "Leading your Bad Girl Squad", iconEmoji: "⚡", criteria: '{"type":"squad_leader","threshold":1}', xpReward: 400, tier: 2 },
];

const COMMUNITIES = [
  {
    name: "Bad Girls Forum",
    slug: "bad-girls-forum",
    description: "",
    planRequired: ["club", "premium", "vip"],
    canMessageEachOther: true,
    canMessageCreator: false,
    sortOrder: 0,
    channels: [
      { name: "General", slug: "general", description: "", sortOrder: 0 },
      { name: "Introductions", slug: "introductions", description: "", sortOrder: 1 },
      { name: "Progress Pics", slug: "progress-pics", description: "", sortOrder: 2 },
      { name: "Nutrition Chat", slug: "nutrition-chat", description: "", sortOrder: 3 },
      { name: "Workout Talk", slug: "workout-talk", description: "", sortOrder: 4 },
      { name: "Mindset & Motivation", slug: "mindset-motivation", description: "", sortOrder: 5 },
      { name: "Accountability", slug: "accountability", description: "", sortOrder: 6 },
      { name: "Wins & Celebrations", slug: "wins-celebrations", description: "", sortOrder: 7 },
    ],
  },
  {
    name: "VIPs Only",
    slug: "vips-only",
    description: "",
    planRequired: ["vip"],
    canMessageEachOther: true,
    canMessageCreator: true,
    sortOrder: 1,
    channels: [
      { name: "VIP Lounge", slug: "vip-lounge", description: "", sortOrder: 0 },
      { name: "Ask Coach Stephie", slug: "ask-coach-stephie", description: "", sortOrder: 1 },
    ],
  },
];

function widgetContent(widget: Record<string, unknown>): string {
  switch (widget.type) {
    case "Clip":
      return JSON.stringify({ videoKey: widget.local_path ?? "", originalUrl: widget.original_url ?? "" });
    case "Text":
      return JSON.stringify({ html: widget.content ?? "" });
    case "Timer":
      return JSON.stringify({ durationSeconds: widget.duration_seconds ?? 0, label: widget.label ?? "" });
    case "TextQuestions":
      return JSON.stringify({ question: widget.question ?? "" });
    default:
      return JSON.stringify({});
  }
}

function widgetType(type: string): string {
  switch (type) {
    case "Clip": return "clip";
    case "Text": return "text";
    case "Timer": return "timer";
    case "TextQuestions": return "textquestion";
    default: return type.toLowerCase();
  }
}

async function seedCourses(manifest: Record<string, Record<string, unknown>>) {
  const courseEntries = Object.values(manifest);
  for (let ci = 0; ci < courseEntries.length; ci++) {
    const course = courseEntries[ci] as Record<string, unknown>;
    const slug = course.slug as string;
    const planRequired = PLAN_REQUIRED[slug] ?? [];
    const isPublished = (course.state as string) === "published";

    const upsertedCourse = await prisma.course.upsert({
      where: { slug },
      create: {
        slug,
        title: course.name as string,
        description: (course.summary as string) ?? "",
        coverImageKey: (course.cover_image as string) ?? null,
        sortOrder: ci,
        planRequired: JSON.stringify(planRequired),
        isPublished,
      },
      update: {
        title: course.name as string,
        description: (course.summary as string) ?? "",
        coverImageKey: (course.cover_image as string) ?? null,
        sortOrder: ci,
        planRequired: JSON.stringify(planRequired),
        isPublished,
      },
    });

    const lessons = (course.lessons as Record<string, unknown>[]) ?? [];
    for (let li = 0; li < lessons.length; li++) {
      const lesson = lessons[li];
      const lessonSlug = lesson.slug as string;

      const upsertedLesson = await prisma.lesson.upsert({
        where: { courseId_slug: { courseId: upsertedCourse.id, slug: lessonSlug } },
        create: {
          courseId: upsertedCourse.id,
          slug: lessonSlug,
          title: lesson.name as string,
          description: (lesson.summary as string) ?? "",
          coverImageKey: (lesson.local_thumb as string) ?? null,
          durationMinutes: (lesson.durationMinutes as number) ?? 0,
          sortOrder: li,
          isPublished: true,
          lessonType: (lesson.lessonType as string) ?? "lesson",
          completionXp: 50,
        },
        update: {
          title: lesson.name as string,
          description: (lesson.summary as string) ?? "",
          coverImageKey: (lesson.local_thumb as string) ?? null,
          durationMinutes: (lesson.durationMinutes as number) ?? 0,
          sortOrder: li,
          lessonType: (lesson.lessonType as string) ?? "lesson",
        },
      });

      await prisma.widget.deleteMany({ where: { lessonId: upsertedLesson.id } });

      const widgets = (lesson.widgets as Record<string, unknown>[]) ?? [];
      if (widgets.length > 0) {
        await prisma.widget.createMany({
          data: widgets.map((w, wi) => ({
            lessonId: upsertedLesson.id,
            type: widgetType(w.type as string),
            sortOrder: wi,
            content: widgetContent(w),
          })),
        });
      }

      console.log(`  Lesson ${li + 1}/${lessons.length}: ${lessonSlug} (${widgets.length} widgets)`);
    }

    console.log(`Course ${ci + 1}/${courseEntries.length}: ${slug} (${lessons.length} lessons)`);
  }
}

async function seedBadges() {
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      create: badge,
      update: badge,
    });
  }
  console.log(`Badges: ${BADGES.length} upserted`);
}

async function seedCommunities() {
  for (const community of COMMUNITIES) {
    const { channels, ...communityData } = community;

    const upsertedCommunity = await prisma.community.upsert({
      where: { slug: communityData.slug },
      create: {
        ...communityData,
        planRequired: JSON.stringify(communityData.planRequired),
      },
      update: {
        ...communityData,
        planRequired: JSON.stringify(communityData.planRequired),
      },
    });

    for (const channel of channels) {
      await prisma.channel.upsert({
        where: { communityId_slug: { communityId: upsertedCommunity.id, slug: channel.slug } },
        create: { ...channel, communityId: upsertedCommunity.id },
        update: { ...channel },
      });
    }

    console.log(`Community: ${communityData.slug} (${channels.length} channels)`);
  }
}

async function main() {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
  const manifest = JSON.parse(raw) as Record<string, Record<string, unknown>>;

  await seedCourses(manifest);
  await seedBadges();
  await seedCommunities();

  console.log("Seeding complete.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
