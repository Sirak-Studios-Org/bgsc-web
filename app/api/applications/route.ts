import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendApplicationNotification } from "@/lib/email/index";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tier = String(body.tier ?? "immersed").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = body.phone ? String(body.phone).trim() : null;
    const location = body.location ? String(body.location).trim() : null;
    const trainingHistory = body.training_history
      ? String(body.training_history).trim()
      : null;
    const goals = body.goals ? String(body.goals).trim() : null;
    const whyNow = body.why_now ? String(body.why_now).trim() : null;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 }
      );
    }

    await prisma.application.create({
      data: {
        tier,
        name,
        email: email.toLowerCase(),
        phone,
        location,
        trainingHistory,
        goals,
        whyNow,
      },
    });

    // Notify the club inbox (Stephie). Never let an email failure fail the
    // submission — the record is already saved, so we log and move on.
    try {
      await sendApplicationNotification({
        tier,
        name,
        email: email.toLowerCase(),
        phone,
        location,
        trainingHistory,
        goals,
        whyNow,
        submittedAt: new Date(),
      });
    } catch (mailErr) {
      console.error("[applications] notification email failed", mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[applications]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
