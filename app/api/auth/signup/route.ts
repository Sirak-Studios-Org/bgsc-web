import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, getConfig } from "@/lib/db";
import { signMemberToken, MEMBER_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const config = await getConfig();
    const trialDays = parseInt(config.trial_days ?? "7", 10);
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: bcrypt.hashSync(password, 10),
        trialEnd,
      },
    });

    await prisma.emailQueue.createMany({
      data: [
        { userId: user.id, templateName: "welcome", scheduledFor: now },
        { userId: user.id, templateName: "nurture_start", scheduledFor: trialEnd },
      ],
    });

    // Log the new member in and send them into the in-app portal (onboarding),
    // rather than bouncing them off-platform to the legacy Passion.io site.
    const token = signMemberToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      plan: "trial",
      planExpiry: trialEnd.toISOString(),
      onboardingComplete: false,
    });

    const res = NextResponse.json({ success: true, redirect: "/portal/onboarding" });
    res.cookies.set(MEMBER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
