import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

type Ctx = { params: Promise<{ postId: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { postId } = await params;
  const id = parseInt(postId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
