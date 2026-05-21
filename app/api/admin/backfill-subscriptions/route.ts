import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // Find all users with no subscription record
  const users = await prisma.user.findMany({
    where: { subscription: null },
    select: { id: true, trialEnd: true },
  });

  if (users.length === 0) {
    return NextResponse.json({ created: 0, message: "All members already have subscriptions." });
  }

  const now = new Date();
  const oneYearOut = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  await prisma.subscription.createMany({
    data: users.map((u) => ({
      userId: u.id,
      plan: "club",
      status: "active",
      currentPeriodEnd: u.trialEnd > now ? u.trialEnd : oneYearOut,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ created: users.length, message: `Created club subscriptions for ${users.length} members.` });
}
