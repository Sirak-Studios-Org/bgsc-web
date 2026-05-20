import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";

type Ctx = { params: Promise<{ postId: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { postId } = await params;
  const id = parseInt(postId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (post.authorId !== session.userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });

  return NextResponse.json({ ok: true });
}
