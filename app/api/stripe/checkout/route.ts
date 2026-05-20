import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { priceKey, email, name } = await req.json();
    const priceId = PLANS[priceKey as keyof typeof PLANS];
    if (!priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email ?? undefined,
      metadata: { name: name ?? "" },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/portal/register?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#pricing`,
      subscription_data: { metadata: { priceKey } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
