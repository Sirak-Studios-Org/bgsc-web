import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";

type Ctx = { params: Promise<{ postId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { postId } = await params;
  const id = parseInt(postId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { postId: id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: { id: c.author.id, name: c.author.name },
    })),
  });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { postId } = await params;
  const id = parseInt(postId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  const body = await req.json();
  const content = (body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Content required." }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { postId: id, authorId: session.userId, content },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
