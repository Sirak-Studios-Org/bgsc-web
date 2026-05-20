import { NextRequest, NextResponse } from "next/server";
import { stripe, priceIdToPlan } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { signMemberToken, MEMBER_COOKIE } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    if (!session || session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
    }

    const email = session.customer_details?.email ?? "";
    const name = session.customer_details?.name ?? session.metadata?.name ?? "";
    const sub = session.subscription as import("stripe").Stripe.Subscription;
    const priceId = sub.items.data[0]?.price.id ?? "";
    const plan = priceIdToPlan(priceId);
    const periodEnd = sub.items.data[0]?.current_period_end ?? Math.floor(Date.now() / 1000) + 2592000;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const hash = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
      user = await prisma.user.create({ data: { email, name, passwordHash: hash, trialEnd: new Date(periodEnd * 1000) } });
    }

    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, stripeSubscriptionId: sub.id, stripePriceId: priceId, stripeCustomerId: sub.customer as string, plan, status: "active", currentPeriodEnd: new Date(periodEnd * 1000) },
      update: { plan, status: "active", currentPeriodEnd: new Date(periodEnd * 1000) },
    });

    const onboarding = await prisma.onboardingResponse.findUnique({ where: { userId: user.id } });
    const token = signMemberToken({ userId: user.id, email: user.email, name: user.name, plan: plan as "club" | "premium" | "vip" | "trial" | "free", planExpiry: new Date(periodEnd * 1000).toISOString(), onboardingComplete: !!onboarding });

    const res = NextResponse.json({ success: true });
    res.cookies.set(MEMBER_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (err) {
    console.error("[portal/auth/register]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
