import { getMemberSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";

const PLAN_LABELS: Record<string, string> = {
  club: "Club Member",
  premium: "Premium Member",
  vip: "VIP Member",
  trial: "Trial Member",
  free: "Free",
};

async function getProfileData(userId: number) {
  const [user, streak, earnedBadges, allBadges, totalLessons, recentActivity] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } }),
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.badge.findMany({ orderBy: [{ tier: "asc" }, { id: "asc" }] }),
    prisma.lessonProgress.count({ where: { userId, status: "completed" } }),
    prisma.lessonProgress.findMany({
      where: { userId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { lesson: { include: { course: true } } },
    }),
  ]);

  const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badgeId));

  return {
    user,
    streak,
    allBadges,
    earnedBadges,
    earnedBadgeIds,
    totalLessons,
    recentActivity,
  };
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return (
    <div style={{
      width: 72,
      height: 72,
      borderRadius: "50%",
      background: "var(--crimson)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 26,
      fontWeight: 900,
      fontFamily: "var(--font-display)",
      color: "#fff",
      letterSpacing: "0.05em",
      flexShrink: 0,
    }}>
      {initials.toUpperCase()}
    </div>
  );
}

export default async function ProfilePage() {
  const session = await getMemberSession();
  if (!session) redirect("/portal/login");

  const { user, streak, allBadges, earnedBadges, earnedBadgeIds, totalLessons, recentActivity } =
    await getProfileData(session.userId);

  if (!user) redirect("/portal/login");

  const stats = [
    { label: "Current Streak", value: `${streak?.currentStreak ?? 0}🔥` },
    { label: "Longest Streak", value: `${streak?.longestStreak ?? 0}` },
    { label: "Total XP", value: `${streak?.totalXp ?? 0}` },
    { label: "Lessons", value: `${totalLessons}` },
  ];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <Initials name={user.name} />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--soft-white)", marginBottom: 4 }}>
            {user.name}
          </h1>
          <p style={{ fontSize: 13, color: "var(--ash)", marginBottom: 8 }}>{user.email}</p>
          <span style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "3px 10px",
            background: "var(--crimson)",
            color: "#fff",
            fontFamily: "var(--font-display)",
          }}>
            {PLAN_LABELS[session.plan] ?? session.plan}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            padding: "12px 8px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 20, fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
              {value}
            </p>
            <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ash)", marginTop: 4, fontFamily: "var(--font-display)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)", marginBottom: 14 }}>
          Badges
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {allBadges.length === 0 ? (
            <p style={{ color: "var(--ash)", fontSize: 13, gridColumn: "1/-1" }}>No badges yet.</p>
          ) : (
            allBadges.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id);
              return (
                <div key={badge.id} style={{
                  background: "var(--surface-1)",
                  border: `1px solid ${earned ? "var(--crimson)" : "var(--border)"}`,
                  padding: "12px 8px",
                  textAlign: "center",
                  opacity: earned ? 1 : 0.4,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>
                    {earned ? badge.iconEmoji : "?"}
                  </div>
                  <p style={{
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: earned ? "var(--soft-white)" : "var(--ash)",
                    fontFamily: "var(--font-display)",
                    lineHeight: 1.3,
                  }}>
                    {badge.name}
                  </p>
                  {earned && (
                    <p style={{ fontSize: 8, color: "var(--crimson)", marginTop: 2 }}>
                      +{badge.xpReward} XP
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
        {earnedBadges.length === 0 && allBadges.length > 0 && (
          <p style={{ fontSize: 12, color: "var(--ash)", marginTop: 10 }}>
            Complete lessons to earn your first badge.
          </p>
        )}
      </div>

      {recentActivity.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)", marginBottom: 14 }}>
            Activity History
          </p>
          <div>
            {recentActivity.map((p, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <div>
                  <p style={{ fontSize: 13, color: "var(--soft-white)" }}>{p.lesson.title}</p>
                  <p style={{ fontSize: 11, color: "var(--ash)", marginTop: 2 }}>{p.lesson.course.title}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--crimson)" }}>✓</span>
                  {p.completedAt && (
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                      {new Date(p.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/portal/profile/settings"
        style={{
          display: "block",
          width: "100%",
          padding: "12px 0",
          textAlign: "center",
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          color: "var(--soft-white)",
          fontFamily: "var(--font-display)",
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          textDecoration: "none",
          boxSizing: "border-box",
        }}
      >
        Settings →
      </Link>
    </div>
  );
}
