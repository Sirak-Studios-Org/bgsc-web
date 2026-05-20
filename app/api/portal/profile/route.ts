import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.userId;

  const [user, streak, earnedBadges, allBadges, totalLessons, recentActivity] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } }),
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.badge.findMany({ orderBy: [{ tier: "asc" }, { id: "asc" }] }),
    prisma.lessonProgress.count({ where: { userId, status: "completed" } }),
    prisma.lessonProgress.findMany({
      where: { userId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { lesson: { include: { course: true } } },
    }),
  ]);

  const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badgeId));

  const badges = allBadges.map((badge) => {
    const earned = earnedBadges.find((ub) => ub.badgeId === badge.id);
    return {
      badge,
      earned: earnedBadgeIds.has(badge.id),
      earnedAt: earned?.earnedAt ?? null,
    };
  });

  const activity = recentActivity.map((p) => ({
    lessonTitle: p.lesson.title,
    courseTitle: p.lesson.course.title,
    completedAt: p.completedAt,
  }));

  return NextResponse.json({
    user,
    streak: streak ?? {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      freezesAvailable: 1,
      totalXp: 0,
    },
    badges,
    stats: {
      totalLessons,
      totalXp: streak?.totalXp ?? 0,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
    },
    recentActivity: activity,
    plan: session.plan,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user });
}
