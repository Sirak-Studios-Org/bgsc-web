import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";

type Ctx = { params: Promise<{ postId: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { postId } = await params;
  const id = parseInt(postId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  const body = await req.json();
  const type = body.type as string;
  const validTypes = ["heart", "fire", "flex", "cheer", "strong"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid reaction type." }, { status: 400 });
  }

  const existing = await prisma.postReaction.findFirst({
    where: { postId: id, userId: session.userId, type },
  });

  if (existing) {
    await prisma.postReaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ action: "removed" });
  }

  await prisma.postReaction.create({
    data: { postId: id, userId: session.userId, type },
  });

  return NextResponse.json({ action: "added" });
}
