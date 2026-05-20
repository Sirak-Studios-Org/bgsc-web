import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.trackingGoal.findMany({
    where: { userId: session.userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      checkIns: {
        orderBy: { checkinDate: "desc" },
        take: 8,
      },
    },
  });

  return NextResponse.json({ goals });
}

export async function POST(req: NextRequest) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, type, unit, cadence } = await req.json();
  if (!name || !type || !cadence) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const count = await prisma.trackingGoal.count({ where: { userId: session.userId } });

  const goal = await prisma.trackingGoal.create({
    data: {
      userId: session.userId,
      name,
      type,
      unit: unit ?? "",
      cadence,
      sortOrder: count,
    },
    include: {
      checkIns: {
        orderBy: { checkinDate: "desc" },
        take: 8,
      },
    },
  });

  return NextResponse.json({ goal }, { status: 201 });
}
