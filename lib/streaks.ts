import { prisma } from "@/lib/db";

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function recordActivity(userId: number) {
  const today = toDateOnly(new Date());
  const existing = await prisma.userStreak.findUnique({ where: { userId } });

  if (!existing) {
    await prisma.userStreak.create({ data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: new Date(), freezesAvailable: 1 } });
    return;
  }

  if (existing.lastActiveDate && toDateOnly(existing.lastActiveDate) === today) return; // already logged today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = existing.lastActiveDate && toDateOnly(existing.lastActiveDate) === toDateOnly(yesterday);

  const newStreak = wasYesterday ? existing.currentStreak + 1 : 1;
  await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, existing.longestStreak),
      lastActiveDate: new Date(),
    },
  });
}

export async function useFreeze(userId: number): Promise<boolean> {
  const streak = await prisma.userStreak.findUnique({ where: { userId } });
  if (!streak || streak.freezesAvailable < 1) return false;
  await prisma.userStreak.update({
    where: { userId },
    data: { freezesAvailable: { decrement: 1 }, freezesUsedThisWeek: { increment: 1 } },
  });
  return true;
}
