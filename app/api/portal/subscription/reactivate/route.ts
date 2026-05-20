import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  if (!subscription.cancelAtPeriodEnd && subscription.status !== "paused") {
    return NextResponse.json({ error: "Subscription is not scheduled to cancel" }, { status: 400 });
  }

  if (subscription.status === "paused") {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      pause_collection: "",
    } as Parameters<typeof stripe.subscriptions.update>[1]);
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "active", pauseUntil: null, cancelAtPeriodEnd: false },
    });
  } else {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false },
    });
  }

  return NextResponse.json({ success: true });
}
