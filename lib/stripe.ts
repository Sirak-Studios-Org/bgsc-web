import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});

export const PLANS = {
  club_monthly:     process.env.STRIPE_PRICE_CLUB_MONTHLY ?? "",
  club_annual:      process.env.STRIPE_PRICE_CLUB_ANNUAL ?? "",
  premium_monthly:  process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "",
  premium_annual:   process.env.STRIPE_PRICE_PREMIUM_ANNUAL ?? "",
  vip_monthly:      process.env.STRIPE_PRICE_VIP_MONTHLY ?? "",
  vip_annual:       process.env.STRIPE_PRICE_VIP_ANNUAL ?? "",
} as const;

export function priceIdToPlan(priceId: string): "club" | "premium" | "vip" | "trial" {
  if (priceId === PLANS.club_monthly || priceId === PLANS.club_annual) return "club";
  if (priceId === PLANS.premium_monthly || priceId === PLANS.premium_annual) return "premium";
  if (priceId === PLANS.vip_monthly || priceId === PLANS.vip_annual) return "vip";
  return "trial";
}

export const PLAN_PRICES_CENTS = {
  club_monthly: 4999,
  club_annual: 47988,
  premium_monthly: 9999,
  premium_annual: 95988,
  vip_monthly: 29900,
  vip_annual: 299900,
};
