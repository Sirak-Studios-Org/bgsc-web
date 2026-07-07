// Drip scheduling: a lesson with dripDays > 0 unlocks N days after the
// member joined (User.trialStart is set at signup and survives plan changes).

const DAY_MS = 24 * 60 * 60 * 1000;

export function dripUnlockDate(joinedAt: Date, dripDays: number): Date {
  return new Date(joinedAt.getTime() + dripDays * DAY_MS);
}

export function isDripLocked(joinedAt: Date, dripDays: number, now = new Date()): boolean {
  if (dripDays <= 0) return false;
  return now < dripUnlockDate(joinedAt, dripDays);
}

export function daysUntilUnlock(joinedAt: Date, dripDays: number, now = new Date()): number {
  const ms = dripUnlockDate(joinedAt, dripDays).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / DAY_MS));
}
