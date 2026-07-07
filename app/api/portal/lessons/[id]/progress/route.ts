import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Throttled watch-progress reports from the video player (10% milestones).
// watchPercent is monotonic max-so-far; a completed lesson is never downgraded.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const pct = Math.min(100, Math.max(0, Math.round(Number(body?.watchPercent))));
  if (!Number.isFinite(pct)) return NextResponse.json({ error: "Invalid percent" }, { status: 400 });

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.userId, lessonId } },
  });

  if (!existing) {
    await prisma.lessonProgress.create({
      data: { userId: session.userId, lessonId, status: "in_progress", watchPercent: pct },
    });
  } else if (existing.status !== "completed" && pct > existing.watchPercent) {
    await prisma.lessonProgress.update({
      where: { userId_lessonId: { userId: session.userId, lessonId } },
      data: { watchPercent: pct, status: "in_progress" },
    });
  }

  return NextResponse.json({ ok: true });
}
