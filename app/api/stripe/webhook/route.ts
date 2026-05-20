import { NextRequest, NextResponse } from "next/server";
import { stripe, priceIdToPlan } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0]?.price.id ?? "";
        const plan = priceIdToPlan(priceId);
        const customerId = session.customer as string;
        const email = session.customer_details?.email ?? "";
        const name = session.metadata?.name ?? "";

        const periodEnd = sub.items.data[0]?.current_period_end ?? Math.floor(Date.now() / 1000) + 2592000;
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          const bcrypt = await import("bcryptjs");
          const hash = await bcrypt.hash(Math.random().toString(36), 10);
          user = await prisma.user.create({ data: { email, name, passwordHash: hash, trialEnd: new Date(periodEnd * 1000) } });
        }

        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: { userId: user.id, stripeSubscriptionId: sub.id, stripePriceId: priceId, stripeCustomerId: customerId, plan, status: "active", currentPeriodEnd: new Date(periodEnd * 1000) },
          update: { stripeSubscriptionId: sub.id, stripePriceId: priceId, plan, status: "active", currentPeriodEnd: new Date(periodEnd * 1000) },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id ?? "";
        const plan = priceIdToPlan(priceId);
        const periodEnd = sub.items.data[0]?.current_period_end ?? Math.floor(Date.now() / 1000) + 2592000;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { plan, status: sub.status as string, currentPeriodEnd: new Date(periodEnd * 1000), cancelAtPeriodEnd: sub.cancel_at_period_end },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({ where: { stripeSubscriptionId: sub.id }, data: { status: "canceled" } });
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const subId = (inv.parent?.subscription_details as { subscription?: string } | null)?.subscription;
        if (subId) {
          await prisma.subscription.updateMany({ where: { stripeSubscriptionId: subId }, data: { status: "past_due" } });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        const subId = (inv.parent?.subscription_details as { subscription?: string } | null)?.subscription;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const periodEnd = sub.items.data[0]?.current_period_end ?? Math.floor(Date.now() / 1000) + 2592000;
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { status: "active", currentPeriodEnd: new Date(periodEnd * 1000) },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("[stripe/webhook]", err);
  }

  return NextResponse.json({ received: true });
}
