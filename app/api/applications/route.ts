import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendApplicationNotification } from "@/lib/email/index";

/**
 * Record the outcome of the notification email against the lead.
 *
 * Both outcomes are recorded on purpose. Logging only failures leaves a
 * notification path that silently stops being called looking healthy, so
 * the question that actually matters, "when did a notification last
 * succeed", would have no answer. Writing the event can never fail the
 * submission: the lead is already saved by the time this runs.
 */
async function recordNotificationOutcome(
  outcome: "sent" | "failed",
  detail: Record<string, unknown>
) {
  try {
    await prisma.event.create({
      data: {
        type: `application_notification_${outcome}`,
        path: "/api/applications",
        meta: JSON.stringify(detail),
      },
    });
  } catch (logErr) {
    console.error("[applications] could not record notification outcome", logErr);
  }
}

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

    // Notify the club inbox (Stephie). An email failure never fails the
    // submission, because the lead is already saved. It is recorded instead
    // of swallowed, so a broken notification path is visible.
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
      await recordNotificationOutcome("sent", {
        tier,
        applicant: email.toLowerCase(),
      });
    } catch (mailErr) {
      const message =
        mailErr instanceof Error ? mailErr.message : String(mailErr);
      console.error("[applications] notification email failed", mailErr);
      await recordNotificationOutcome("failed", {
        tier,
        applicant: email.toLowerCase(),
        error: message,
      });
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
