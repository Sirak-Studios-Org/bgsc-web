import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, PLANS, priceIdToPlan } from "@/lib/stripe";

const ANNUAL_PRICE: Record<string, string> = {
  club: PLANS.club_annual,
  premium: PLANS.premium_annual,
  vip: PLANS.vip_annual,
};

export async function POST() {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const plan = priceIdToPlan(subscription.stripePriceId ?? "");
  const annualPriceId = ANNUAL_PRICE[plan];

  if (!annualPriceId) {
    return NextResponse.json({ error: "No annual plan available for this tier" }, { status: 400 });
  }

  if (subscription.stripePriceId === annualPriceId) {
    return NextResponse.json({ error: "Already on annual billing" }, { status: 400 });
  }

  const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
  const itemId = stripeSub.items.data[0]?.id;

  if (!itemId) {
    return NextResponse.json({ error: "Subscription item not found" }, { status: 500 });
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [{ id: itemId, price: annualPriceId }],
    proration_behavior: "create_prorations",
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { stripePriceId: annualPriceId, plan },
  });

  return NextResponse.json({ success: true });
}
