import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const posts = await prisma.post.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { id: true, name: true } },
      channel: { include: { community: { select: { name: true } } } },
      _count: { select: { comments: { where: { deletedAt: null } }, reactions: true } },
    },
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      content: p.content,
      isPinned: p.isPinned,
      isAdminPost: p.isAdminPost,
      createdAt: p.createdAt,
      author: { id: p.author.id, name: p.author.name },
      channel: { id: p.channel.id, name: p.channel.name, slug: p.channel.slug },
      community: p.channel.community.name,
      commentCount: p._count.comments,
      reactionCount: p._count.reactions,
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const id = parseInt(body.postId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  const post = await prisma.post.update({
    where: { id },
    data: { isPinned: body.isPinned },
  });

  return NextResponse.json({ post });
}
