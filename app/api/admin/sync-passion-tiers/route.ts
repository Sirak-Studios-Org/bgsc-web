import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

interface PassionMember {
  email: string;
  name: string;
  tier: "vip" | "premium" | "club" | "free";
  plan_name: string;
  status: "active" | "complimentary" | "free";
  joined_at: string;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { members } = (await req.json().catch(() => ({}))) as { members?: PassionMember[] };
  if (!Array.isArray(members) || members.length === 0) {
    return NextResponse.json({ error: "members array required" }, { status: 400 });
  }

  const results: { email: string; action: string; tier?: string }[] = [];

  for (const m of members) {
    const user = await prisma.user.findUnique({
      where: { email: m.email.toLowerCase() },
      include: { subscription: true },
    });

    if (!user) {
      results.push({ email: m.email, action: "not_found" });
      continue;
    }

    // Determine subscription plan + status
    const plan = m.tier === "free" ? "club" : m.tier; // keep free members on club (lowest paid)
    const subStatus = m.status === "active" ? "active" : "active"; // complimentary also gets active access

    // Set joined_at as trialStart if we have it and it's earlier
    const joinDate = m.joined_at ? new Date(m.joined_at) : null;

    if (user.subscription) {
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          plan,
          status: subStatus,
          ...(joinDate && { currentPeriodEnd: new Date(joinDate.getFullYear() + 1, joinDate.getMonth(), joinDate.getDate()) }),
        },
      });
      results.push({ email: m.email, action: "updated", tier: plan });
    } else {
      const currentPeriodEnd = joinDate
        ? new Date(joinDate.getFullYear() + 1, joinDate.getMonth(), joinDate.getDate())
        : new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate());

      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan,
          status: subStatus,
          currentPeriodEnd,
        },
      });
      results.push({ email: m.email, action: "created", tier: plan });
    }

    // Update trialStart from Passion join date if earlier than current
    if (joinDate) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          trialStart: user.trialStart && user.trialStart < joinDate ? user.trialStart : joinDate,
          trialEnd: new Date(joinDate.getFullYear() + 1, joinDate.getMonth(), joinDate.getDate()),
          isActive: true,
        },
      });
    }
  }

  const updated = results.filter((r) => r.action === "updated").length;
  const created = results.filter((r) => r.action === "created").length;
  const notFound = results.filter((r) => r.action === "not_found").length;

  return NextResponse.json({ updated, created, not_found: notFound, results });
}
