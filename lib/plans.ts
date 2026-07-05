// Single source of truth for membership plan ranking + access gating.
// Previously duplicated (and divergent) in learn/community pages.

export const PLAN_RANK: Record<string, number> = {
  free: 0,
  trial: 1,
  club: 2,
  premium: 3,
  vip: 4,
};

export function planRank(plan: string | null | undefined): number {
  if (!plan) return 0;
  return PLAN_RANK[plan] ?? 0;
}

/**
 * Parse a planRequired value (stored as a JSON string array in TEXT columns,
 * or already an array) into a normalized list of plan slugs.
 */
export function parsePlanRequired(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * A member can access content when it requires no plan, or when their plan
 * rank meets or exceeds the LOWEST required plan (e.g. ["club","premium","vip"]
 * means club-and-above).
 */
export function canAccess(userPlan: string | null | undefined, planRequired: unknown): boolean {
  const required = parsePlanRequired(planRequired);
  if (required.length === 0) return true;
  const userRank = planRank(userPlan);
  const minRequired = Math.min(...required.map((p) => planRank(p)));
  return userRank >= minRequired;
}
