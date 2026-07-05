import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";
import { canAccess } from "@/lib/plans";
import type { MemberPayload } from "@/lib/auth";

// Verify the member's plan grants access to the channel's community.
// Returns null when allowed, or a NextResponse error when not.
async function gateChannel(channelId: number, session: MemberPayload): Promise<NextResponse | null> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: { community: { select: { planRequired: true } } },
  });
  if (!channel) return NextResponse.json({ error: "Channel not found." }, { status: 404 });
  if (!canAccess(session.plan, channel.community.planRequired)) {
    return NextResponse.json({ error: "Your plan doesn’t include this channel." }, { status: 403 });
  }
  return null;
}

type Ctx = { params: Promise<{ channelId: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { channelId } = await params;
  const id = parseInt(channelId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid channel." }, { status: 400 });

  const gate = await gateChannel(id, session);
  if (gate) return gate;

  const { searchParams } = req.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const [pinned, regular] = await Promise.all([
    prisma.post.findMany({
      where: { channelId: id, isPinned: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        reactions: true,
        _count: { select: { comments: { where: { deletedAt: null } } } },
      },
    }),
    prisma.post.findMany({
      where: { channelId: id, isPinned: false, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        author: { select: { id: true, name: true } },
        reactions: true,
        _count: { select: { comments: { where: { deletedAt: null } } } },
      },
    }),
  ]);

  function formatPost(p: typeof pinned[0]) {
    const reactionCounts: Record<string, number> = {};
    const userReactions: string[] = [];
    for (const r of p.reactions) {
      reactionCounts[r.type] = (reactionCounts[r.type] ?? 0) + 1;
      if (r.userId === session!.userId) userReactions.push(r.type);
    }
    return {
      id: p.id,
      content: p.content,
      isPinned: p.isPinned,
      isAdminPost: p.isAdminPost,
      createdAt: p.createdAt,
      author: { id: p.author.id, name: p.author.name },
      reactionCounts,
      userReactions,
      commentCount: p._count.comments,
    };
  }

  return NextResponse.json({
    posts: [...pinned.map(formatPost), ...regular.map(formatPost)],
  });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { channelId } = await params;
  const id = parseInt(channelId);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid channel." }, { status: 400 });

  const gate = await gateChannel(id, session);
  if (gate) return gate;

  const body = await req.json();
  const content = (body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Content required." }, { status: 400 });

  const post = await prisma.post.create({
    data: { channelId: id, authorId: session.userId, content },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ post }, { status: 201 });
}
