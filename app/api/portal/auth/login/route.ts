import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signMemberToken, MEMBER_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, include: { subscription: true } });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const sub = user.subscription;
    const plan = sub?.plan ?? "trial";
    const planExpiry = sub?.currentPeriodEnd?.toISOString() ?? null;
    const onboarding = await prisma.onboardingResponse.findUnique({ where: { userId: user.id } });

    const token = signMemberToken({ userId: user.id, email: user.email, name: user.name, plan: plan as "club"|"premium"|"vip"|"trial"|"free", planExpiry, onboardingComplete: !!onboarding });
    const res = NextResponse.json({ success: true, onboardingComplete: !!onboarding });
    res.cookies.set(MEMBER_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (err) {
    console.error("[portal/auth/login]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
