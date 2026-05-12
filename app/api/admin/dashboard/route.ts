import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const [total, active, expired, expiringSoon, today, emailPending] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { trialEnd: { gt: now }, isActive: true } }),
    prisma.user.count({ where: { trialEnd: { lte: now } } }),
    prisma.user.count({ where: { trialEnd: { gt: now, lte: twoDaysFromNow } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfToday, lt: startOfTomorrow } } }),
    prisma.emailQueue.count({ where: { status: "pending" } }),
  ]);

  return NextResponse.json({ total, active, expired, expiringSoon, today, emailPending });
}
