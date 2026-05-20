import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { goal, experienceLevel, daysPerWeek, equipment, challenge, recommendedCourse } = body;

  await prisma.onboardingResponse.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, goal, experienceLevel, daysPerWeek, equipment, challenge, recommendedCourse: recommendedCourse ?? null },
    update: { goal, experienceLevel, daysPerWeek, equipment, challenge, recommendedCourse: recommendedCourse ?? null },
  });

  // Initialize streak record if not exists
  await prisma.userStreak.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId },
    update: {},
  });

  return NextResponse.json({ success: true });
}
