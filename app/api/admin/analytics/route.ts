import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/turso";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const db = await getDb();

    const [totalSignups, activeTrials, expiredTrials, todaySignups] = await Promise.all([
      db.execute(`SELECT COUNT(*) as n FROM users`),
      db.execute(`SELECT COUNT(*) as n FROM users WHERE trial_end > datetime('now') AND is_active = 1`),
      db.execute(`SELECT COUNT(*) as n FROM users WHERE trial_end <= datetime('now')`),
      db.execute(`SELECT COUNT(*) as n FROM users WHERE date(created_at) = date('now')`),
    ]);

    const [pageviews7d, ctaClicks7d, videoPlays7d, signups7d] = await Promise.all([
      db.execute(`SELECT COUNT(*) as n FROM events WHERE type='pageview' AND created_at >= datetime('now', '-7 days')`),
      db.execute(`SELECT COUNT(*) as n FROM events WHERE type='cta_click' AND created_at >= datetime('now', '-7 days')`),
      db.execute(`SELECT COUNT(*) as n FROM events WHERE type='video_play' AND created_at >= datetime('now', '-7 days')`),
      db.execute(`SELECT COUNT(*) as n FROM events WHERE type='signup' AND created_at >= datetime('now', '-7 days')`),
    ]);

    // Daily pageviews for the last 30 days
    const dailyViews = await db.execute(`
      SELECT date(created_at) as day, COUNT(*) as views
      FROM events WHERE type='pageview' AND created_at >= datetime('now', '-30 days')
      GROUP BY day ORDER BY day ASC
    `);

    // Event type breakdown last 30 days
    const eventBreakdown = await db.execute(`
      SELECT type, COUNT(*) as n FROM events
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY type ORDER BY n DESC
    `);

    // Top referrers last 30 days
    const topReferrers = await db.execute(`
      SELECT referrer, COUNT(*) as n FROM events
      WHERE created_at >= datetime('now', '-30 days') AND referrer IS NOT NULL AND referrer != ''
      GROUP BY referrer ORDER BY n DESC LIMIT 10
    `);

    const pv7 = Number((pageviews7d.rows[0]?.n ?? 0));
    const cta7 = Number((ctaClicks7d.rows[0]?.n ?? 0));
    const conversionRate = pv7 > 0 ? ((Number((signups7d.rows[0]?.n ?? 0)) / pv7) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      members: {
        total: Number(totalSignups.rows[0]?.n ?? 0),
        active: Number(activeTrials.rows[0]?.n ?? 0),
        expired: Number(expiredTrials.rows[0]?.n ?? 0),
        today: Number(todaySignups.rows[0]?.n ?? 0),
      },
      events7d: {
        pageviews: pv7,
        ctaClicks: cta7,
        videoPlays: Number((videoPlays7d.rows[0]?.n ?? 0)),
        signups: Number((signups7d.rows[0]?.n ?? 0)),
        conversionRate,
      },
      dailyViews: dailyViews.rows.map(r => ({ day: r.day, views: Number(r.views) })),
      eventBreakdown: eventBreakdown.rows.map(r => ({ type: r.type, n: Number(r.n) })),
      topReferrers: topReferrers.rows.map(r => ({ referrer: r.referrer, n: Number(r.n) })),
    });
  } catch (err) {
    console.error("[analytics]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
