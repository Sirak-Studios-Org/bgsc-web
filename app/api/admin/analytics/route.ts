import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const [totalSignups, activeTrials, expiredTrials, todaySignups] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { trialEnd: { gt: now }, isActive: true } }),
      prisma.user.count({ where: { trialEnd: { lte: now } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfToday, lt: startOfTomorrow } } }),
    ]);

    const [pageviews7d, ctaClicks7d, videoPlays7d, signups7d] = await Promise.all([
      prisma.event.count({ where: { type: "pageview", createdAt: { gte: sevenDaysAgo } } }),
      prisma.event.count({ where: { type: "cta_click", createdAt: { gte: sevenDaysAgo } } }),
      prisma.event.count({ where: { type: "video_play", createdAt: { gte: sevenDaysAgo } } }),
      prisma.event.count({ where: { type: "signup", createdAt: { gte: sevenDaysAgo } } }),
    ]);

    const dailyViewsRaw = await prisma.$queryRaw<{ day: Date; views: bigint }[]>`
      SELECT date_trunc('day', created_at) AS day, COUNT(*)::bigint AS views
      FROM events
      WHERE type = 'pageview' AND created_at >= ${thirtyDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `;
    const dailyViews = dailyViewsRaw.map((r) => ({
      day: r.day.toISOString().slice(0, 10),
      views: Number(r.views),
    }));

    const eventBreakdownRaw = await prisma.event.groupBy({
      by: ["type"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
      orderBy: { _count: { type: "desc" } },
    });
    const eventBreakdown = eventBreakdownRaw.map((r) => ({ type: r.type, n: r._count._all }));

    const topReferrersRaw = await prisma.event.groupBy({
      by: ["referrer"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        referrer: { not: null, notIn: [""] },
      },
      _count: { _all: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    });
    const topReferrers = topReferrersRaw.map((r) => ({ referrer: r.referrer, n: r._count._all }));

    const conversionRate = pageviews7d > 0
      ? ((signups7d / pageviews7d) * 100).toFixed(1)
      : "0.0";

    return NextResponse.json({
      members: {
        total: totalSignups,
        active: activeTrials,
        expired: expiredTrials,
        today: todaySignups,
      },
      events7d: {
        pageviews: pageviews7d,
        ctaClicks: ctaClicks7d,
        videoPlays: videoPlays7d,
        signups: signups7d,
        conversionRate,
      },
      dailyViews,
      eventBreakdown,
      topReferrers,
    });
  } catch (err) {
    console.error("[analytics]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
