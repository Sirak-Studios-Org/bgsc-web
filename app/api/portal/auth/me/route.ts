import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const streak = await prisma.userStreak.findUnique({ where: { userId: session.userId } });
  const badgeCount = await prisma.userBadge.count({ where: { userId: session.userId } });
  const completedCount = await prisma.lessonProgress.count({ where: { userId: session.userId, status: "completed" } });

  return NextResponse.json({
    ...session,
    currentStreak: streak?.currentStreak ?? 0,
    totalXp: streak?.totalXp ?? 0,
    badgeCount,
    completedLessons: completedCount,
  });
}
