import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") ?? "all";
    const search = searchParams.get("q") ?? "";

    const now = new Date();
    const where: Prisma.UserWhereInput = {};

    if (filter === "active") {
      where.trialEnd = { gt: now };
      where.isActive = true;
    } else if (filter === "expired") {
      where.trialEnd = { lte: now };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        trialStart: true,
        trialEnd: true,
        isActive: true,
        createdAt: true,
        subscription: { select: { plan: true, status: true, currentPeriodEnd: true } },
        streak: { select: { currentStreak: true, totalXp: true, lastActiveDate: true } },
        lessonProgress: { where: { status: "completed" }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const members = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      trial_start: u.trialStart,
      trial_end: u.trialEnd,
      is_active: u.isActive ? 1 : 0,
      created_at: u.createdAt,
      portal_stats: {
        plan: u.subscription?.plan ?? "trial",
        lessonsCompleted: u.lessonProgress.length,
        currentStreak: u.streak?.currentStreak ?? 0,
        totalXp: u.streak?.totalXp ?? 0,
        lastActive: u.streak?.lastActiveDate ?? null,
      },
    }));

    return NextResponse.json({ members });
  } catch {
    return NextResponse.json({ members: [] });
  }
}
