export { resend, FROM, sendWelcomeEmail, sendStreakRiskEmail, sendWeeklyRecapEmail } from "@/lib/email";
import { resend, FROM } from "@/lib/email";
import {
  paymentFailedEmailHtml,
  cancellationConfirmedEmailHtml,
  applicationNotificationEmailHtml,
  type ApplicationNotification,
} from "./templates";

// Where new Step-In / intake submissions are emailed. Defaults to Stephie.
const APPLICATION_NOTIFY_TO = (
  process.env.APPLICATION_NOTIFY_TO ?? "stephie@badgirlstrength.club"
).trim();

/**
 * Emails a new intake/application submission to the club inbox (Stephie).
 * Reply-to is set to the applicant so a reply reaches them directly.
 * Throws if Resend is not configured or the send fails, so the caller can log it.
 */
export async function sendApplicationNotification(app: ApplicationNotification): Promise<void> {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_API_KEY.trim() || process.env.RESEND_API_KEY.includes("placeholder")) {
    throw new Error("RESEND_API_KEY is not configured; intake email was not sent.");
  }

  await resend.emails.send({
    from: FROM,
    to: APPLICATION_NOTIFY_TO,
    replyTo: app.email,
    subject: `New BGSC intake: ${app.name}${app.location ? ` (${app.location})` : ""}`,
    html: applicationNotificationEmailHtml(app),
  });
}

export async function sendPaymentFailedEmail(email: string, name: string, amount: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Action required: payment failed for your BGSC membership",
    html: paymentFailedEmailHtml(name, amount),
  });
}

export async function sendCancellationConfirmedEmail(email: string, name: string, expiresAt: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your BGSC membership has been cancelled",
    html: cancellationConfirmedEmailHtml(name, expiresAt),
  });
}
