import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ goalId: string }> }) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goalId } = await params;
  const id = parseInt(goalId);

  const goal = await prisma.trackingGoal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.checkIn.deleteMany({ where: { goalId: id } });
  await prisma.trackingGoal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
