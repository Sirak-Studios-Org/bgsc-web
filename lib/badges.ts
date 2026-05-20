import { prisma } from "@/lib/db";

export const BADGE_DEFINITIONS = [
  { slug: "first-workout",     name: "First Workout",     iconEmoji: "💪", description: "Completed your first lesson", criteria: { type: "lessons_complete", threshold: 1 },  xpReward: 50,  tier: 1 },
  { slug: "ten-lessons",       name: "10 Lessons Done",   iconEmoji: "🏋️", description: "Completed 10 lessons",         criteria: { type: "lessons_complete", threshold: 10 }, xpReward: 100, tier: 1 },
  { slug: "week-warrior",      name: "Week Warrior",      iconEmoji: "🔥", description: "7-day streak achieved",        criteria: { type: "streak", threshold: 7 },            xpReward: 150, tier: 1 },
  { slug: "month-of-gains",    name: "Month of Gains",    iconEmoji: "📆", description: "30-day streak achieved",       criteria: { type: "streak", threshold: 30 },           xpReward: 300, tier: 2 },
  { slug: "bad-girl-committed",name: "Bad Girl Committed",iconEmoji: "⚡", description: "60-day streak achieved",       criteria: { type: "streak", threshold: 60 },           xpReward: 500, tier: 2 },
  { slug: "legend-status",     name: "Legend Status",     iconEmoji: "👑", description: "100-day streak achieved",      criteria: { type: "streak", threshold: 100 },          xpReward: 1000,tier: 3 },
  { slug: "course-complete",   name: "Course Complete",   iconEmoji: "🎓", description: "Completed a full course",      criteria: { type: "course_complete", threshold: 1 },   xpReward: 500, tier: 2 },
  { slug: "squad-leader",      name: "Squad Leader",      iconEmoji: "🦾", description: "Became a squad leader",        criteria: { type: "squad_leader", threshold: 1 },      xpReward: 200, tier: 1 },
];

export async function checkAndAwardBadges(userId: number) {
  const [completedCount, streakRecord, userBadges] = await Promise.all([
    prisma.lessonProgress.count({ where: { userId, status: "completed" } }),
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.userBadge.findMany({ where: { userId }, select: { badge: { select: { slug: true } } } }),
  ]);

  const earned = new Set(userBadges.map(ub => ub.badge.slug));
  const streak = streakRecord?.currentStreak ?? 0;
  let xpGained = 0;

  for (const def of BADGE_DEFINITIONS) {
    if (earned.has(def.slug)) continue;
    let qualifies = false;
    if (def.criteria.type === "lessons_complete" && completedCount >= def.criteria.threshold) qualifies = true;
    if (def.criteria.type === "streak" && streak >= def.criteria.threshold) qualifies = true;
    if (!qualifies) continue;

    const badge = await prisma.badge.upsert({
      where: { slug: def.slug },
      create: { slug: def.slug, name: def.name, description: def.description, iconEmoji: def.iconEmoji, criteria: JSON.stringify(def.criteria), xpReward: def.xpReward, tier: def.tier },
      update: {},
    });
    await prisma.userBadge.create({ data: { userId, badgeId: badge.id } }).catch(() => {});
    xpGained += def.xpReward;
  }

  if (xpGained > 0) {
    await prisma.userStreak.upsert({
      where: { userId },
      create: { userId, totalXp: xpGained },
      update: { totalXp: { increment: xpGained } },
    });
  }

  return xpGained;
}
