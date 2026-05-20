import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recordActivity } from "@/lib/streaks";
import { checkAndAwardBadges } from "@/lib/badges";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lessonId = parseInt(id);

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.userId, lessonId } },
    create: { userId: session.userId, lessonId, status: "completed", watchPercent: 100, completedAt: new Date() },
    update: { status: "completed", watchPercent: 100, completedAt: new Date() },
  });

  // Award XP
  await prisma.userStreak.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, totalXp: lesson.completionXp },
    update: { totalXp: { increment: lesson.completionXp } },
  });

  // Record streak activity
  await recordActivity(session.userId);

  // Check badges
  const xpFromBadges = await checkAndAwardBadges(session.userId);

  return NextResponse.json({ success: true, xpAwarded: lesson.completionXp + xpFromBadges });
}
