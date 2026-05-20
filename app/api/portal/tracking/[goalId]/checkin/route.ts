import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ goalId: string }> }) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goalId } = await params;
  const id = parseInt(goalId);

  const goal = await prisma.trackingGoal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { numericValue, boolValue, notes } = await req.json();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.checkIn.create({
    data: {
      goalId: id,
      userId: session.userId,
      checkinDate: today,
      numericValue: numericValue ?? null,
      boolValue: boolValue ?? null,
      notes: notes ?? null,
    },
  });

  const updated = await prisma.trackingGoal.findUnique({
    where: { id },
    include: {
      checkIns: {
        orderBy: { checkinDate: "desc" },
        take: 8,
      },
    },
  });

  return NextResponse.json({ goal: updated }, { status: 201 });
}
