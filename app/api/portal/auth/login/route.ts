import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signMemberToken, MEMBER_COOKIE } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Subscription statuses that still grant paid-plan access.
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(`member-login:${clientIp(req)}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, include: { subscription: true } });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Deactivated accounts cannot sign in.
    if (user.isActive === false) {
      return NextResponse.json({ error: "This account has been deactivated. Contact support." }, { status: 403 });
    }

    const sub = user.subscription;
    // Only honor the paid plan while the subscription is active; otherwise the
    // member drops to trial-level access rather than keeping paid content.
    const plan = sub && ACTIVE_STATUSES.has(sub.status) ? sub.plan : "trial";
    const planExpiry = sub?.currentPeriodEnd?.toISOString() ?? null;
    const onboarding = await prisma.onboardingResponse.findUnique({ where: { userId: user.id } });

    const token = signMemberToken({ userId: user.id, email: user.email, name: user.name, plan: plan as "club"|"premium"|"vip"|"trial"|"free", planExpiry, onboardingComplete: !!onboarding });
    const res = NextResponse.json({ success: true, onboardingComplete: !!onboarding });
    res.cookies.set(MEMBER_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (err) {
    console.error("[portal/auth/login]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
