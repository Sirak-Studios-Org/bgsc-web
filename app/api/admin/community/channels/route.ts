import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const channels = await prisma.channel.findMany({
    orderBy: [{ community: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      community: { select: { name: true } },
      _count: { select: { posts: { where: { deletedAt: null } } } },
    },
  });

  return NextResponse.json({
    channels: channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      slug: ch.slug,
      description: ch.description,
      communityName: ch.community.name,
      postCount: ch._count.posts,
    })),
  });
}
