import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";

const planOrder: Record<string, number> = { free: 0, trial: 1, club: 2, premium: 3, vip: 4 };

export async function GET() {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const communities = await prisma.community.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      channels: {
        orderBy: { sortOrder: "asc" },
        include: {
          posts: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { author: { select: { name: true } } },
          },
        },
      },
    },
  });

  const userPlanRank = planOrder[session.plan] ?? 0;

  const result = communities.map((c) => {
    const required: string[] = JSON.parse(c.planRequired);
    const hasAccess =
      required.length === 0 ||
      required.some((p) => (planOrder[p] ?? 99) <= userPlanRank);

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      planRequired: required,
      hasAccess,
      channels: hasAccess
        ? c.channels.map((ch) => ({
            id: ch.id,
            name: ch.name,
            slug: ch.slug,
            description: ch.description,
            lastPost: ch.posts[0]
              ? {
                  content: ch.posts[0].content,
                  authorName: ch.posts[0].author.name,
                  createdAt: ch.posts[0].createdAt,
                }
              : null,
          }))
        : [],
    };
  });

  return NextResponse.json({ communities: result });
}
