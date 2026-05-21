import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendCancellationConfirmedEmail } from "@/lib/email/index";

export async function POST(req: Request) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as { reason?: string; offer?: "pause" | "discount" | "extend" };
  const { offer } = body;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.userId },
    include: { user: true },
  });

  if (!subscription?.stripeSubscriptionId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  if (offer === "pause") {
    const pauseUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
      pause_collection: { behavior: "void" },
    });
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "paused", pauseUntil, cancelAtPeriodEnd: false },
    });
    return NextResponse.json({ success: true, effectiveDate: pauseUntil.toISOString() });
  }

  if (offer === "discount") {
    const coupon = await stripe.coupons.create({
      percent_off: 50,
      duration: "repeating",
      duration_in_months: 2,
      name: "COMEBACK50",
    });
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      discounts: [{ coupon: coupon.id }],
    });
    return NextResponse.json({ success: true, effectiveDate: subscription.currentPeriodEnd.toISOString() });
  }

  if (offer === "extend") {
    const currentEnd = subscription.currentPeriodEnd;
    const newEnd = new Date(currentEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      trial_end: Math.floor(newEnd.getTime() / 1000),
      proration_behavior: "none",
    });
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { currentPeriodEnd: newEnd },
    });
    return NextResponse.json({ success: true, effectiveDate: newEnd.toISOString() });
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { cancelAtPeriodEnd: true },
  });

  try {
    await sendCancellationConfirmedEmail(
      subscription.user.email,
      subscription.user.name,
      subscription.currentPeriodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    );
  } catch {}

  return NextResponse.json({ success: true, effectiveDate: subscription.currentPeriodEnd.toISOString() });
}
